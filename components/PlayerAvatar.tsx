import React, { useMemo } from 'react';
import { Player } from '../types';
import { getAvatarById, getColorById, getBadgeById } from '../services/customizationService';

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer: boolean;
  reaction?: string | null;
  isWinner?: boolean;
  onClick?: (playerId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentPlayer, reaction, isWinner, onClick, className, style }) => {
  const avatar = useMemo(() => getAvatarById(player.customization.avatarId), [player.customization.avatarId]);
  const color = useMemo(() => getColorById(player.customization.colorId), [player.customization.colorId]);
  const badge = useMemo(() => player.customization.badgeId ? getBadgeById(player.customization.badgeId) : null, [player.customization.badgeId]);
  
  // Treat undefined as online for robustness
  const isOnline = player.isOnline !== false;

  if (!avatar || !color) {
      return null;
  }

  const handleAvatarClick = () => {
    if(onClick) {
        onClick(player.id);
    }
  }

  const containerClasses = `relative flex flex-col items-center p-1 rounded-lg transition-all duration-300 w-full text-center
    ${isCurrentPlayer ? 'bg-purple-600/70' : 'bg-gray-700/50'}
    ${isWinner ? 'shadow-lg shadow-yellow-400/50 animate-glow' : ''}
    ${player.isHost && !isWinner ? 'animate-glow-host' : ''}
    ${onClick ? 'cursor-pointer hover:bg-purple-600/50' : ''}
    ${className || ''}`;

  return (
    <div className={containerClasses} onClick={handleAvatarClick} style={style}>
       {reaction && (
        <div 
          key={Date.now()}
          className="absolute -top-12 text-5xl animate-ping-once z-20"
        >
          {reaction}
        </div>
      )}
      <div className={`relative w-14 h-14 rounded-full ${color.primaryClass} mb-1 flex items-center justify-center text-3xl font-bold border-4 ${isCurrentPlayer ? color.secondaryClass : 'border-transparent'}`}>
        <span>{avatar.emoji}</span>

        {/* Online Status Indicator */}
        <span
          className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-gray-800 ${isOnline ? 'bg-green-400 animate-pulse-subtle' : 'bg-gray-500'}`}
          title={isOnline ? 'Online' : 'Offline'}
        ></span>

        {badge && (
          <span className="absolute -bottom-2 -right-2 text-xl bg-gray-800 rounded-full p-1" title={badge.name}>{badge.emoji}</span>
        )}
        {player.isHost && !isWinner && (
          <span className="absolute -top-2 -right-2 text-2xl" title="Host">👑</span>
        )}
         {isWinner && (
          <span className="absolute -top-3 -right-3 text-3xl" title="Winner">🏆</span>
        )}
      </div>
      <p className="font-semibold truncate w-full text-xs sm:text-sm">{player.name}</p>
      <p className="text-xs text-gray-400">Score: {player.score}</p>
    </div>
  );
};

export default PlayerAvatar;