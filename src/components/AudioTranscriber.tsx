import { useState, useRef } from 'react';
import { Button } from './ui/button';
import LoadingIndicator from './LoadingIndicator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';

export default function AudioTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          handleTranscription(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setTranscription('');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please ensure you have given permission.');
      }
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const result = await geminiService.transcribeAudio(audioBlob);
      setTranscription(result);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscription('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcribe Audio with Gemini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col items-center space-y-4">
            <Button onClick={handleToggleRecording} className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 013-3h0a3 3 0 013 3v5a3 3 0 01-3 3h0a3 3 0 01-3-3V8z" />
              </svg>
            </Button>
            <p className="text-sm text-muted-foreground">{isRecording ? 'Recording... Click to stop.' : 'Click to start recording.'}</p>
          </div>

          {(transcription || isLoading) && (
            <div className="mt-4 rounded-md border bg-gray-50 p-4">
              {isLoading && <LoadingIndicator />}
              {transcription && <p>{transcription}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
