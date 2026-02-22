import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService, GroundingSource } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function MapsGrounding() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Could not get your location. Please ensure location services are enabled.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleSearch = async () => {
    if (query) {
      setIsLoading(true);
      setResponse(null);
      setSources([]);
      try {
        const result = await geminiService.searchWithMaps(query, location);
        setResponse(result.text);
        setSources(result.sources);
      } catch (error) {
        console.error('Error with Google Maps grounding:', error);
        setResponse('Sorry, something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Location-Based Info with Google Maps</CardTitle>
      </CardHeader>
      <CardContent>
        {locationError && <p className="mb-4 text-sm text-red-500">{locationError}</p>}
        <div className="grid gap-4">
          <div>
            <label htmlFor="maps-query" className="block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="maps-query"
                id="maps-query"
                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Good Italian restaurants nearby"
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
