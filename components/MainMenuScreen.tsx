import React from 'react';
import { useSocialStore } from '../stores/SocialStore';
import PlayerAvatar from './PlayerAvatar';
import XPBar from './XPBar';

interface MainMenuScreenProps {
  onCreateLobby: () => void;
  onJoinLobby: () => void;
  onViewHallOfFame: () => void;
  onViewCommunityDares: () => void;
  onViewDarePass: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onCreateLobby, onJoinLobby, onViewHallOfFame, onViewCommunityDares, onViewDarePass }) => {
  const { currentPlayer } = useSocialStore();
  
  return (
    <div className="flex flex-col h-full items-center justify-between text-center p-4 animate-fade-in">
      {/* Player Progression Section */}
      {currentPlayer && (
        <div className="w-full max-w-sm bg-gray-800/50 p-3 rounded-xl border border-purple-500/30 flex items-center gap-4">
          <div className="w-16 h-16 flex-shrink-0">
             <PlayerAvatar player={currentPlayer} isCurrentPlayer={false} className="bg-transparent" />
          </div>
          <div className="flex-grow text-left">
            <h2 className="text-lg font-bold">{currentPlayer.name}</h2>
            <XPBar level={currentPlayer.level} xp={currentPlayer.xp} xpToNextLevel={currentPlayer.xpToNextLevel} />
          </div>
        </div>
      )}

      {/* Title */}
      <div className="my-4">
          <h1 className="text-6xl md:text-8xl font-bold text-purple-400 drop-shadow-lg">
            DareDown
          </h1>
          <p className="text-lg md:text-xl text-gray-300">The ultimate party game of dares and challenges.</p>
      </div>
      
      {/* Menu Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onCreateLobby}
          className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Create Lobby
        </button>
        <button
          onClick={onJoinLobby}
          className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Join Lobby
        </button>
         <button
          onClick={onViewDarePass}
          className="py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Dare Pass ✨
        </button>
         <button
          onClick={onViewHallOfFame}
          className="py-2 px-6 bg-yellow-500/90 hover:bg-yellow-500 text-white font-semibold text-md rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Hall of Fame 🏆
        </button>
        <button
          onClick={onViewCommunityDares}
          className="py-2 px-6 bg-blue-500/90 hover:bg-blue-500 text-white font-semibold text-md rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Community Dares 📦
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;