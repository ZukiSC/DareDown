import React from 'react';
import { Player, PowerUpType } from '../types';

interface LeaderboardProps {
  players: Player[];
  isEndOfGame: boolean;
  onUsePowerUp: (powerUpId: PowerUpType) => void;
  currentPlayer: Player;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, isEndOfGame, onUsePowerUp, currentPlayer }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const hasSwapCategory = currentPlayer.powerUps.includes('SWAP_CATEGORY');

  return (
    <div className="flex flex-col items-center h-full p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-6">
        {isEndOfGame ? 'Final Leaderboard' : 'Leaderboard'}
      </h1>
      {isEndOfGame && sortedPlayers.length > 0 && (
          <div className="text-center mb-6">
              <p className="text-2xl text-yellow-400">🏆 Winner 🏆</p>
              <p className="text-4xl font-bold">{sortedPlayers[0].name}</p>
          </div>
      )}
      <div className="w-full max-w-lg bg-gray-800/60 rounded-lg shadow-lg p-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 my-2 rounded-lg transition-all duration-300
              ${index === 0 ? 'bg-yellow-500/30 border-l-4 border-yellow-400' : ''}
              ${index === 1 ? 'bg-gray-400/30 border-l-4 border-gray-300' : ''}
              ${index === 2 ? 'bg-orange-600/30 border-l-4 border-orange-500' : ''}
              ${index > 2 ? 'bg-gray-700/50' : ''}`}
          >
            <div className="flex items-center">
              <span className="text-2xl font-bold w-10">{index + 1}</span>
              <p className="text-xl font-semibold">{player.name}</p>
            </div>
            <p className="text-xl font-bold text-purple-300">{player.score} pts</p>
          </div>
        ))}
      </div>
      {!isEndOfGame && (
          <div className="text-center mt-6">
            {hasSwapCategory && (
                <button 
                    onClick={() => onUsePowerUp('SWAP_CATEGORY')}
                    className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold"
                >
                   Use Power-Up: Swap Category 🔄
                </button>
            )}
            <p className="text-xl animate-pulse">Next round starting soon...</p>
          </div>
      )}
    </div>
  );
};

export default Leaderboard;
