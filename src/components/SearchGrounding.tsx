import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService, GroundingSource } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function SearchGrounding() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (query) {
      setIsLoading(true);
      setResponse(null);
      setSources([]);
      try {
        const result = await geminiService.searchWithGoogle(query);
        setResponse(result.text);
        setSources(result.sources);
      } catch (error) {
        console.error('Error with Google Search grounding:', error);
        setResponse('Sorry, something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Up-to-Date Info with Google Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="search-query"
                id="search-query"
                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Who won the last Super Bowl?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={!query || isLoading} className="rounded-l-none">
                {isLoading ? 'Searching...' : 'Ask'}
              </Button>
            </div>
          </div>

          {(response || isLoading) && (
            <div className="mt-4 rounded-md border bg-gray-50 p-4">
              {isLoading && <p>Searching for answers...</p>}
              {response && <ReactMarkdown>{response}</ReactMarkdown>}
              {sources.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Sources:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {sources.map((source, index) => (
                      <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
