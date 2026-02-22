import { useState } from 'react';
import { Button } from './ui/button';
import LoadingIndicator from './LoadingIndicator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

type Model = 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function GeneralIntelligence() {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [model, setModel] = useState<Model>('gemini-3-flash-preview');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (prompt.trim()) {
      const newConversation: ChatMessage[] = [...conversation, { role: 'user', content: prompt }];
      setConversation(newConversation);
      setPrompt('');
      setIsLoading(true);

      try {
        const response = await geminiService.generalChat(prompt, model);
        setConversation([...newConversation, { role: 'model', content: response }]);
      } catch (error) {
        console.error('Error with general chat:', error);
        setConversation([...newConversation, { role: 'model', content: 'Sorry, something went wrong. Please try again.' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini General Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium">Select Model:</p>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="model"
                value="gemini-3-flash-preview"
                checked={model === 'gemini-3-flash-preview'}
                onChange={() => setModel('gemini-3-flash-preview')}
              />
              <span className="ml-2">Flash (Fast)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="model"
                value="gemini-3.1-pro-preview"
                checked={model === 'gemini-3.1-pro-preview'}
                onChange={() => setModel('gemini-3.1-pro-preview')}
              />
              <span className="ml-2">Pro (Complex)</span>
            </label>
          </div>

          <div className="mt-4 h-96 overflow-y-auto rounded-md border bg-gray-50 p-4 flex flex-col space-y-4">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-prose rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
             {isLoading && <LoadingIndicator />}
          </div>

          <div className="mt-4 flex rounded-md shadow-sm">
            <textarea
              name="chat-prompt"
              id="chat-prompt"
              rows={3}
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Ask Gemini anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!prompt || isLoading} className="rounded-l-none h-auto">
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
