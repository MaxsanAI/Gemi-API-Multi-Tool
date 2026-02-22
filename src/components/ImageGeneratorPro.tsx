import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import LoadingIndicator from './LoadingIndicator';
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

type ImageSize = '1K' | '2K' | '4K';
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export default function ImageGeneratorPro() {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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

  const handleGenerateImage = async () => {
    if (prompt) {
      setIsLoading(true);
      setGeneratedImage(null);
      setError(null);
      try {
        const base64Image = await geminiService.generateImagePro(prompt, imageSize, aspectRatio);
        setGeneratedImage(`data:image/png;base64,${base64Image}`);
      } catch (err: any) {
        console.error('Error generating image:', err);
        setError('Failed to generate image. Please try again.');
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
          <CardTitle>Generate Images with Nano Banana Pro</CardTitle>
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
        <CardTitle>Generate Images with Nano Banana Pro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="prompt-pro" className="block text-sm font-medium text-gray-700">
              Prompt
            </label>
            <div className="mt-1">
              <textarea
                name="prompt-pro"
                id="prompt-pro"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='A robot holding a red skateboard.'
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Image Size</label>
              <div className="mt-2 flex space-x-4">
                {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                  <label key={size} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="imageSize"
                      value={size}
                      checked={imageSize === size}
                      onChange={() => setImageSize(size)}
                    />
                    <span className="ml-2">{size}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aspect Ratio</label>
              <select
                id="aspect-ratio"
                name="aspect-ratio"
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              >
                <option value="1:1">1:1</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
          </div>

          <Button onClick={handleGenerateImage} disabled={!prompt || isLoading}>
            Generate Image
          </Button>

          {isLoading && <LoadingIndicator />}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {generatedImage && (
            <div>
              <h3 className="text-lg font-medium">Generated Image</h3>
              <img src={generatedImage} alt="Generated" className="mx-auto mt-4 w-full rounded-md" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
