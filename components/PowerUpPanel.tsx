import React from 'react';
import { Player, PowerUpType, GameState } from '../types';
import { getPowerUpById } from '../services/powerUpService';

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

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md p-2 rounded-full shadow-lg flex gap-2">
      {player.powerUps.map((powerUpId, index) => {
        const powerUp = getPowerUpById(powerUpId);
        if (!powerUp) return null;

        const isDisabled = isPowerUpDisabled(powerUpId);
        
        return (
          <button 
            key={`${powerUp.id}-${index}`}
            onClick={() => onUsePowerUp(powerUp.id)}
            disabled={isDisabled}
            className={`flex items-center gap-2 p-2 rounded-full transition-colors transform hover:scale-105 ${isDisabled ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            title={`${powerUp.name}: ${powerUp.description}`}
            aria-label={`Use ${powerUp.name}`}
          >
            <span className="text-2xl">{powerUp.emoji}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PowerUpPanel;
