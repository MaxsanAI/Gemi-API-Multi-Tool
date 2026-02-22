import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSpeech = async () => {
    if (text.trim()) {
      setIsLoading(true);
      setAudioUrl(null);
      try {
        const result = await geminiService.generateSpeech(text);
        const audioBlob = new Blob([result], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (error) {
        console.error('Error generating speech:', error);
        alert('Sorry, something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Speech with Gemini TTS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label htmlFor="text-to-speech" className="block text-sm font-medium text-gray-700">
              Text to Convert
            </label>
            <div className="mt-1">
              <textarea
                id="text-to-speech"
                name="text-to-speech"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter text to generate speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerateSpeech} disabled={!text || isLoading}>
            {isLoading ? 'Generating...' : 'Generate Speech'}
          </Button>

          {audioUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">Generated Audio</h3>
              <audio controls autoPlay src={audioUrl} className="mt-2 w-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
