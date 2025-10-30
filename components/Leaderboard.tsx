import React from 'react';
import { Player, Dare } from '../types';

interface LeaderboardProps {
  players: Player[];
  currentPlayer: Player;
  onViewProfile: (playerId: string) => void;
  currentDare: Dare | null;
  onViewReplay: (dareId: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayer, onViewProfile, currentDare, onViewReplay }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const showReplayButton = currentDare?.status === 'completed' && currentDare.replayUrl;

  const getTeamColor = (teamId: 'blue' | 'orange' | null) => {
    if (teamId === 'blue') return 'text-blue-400';
    if (teamId === 'orange') return 'text-orange-400';
    return '';
  }

  return (
    <div className="flex flex-col items-center h-full p-2">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">
        Leaderboard
      </h1>
      <div className="w-full max-w-lg bg-gray-800/60 rounded-lg shadow-lg p-2 sm:p-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            onClick={() => onViewProfile(player.id)}
            style={{ animationDelay: `${index * 100}ms`}}
            className={`flex items-center justify-between p-2 my-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-purple-500/20 animate-slide-in opacity-0
              ${index === 0 ? 'bg-yellow-500/30 border-l-4 border-yellow-400' : ''}
              ${index === 1 ? 'bg-gray-400/30 border-l-4 border-gray-300' : ''}
              ${index === 2 ? 'bg-orange-600/30 border-l-4 border-orange-500' : ''}
              ${index > 2 ? 'bg-gray-700/50' : ''}`}
          >
            <div className="flex items-center">
              <span className="text-xl font-bold w-8">{index + 1}</span>
              <p className={`text-lg font-semibold ${getTeamColor(player.teamId)}`}>{player.name}</p>
            </div>
            <p className="text-lg font-bold text-purple-300">{player.score} pts</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        {showReplayButton && (
            <button
                onClick={() => onViewReplay(currentDare.id)}
                className="mb-4 py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transform transition-transform active:scale-95"
            >
                Watch Last Dare's Replay ▶️
            </button>
        )}
        <p className="text-xl animate-pulse">Next round starting soon...</p>
      </div>
    </div>
  );
};

export default Leaderboard;