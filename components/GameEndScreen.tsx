import React from 'react';
import { Player } from '../types';
import Confetti from './Confetti';
import PlayerAvatar from './PlayerAvatar';

interface GameEndScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
  xpSummary: { reason: string, amount: number }[];
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({ players, onPlayAgain, onReturnToMenu, xpSummary }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

  const totalXp = xpSummary.reduce((sum, item) => sum + item.amount, 0);

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

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl my-4">
        {/* Leaderboard */}
        <div className="w-full md:w-2/3 bg-gray-800/60 rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold text-center mb-2">Final Scores</h2>
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              style={{ animationDelay: `${500 + index * 100}ms`}}
              className={`flex items-center justify-between p-2 my-1 rounded-lg animate-slide-in opacity-0
                ${index === 0 ? 'bg-yellow-500/30' : ''}
                ${index > 0 ? 'bg-gray-700/50' : ''}`}
            >
              <div className="flex items-center">
                <span className="text-lg font-bold w-8">{index + 1}</span>
                <p className="text-md font-semibold">{player.name}</p>
              </div>
              <p className="text-md font-bold text-purple-300">{player.score} pts</p>
            </div>
          ))}
        </div>
        {/* XP Summary */}
        <div className="w-full md:w-1/3 bg-gray-800/60 rounded-lg shadow-lg p-4">
           <h2 className="text-xl font-bold text-center mb-2">XP Summary</h2>
           <div className="space-y-1 text-sm">
            {xpSummary.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-700/50 p-1.5 rounded">
                    <span>{item.reason}</span>
                    <span className="font-bold text-purple-300">+{item.amount} XP</span>
                </div>
            ))}
           </div>
           <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
                <span className="font-bold">Total</span>
                <span className="font-bold text-green-400">+{totalXp} XP</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mt-auto animate-slide-in-up" style={{ animationDelay: '800ms' }}>
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