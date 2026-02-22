import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { geminiService } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function FastChat() {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (prompt.trim()) {
      const newConversation: ChatMessage[] = [...conversation, { role: 'user', content: prompt }];
      setConversation(newConversation);
      setPrompt('');
      setIsLoading(true);

      try {
        const response = await geminiService.fastChat(prompt);
        setConversation([...newConversation, { role: 'model', content: response }]);
      } catch (error) {
        console.error('Error with fast chat:', error);
        setConversation([...newConversation, { role: 'model', content: 'Sorry, something went wrong. Please try again.' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fast AI Responses with Flash-Lite</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="mt-4 h-96 overflow-y-auto rounded-md border bg-gray-50 p-4 flex flex-col space-y-4">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-prose rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
             {isLoading && <div className="self-start rounded-lg px-4 py-2 bg-gray-200 text-gray-800"><p>Thinking...</p></div>}
          </div>

          <div className="mt-4 flex rounded-md shadow-sm">
            <textarea
              name="chat-prompt-fast"
              id="chat-prompt-fast"
              rows={3}
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Ask a quick question..."
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
