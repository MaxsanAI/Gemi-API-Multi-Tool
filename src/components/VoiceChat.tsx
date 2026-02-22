import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export default function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setIsRecording(false);
      setTranscript('');
    } else {
      // Start recording
      setIsConnecting(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        audioContextRef.current = new (window.AudioContext)();

        const session = await ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                const audioData = atob(message.serverContent.modelTurn.parts[0].inlineData.data);
                const audioBuffer = new Uint8Array(audioData.length);
                for (let i = 0; i < audioData.length; i++) {
                  audioBuffer[i] = audioData.charCodeAt(i);
                }
                const blob = new Blob([audioBuffer], { type: 'audio/pcm' });
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.play();
              }
              if (message.serverContent?.inputTranscription) {
                setTranscript(prev => prev + 'User: ' + message.serverContent.inputTranscription + '\n');
              }
              if (message.serverContent?.outputTranscription) {
                setTranscript(prev => prev + 'AI: ' + message.serverContent.outputTranscription + '\n');
              }
            },
            onclose: () => {
              console.log('Connection closed.');
            },
            onerror: (error) => {
              console.error('Connection error:', error);
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        });

        sessionRef.current = session;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const processor = audioContextRef.current.createScriptProcessor(1024, 1, 1);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
          }
          const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(pcmData.buffer) as any));
          if (sessionRef.current) {
            sessionRef.current.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
          }
        };

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
        processorRef.current = processor;

        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversational Voice App</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button onClick={handleToggleRecording} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : isRecording ? 'Stop Conversation' : 'Start Conversation'}
          </Button>
          <div className="mt-4 rounded-md border bg-gray-50 p-4 h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{transcript}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
