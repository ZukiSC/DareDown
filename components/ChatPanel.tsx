import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ChatMessageItem from './ChatMessage';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  currentPlayerId: string;
  onClose?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onReactToMessage, currentPlayerId, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="w-full h-full lg:w-80 lg:h-[85vh] bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col p-3">
      <div className="flex justify-between items-center mb-3 border-b border-purple-500/30 pb-2">
         <h2 className="text-xl font-bold text-purple-400 text-center flex-grow">Room Chat</h2>
         {onClose && (
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
         )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.map(msg => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onReact={onReactToMessage}
            currentPlayerId={currentPlayerId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say something..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          maxLength={120}
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-2 rounded-lg transition-colors">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;