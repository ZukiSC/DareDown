import React from 'react';
import { Player, PowerUpType, GameState } from '../types';
import { getPowerUpById } from '../services/powerUpService';
import { playSound } from '../services/audioService';

interface PowerUpPanelProps {
  player: Player;
  onUsePowerUp: (powerUpId: PowerUpType) => void;
  gameState: GameState;
  isLoser: boolean;
}

const PowerUpPanel: React.FC<PowerUpPanelProps> = ({ player, onUsePowerUp, gameState, isLoser }) => {
  if (player.powerUps.length === 0) {
    return null;
  }
  
  const isPowerUpDisabled = (powerUpId: PowerUpType): boolean => {
      switch(powerUpId) {
          case 'EXTRA_TIME':
              return gameState !== GameState.MINIGAME;
          case 'SKIP_DARE':
              return gameState !== GameState.DARE_SCREEN || !isLoser;
          case 'SWAP_CATEGORY':
              return gameState !== GameState.LEADERBOARD;
          default:
              return true;
      }
  }

  const handleUse = (powerUpId: PowerUpType) => {
    playSound('powerUp');
    onUsePowerUp(powerUpId);
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full shadow-lg flex gap-1">
      {player.powerUps.map((powerUpId, index) => {
        const powerUp = getPowerUpById(powerUpId);
        if (!powerUp) return null;

        const isDisabled = isPowerUpDisabled(powerUpId);
        
        return (
          <button 
            key={`${powerUp.id}-${index}`}
            onClick={() => handleUse(powerUp.id)}
            disabled={isDisabled}
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all transform ${isDisabled ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 hover:scale-105'}`}
            title={`${powerUp.name}: ${powerUp.description}`}
            aria-label={`Use ${powerUp.name}`}
          >
            <span className="text-xl sm:text-2xl">{powerUp.emoji}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PowerUpPanel;
