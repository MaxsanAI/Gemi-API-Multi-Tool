import { useState } from 'react';
import { Button } from './ui/button';
import LoadingIndicator from './LoadingIndicator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function ImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAnalyzeImage = async () => {
    if (image) {
      setIsLoading(true);
      setAnalysis(null);
      try {
        const base64Image = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        const result = await geminiService.analyzeImage(base64Image, mimeType);
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing image:', error);
        setAnalysis('Sorry, something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze Image with Gemini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="image-upload-analyzer" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image-upload-analyzer" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input id="image-upload-analyzer" name="image-upload-analyzer" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
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

          <Button onClick={handleAnalyzeImage} disabled={!image || isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </Button>

          {(analysis || isLoading) && (
            <div className="mt-4 rounded-md border bg-gray-50 p-4">
              {isLoading && <LoadingIndicator />}
              {analysis && <ReactMarkdown>{analysis}</ReactMarkdown>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
