import { useState, useEffect } from 'react';

const messages = [
  'Analyzing your request...',
  'Contacting the AI model...',
  'Generating response...',
  'Finalizing the output...',
  'Almost there...',
];

export default function LoadingIndicator() {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="self-start rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
      <p>{message}</p>
    </div>
  );
}
