import React, { useState, useEffect, useRef } from 'react';
import { Player, PrivateChatMessage } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface PrivateChatWindowProps {
  friend: Player;
  messages: PrivateChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

const PrivateChatWindow: React.FC<PrivateChatWindowProps> = ({ friend, messages, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 175, y: window.innerHeight / 2 - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const friendAvatar = getAvatarById(friend.customization.avatarId);
  const friendColor = getColorById(friend.customization.colorId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div
      ref={windowRef}
      className="fixed z-50 w-80 h-[400px] bg-gray-800 rounded-xl shadow-2xl border border-purple-500/30 flex flex-col animate-pop-in"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-2 bg-gray-900/50 rounded-t-xl cursor-move"
      >
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${friendColor?.primaryClass} flex items-center justify-center text-lg`}>
                {friendAvatar?.emoji}
            </div>
            <span className="font-bold">{friend.name}</span>
        </div>
        <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
      </div>

      <div className="flex-grow overflow-y-auto p-3 space-y-3">
        {messages.map(msg => {
          const isMyMessage = msg.fromId !== friend.id;
          return (
             <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg ${isMyMessage ? 'bg-purple-700 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                   <p className="text-sm break-words">{msg.text}</p>
                </div>
             </div>
          );
        })}
         <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 flex gap-2 border-t border-gray-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          maxLength={120}
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 rounded-lg text-sm">Send</button>
      </form>
    </div>
  );
};

export default PrivateChatWindow;
