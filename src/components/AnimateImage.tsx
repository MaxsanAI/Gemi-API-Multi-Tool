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

export default function AnimateImage() {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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
    // Assume key selection is successful and proceed
    setApiKeySelected(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAnimateImage = async () => {
    if (image) {
      setIsLoading(true);
      setVideoUrl(null);
      setError(null);
      try {
        const base64Image = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        const url = await geminiService.animateImage(base64Image, mimeType);
        setVideoUrl(url);
      } catch (err: any) {
        console.error('Error animating image:', err);
        setError('Failed to animate image. Please try again.');
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
          <CardTitle>Animate Images with Veo</CardTitle>
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
        <CardTitle>Animate Images with Veo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="image-upload-veo" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
              <div className="space-y-1 text-center">
                 <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image-upload-veo" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input id="image-upload-veo" name="image-upload-veo" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {image && (
            <div>
              <img src={image} alt="Uploaded" className="mx-auto h-64 w-auto rounded-md" />
            </div>
          )}

          <Button onClick={handleAnimateImage} disabled={!image || isLoading}>
            Animate Image
          </Button>

          {isLoading && <LoadingIndicator />}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {videoUrl && (
            <div>
              <h3 className="text-lg font-medium">Generated Video</h3>
              <video src={videoUrl} controls autoPlay loop className="mx-auto mt-4 h-auto w-full max-w-md rounded-md" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
