
import React, { useMemo } from 'react';
import { Player } from '../types';
import { getAvatarById, getColorById, getBadgeTierDetails } from '../services/customizationService';

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer: boolean;
  reaction?: string | null;
  isWinner?: boolean;
  onClick?: (playerId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  isMuted?: boolean;
  isSpeaking?: boolean;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentPlayer, reaction, isWinner, onClick, className, style, isDraggable, onDragStart, isMuted, isSpeaking }) => {
  const avatar = useMemo(() => getAvatarById(player.customization.avatarId), [player.customization.avatarId]);
  const color = useMemo(() => getColorById(player.customization.colorId), [player.customization.colorId]);
  const badgeInfo = useMemo(() => {
    if (!player.customization.equippedBadge) return null;
    const { id, tier } = player.customization.equippedBadge;
    return getBadgeTierDetails(id, tier);
  }, [player.customization.equippedBadge]);
  
  // Treat undefined as online for robustness
  const isOnline = player.isOnline !== false;
  const isLegendary = player.customization.equippedBadge?.tier === 4;

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
    ${isSpeaking && !isMuted ? 'animate-glow-speaking' : ''}
    ${onClick && !isDraggable ? 'cursor-pointer hover:bg-purple-600/50' : ''}
    ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
    ${className || ''}`;

  return (
    <div 
        className={containerClasses} 
        onClick={handleAvatarClick} 
        style={style}
        draggable={isDraggable}
        onDragStart={onDragStart}
    >
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

        {isMuted && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-gray-800" title="Muted">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5l14 14" />
                </svg>
            </div>
        )}
        {/* Level Badge */}
        <span
          className="absolute -bottom-1 right-0 w-6 h-6 rounded-full bg-gray-800 border-2 border-purple-400 flex items-center justify-center text-xs font-bold"
          title={`Level ${player.level}`}
        >
          {player.level}
        </span>

        {badgeInfo && (
          <span 
            className={`absolute -bottom-2 -left-2 text-xl bg-gray-800 rounded-full p-1 ${isLegendary ? 'animate-glow-legendary' : ''}`} 
            title={badgeInfo.name}
          >
            {badgeInfo.emoji}
          </span>
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