import React, { useMemo } from 'react';
import { Player } from '../types';
import { getAvatarById, getColorById, getBadgeById } from '../services/customizationService';

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer: boolean;
  reaction?: string | null;
  isWinner?: boolean;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentPlayer, reaction, isWinner }) => {
  const avatar = useMemo(() => getAvatarById(player.customization.avatarId), [player.customization.avatarId]);
  const color = useMemo(() => getColorById(player.customization.colorId), [player.customization.colorId]);
  const badge = useMemo(() => player.customization.badgeId ? getBadgeById(player.customization.badgeId) : null, [player.customization.badgeId]);
  
  if (!avatar || !color) {
      return null; // or a fallback
  }

  return (
    <div className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 w-full sm:w-28 text-center
      ${isCurrentPlayer ? 'bg-purple-600/70' : 'bg-gray-700/50'}
      ${isWinner ? 'shadow-lg shadow-yellow-400/50' : ''}`}>
       {reaction && (
        <div 
          key={Date.now()} // Force re-render to restart animation
          className="absolute -top-12 text-5xl animate-ping-once z-20"
          style={{ animation: 'ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) forwards' }}
        >
          {reaction}
        </div>
      )}
      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ${color.primaryClass} mb-2 flex items-center justify-center text-3xl sm:text-4xl font-bold border-4 ${isCurrentPlayer ? color.secondaryClass : 'border-transparent'}`}>
        <span>{avatar.emoji}</span>
        {badge && (
          <span className="absolute -bottom-2 -right-2 text-xl sm:text-2xl bg-gray-800 rounded-full p-1" title={badge.name}>{badge.emoji}</span>
        )}
        {player.isHost && !isWinner && (
          <span className="absolute -top-2 -right-2 text-xl sm:text-2xl" title="Host">👑</span>
        )}
         {isWinner && (
          <span className="absolute -top-3 -right-3 text-3xl sm:text-4xl" title="Winner">🏆</span>
        )}
      </div>
      <p className="font-semibold truncate w-full text-sm sm:text-base">{player.name}</p>
      <p className="text-xs sm:text-sm text-gray-400">Score: {player.score}</p>
    </div>
  );
};

export default PlayerAvatar;

// Add this to your CSS or a style block in index.html for the animation
const animationStyle = document.createElement('style');
animationStyle.innerHTML = `
  @keyframes ping-once {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    80% {
      transform: scale(1.5);
      opacity: 0;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  .animate-ping-once {
    animation: ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) forwards;
  }
`;
document.head.appendChild(animationStyle);