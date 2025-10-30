import React from 'react';

interface EmojiReactionPanelProps {
  onReact: (emoji: string) => void;
}

const EMOJIS = ['😂', '🔥', '🤯', '👍', '😭'];

const EmojiReactionPanel: React.FC<EmojiReactionPanelProps> = ({ onReact }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full shadow-lg flex gap-1">
      {EMOJIS.map(emoji => (
        <button 
          key={emoji}
          onClick={() => onReact(emoji)}
          className="text-2xl sm:text-3xl p-1 rounded-full hover:bg-purple-500/50 transition-colors transform hover:scale-110 active:scale-100"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiReactionPanel;