import React from 'react';
import { useSocialStore } from '../stores/SocialStore';
import PlayerAvatar from './PlayerAvatar';
import XPBar from './XPBar';

interface MainMenuScreenProps {
  onCreateLobby: () => void;
  onViewProfile: (playerId: string) => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onCreateLobby, onViewProfile }) => {
  const { currentPlayer } = useSocialStore();

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 animate-fade-in">
      {/* Player Progression Section */}
      {currentPlayer && (
        <div 
          onClick={() => onViewProfile(currentPlayer.id)}
          className="w-full max-w-sm bg-gray-800/50 p-3 rounded-xl border border-purple-500/30 flex items-center gap-4 animate-slide-down cursor-pointer hover:bg-purple-900/40 transition-colors"
        >
          <div className="w-16 h-16 flex-shrink-0">
             <PlayerAvatar player={currentPlayer} isCurrentPlayer={false} className="bg-transparent" />
          </div>
          <div className="flex-grow text-left">
            <h2 className="text-lg font-bold">{currentPlayer.name}</h2>
            <XPBar level={currentPlayer.level} xp={currentPlayer.xp} xpToNextLevel={currentPlayer.xpToNextLevel} />
          </div>
        </div>
      )}

      {/* Title & Primary Actions */}
      <div className="flex flex-col items-center gap-8 my-auto animate-pop-in">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-purple-400 drop-shadow-lg">
              DareDown
            </h1>
            <p className="text-lg md:text-xl text-gray-300">The ultimate party game of dares and challenges.</p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={onCreateLobby}
              className="py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100 animate-pulse"
            >
              Create Lobby
            </button>
          </div>
      </div>
      
      {/* Spacer to push content up */}
      <div className="h-16"></div>
    </div>
  );
};

export default MainMenuScreen;