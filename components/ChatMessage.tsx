import React, { useMemo, useState } from 'react';
import { ChatMessage } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface ChatMessageItemProps {
  message: ChatMessage;
  onReact: (messageId: string, emoji: string) => void;
  currentPlayerId: string;
}

const REACTION_EMOJIS = ['👍', '😂', '❤️', '🤯', '😢'];

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onReact, currentPlayerId }) => {
  const [showPicker, setShowPicker] = useState(false);

  const avatar = useMemo(() => getAvatarById(message.playerCustomization.avatarId), [message.playerCustomization.avatarId]);
  const color = useMemo(() => getColorById(message.playerCustomization.colorId), [message.playerCustomization.colorId]);

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };
  
  const isMyMessage = message.playerId === currentPlayerId;

  return (
    <div className={`group relative flex items-start gap-2 animate-slide-in-bottom ${isMyMessage ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color?.primaryClass} flex items-center justify-center text-lg border-2 ${color?.secondaryClass}`}>
        {avatar?.emoji}
      </div>
      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2 rounded-lg ${isMyMessage ? 'bg-purple-700 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
          <p className={`text-xs font-bold ${isMyMessage ? 'text-right' : 'text-left'} text-purple-300`}>{message.playerName}</p>
          <p className="text-sm text-white break-words">{message.text}</p>
        </div>
        {Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 mt-1">
            {Object.entries(message.reactions).map(([emoji, playerIds]) => {
              // FIX: Cast playerIds from unknown to string[] as Object.entries can have loose typing.
              const reactors = playerIds as string[];
              if (reactors.length === 0) return null;
              const hasReacted = reactors.includes(currentPlayerId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${hasReacted ? 'bg-purple-600 border border-purple-400' : 'bg-gray-600/80 border border-transparent hover:bg-gray-600'}`}
                >
                  {emoji} {reactors.length}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reaction Picker */}
      <div className={`absolute top-0 ${isMyMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} hidden group-hover:flex items-center h-full px-2`}>
          <div className="relative">
             <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
                aria-label="React to message"
             >
                🙂
             </button>
             {showPicker && (
                <div className={`absolute bottom-full mb-1 ${isMyMessage ? 'right-0' : 'left-0'} bg-gray-800 p-1 rounded-full shadow-lg flex gap-1 animate-fade-in`}>
                   {REACTION_EMOJIS.map(emoji => (
                       <button
                          key={emoji}
                          onClick={() => handleReaction(emoji)}
                          className="text-xl p-1 rounded-full hover:bg-purple-600 transition-colors transform hover:scale-110"
                       >
                          {emoji}
                       </button>
                   ))}
                </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
