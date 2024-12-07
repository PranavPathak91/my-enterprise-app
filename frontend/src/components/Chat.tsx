import React, { useState } from 'react';
import { 
  PaperClipIcon, 
  GlobeAltIcon, 
  MicrophoneIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const ChatActionButton = ({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>, label: string }) => (
  <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
    <Icon className="h-6 w-6 text-gray-600 mb-1" />
    <span className="text-xs text-gray-600">{label}</span>
  </button>
);

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="p-4 border-b text-center">
        <h1 className="text-2xl font-bold text-gray-800">Interview Preparation Assistant</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <h2 className="text-3xl font-semibold mb-4">What can I help with?</h2>
            <p>Start a conversation about interview preparation</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-100 rounded-lg">
              {msg}
            </div>
          ))
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex justify-center space-x-4 p-4 border-t">
        <ChatActionButton icon={SparklesIcon} label="Create image" />
        <ChatActionButton icon={DocumentTextIcon} label="Summarize text" />
        <ChatActionButton icon={CodeBracketIcon} label="Code" />
        <ChatActionButton icon={SparklesIcon} label="Surprise me" />
        <ChatActionButton icon={ChartBarIcon} label="Analyze data" />
        <button className="text-xs text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
          More
        </button>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t flex items-center space-x-2">
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
          <PaperClipIcon className="h-6 w-6" />
        </button>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
          <GlobeAltIcon className="h-6 w-6" />
        </button>
        <div className="flex-grow">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything about interview preparation..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
          <MicrophoneIcon className="h-6 w-6" />
        </button>
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;