import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type AspectRatio = '16:9' | '9:16';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    await window.aistudio.openSelectKey();
    setApiKeySelected(true);
  };

  const handleGenerateVideo = async () => {
    if (prompt) {
      setIsLoading(true);
      setGeneratedVideo(null);
      setError(null);
      try {
        const url = await geminiService.generateVideoFromPrompt(prompt, aspectRatio);
        setGeneratedVideo(url);
      } catch (err: any) {
        console.error('Error generating video:', err);
        setError('Failed to generate video. Please try again.');
        if (err.message.includes('Requested entity was not found')) {
          setError('API Key is invalid. Please select a valid API key.');
          setApiKeySelected(false);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!apiKeySelected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompt-Based Video Generation with Veo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This feature requires a paid Google AI API key. Please select a key from a project with billing enabled.</p>
          <p className="mb-4 text-sm text-muted-foreground">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">billing documentation</a>.</p>
          <Button onClick={handleSelectApiKey}>Select API Key</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt-Based Video Generation with Veo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-700">
              Prompt
            </label>
            <div className="mt-1">
              <textarea
                name="prompt-video"
                id="prompt-video"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='A neon hologram of a cat driving at top speed'
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Aspect Ratio</label>
            <div className="mt-2 flex space-x-4">
              {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                <label key={ratio} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="aspectRatio"
                    value={ratio}
                    checked={aspectRatio === ratio}
                    onChange={() => setAspectRatio(ratio)}
                  />
                  <span className="ml-2">{ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerateVideo} disabled={!prompt || isLoading}>
            Generate Video
          </Button>

          {isLoading && <LoadingIndicator />}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {generatedVideo && (
            <div>
              <h3 className="text-lg font-medium">Generated Video</h3>
              <video src={generatedVideo} controls autoPlay loop className="mx-auto mt-4 h-auto w-full max-w-md rounded-md" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
