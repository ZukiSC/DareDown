import React from 'react';
import { Player } from '../types';
import Confetti from './Confetti';
import PlayerAvatar from './PlayerAvatar';

interface GameEndScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({ players, onPlayAgain, onReturnToMenu }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

  return (
    <div className="flex flex-col items-center w-full p-4 relative">
      <Confetti />
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-lg mb-4 animate-slide-down">
          Game Over!
        </h1>
        {winner && (
          <div className="flex flex-col items-center animate-pop-in" style={{ animationDelay: '300ms' }}>
            <p className="text-2xl text-yellow-400">🏆 WINNER 🏆</p>
            <div className="my-4">
              <PlayerAvatar player={winner} isCurrentPlayer={false} isWinner={true} />
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full max-w-lg bg-gray-800/60 rounded-lg shadow-lg p-4 my-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            style={{ animationDelay: `${500 + index * 100}ms`}}
            className={`flex items-center justify-between p-3 my-2 rounded-lg animate-slide-in opacity-0
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

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg animate-slide-in-up mt-auto" style={{ animationDelay: '800ms' }}>
        <button
          onClick={onPlayAgain}
          className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transform transition-transform active:scale-95"
        >
          Play Again
        </button>
        <button
          onClick={onReturnToMenu}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-lg shadow-lg transform transition-transform active:scale-95"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default GameEndScreen;