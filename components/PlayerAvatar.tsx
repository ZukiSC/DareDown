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

  const containerClasses = `relative group flex flex-col items-center p-2 rounded-lg transition-all duration-300 w-full sm:w-28 text-center
    ${isCurrentPlayer ? 'bg-purple-600/70' : 'bg-gray-700/50'}
    ${isWinner ? 'shadow-lg shadow-yellow-400/50 animate-glow' : ''}
    ${player.isHost && !isWinner ? 'animate-glow-host' : ''}
    ${onClick ? 'cursor-pointer hover:bg-purple-600/50' : ''}
    ${className || ''}`;

  return (
    <div className={containerClasses} onClick={handleAvatarClick} style={style}>
      {/* --- STATS TOOLTIP --- */}
      <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg shadow-2xl text-left opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-in-out pointer-events-none z-30">
        <h3 className="font-bold text-lg text-purple-300 mb-2 border-b border-purple-500/30 pb-1">{player.name}'s Stats</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Wins:</span>
            <span className="font-bold text-green-400">{player.stats.wins}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Dares Completed:</span>
            <span className="font-bold text-yellow-400">{player.stats.daresCompleted}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Dares Failed:</span>
            <span className="font-bold text-red-400">{player.stats.daresFailed}</span>
          </div>
        </div>
        {/* Tooltip Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/90"></div>
      </div>

       {reaction && (
        <div 
          key={Date.now()}
          className="absolute -top-12 text-5xl animate-ping-once z-20"
        >
          {reaction}
        </div>
      )}
      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ${color.primaryClass} mb-2 flex items-center justify-center text-3xl sm:text-4xl font-bold border-4 ${isCurrentPlayer ? color.secondaryClass : 'border-transparent'}`}>
        <span>{avatar.emoji}</span>

        {/* Online Status Indicator */}
        <span
          className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-gray-800 ${isOnline ? 'bg-green-400 animate-pulse-subtle' : 'bg-gray-500'}`}
          title={isOnline ? 'Online' : 'Offline'}
        ></span>

        {badge && (
          <span className="absolute -bottom-2 -right-2 text-xl sm:text-2xl bg-gray-800 rounded-full p-1" title={badge.name}>{badge.emoji}</span>
        )}
        {player.isHost && !isWinner && (
          <span className="absolute -top-2 -right-2 text-2xl sm:text-3xl" title="Host">👑</span>
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