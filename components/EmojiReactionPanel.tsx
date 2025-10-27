import React from 'react';

interface EmojiReactionPanelProps {
  onReact: (emoji: string) => void;
}

const EMOJIS = ['😂', '🔥', '🤯', '👍', '😭'];

const EmojiReactionPanel: React.FC<EmojiReactionPanelProps> = ({ onReact }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md p-2 rounded-full shadow-lg flex gap-2">
      {EMOJIS.map(emoji => (
        <button 
          key={emoji}
          onClick={() => onReact(emoji)}
          className="text-3xl p-2 rounded-full hover:bg-purple-500/50 transition-colors transform hover:scale-110"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiReactionPanel;
