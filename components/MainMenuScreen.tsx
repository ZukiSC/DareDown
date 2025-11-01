import React from 'react';
import { useSocialStore } from '../stores/SocialStore';
import PlayerAvatar from './PlayerAvatar';
import XPBar from './XPBar';

interface MainMenuScreenProps {
  onCreateLobby: () => void;
  onJoinLobby: () => void;
  onViewProfile: (playerId: string) => void;
  onQuickStart: () => void;
  onLogout: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onCreateLobby, onJoinLobby, onViewProfile, onQuickStart, onLogout }) => {
  const { currentPlayer } = useSocialStore();

  if (!currentPlayer) return null; // Should not happen if rendered correctly

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 animate-fade-in">
      {/* Player Progression Section */}
      <div className="w-full max-w-sm relative">
         <div 
          onClick={() => onViewProfile(currentPlayer.id)}
          className="w-full bg-gray-800/50 p-3 rounded-xl border border-purple-500/30 flex items-center gap-4 animate-slide-down cursor-pointer hover:bg-purple-900/40 transition-colors"
        >
          <div className="w-16 h-16 flex-shrink-0">
             <PlayerAvatar player={currentPlayer} isCurrentPlayer={false} className="bg-transparent" />
          </div>
          <div className="flex-grow text-left">
            <h2 className="text-lg font-bold">{currentPlayer.name}</h2>
            <XPBar level={currentPlayer.level} xp={currentPlayer.xp} xpToNextLevel={currentPlayer.xpToNextLevel} />
          </div>
        </div>
        <button onClick={onLogout} title="Logout" className="absolute top-2 right-2 p-1.5 text-sm bg-red-600/80 hover:bg-red-600 rounded-full transition-colors transform active:scale-95 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        </button>
      </div>

      {/* Title & Primary Actions */}
      <div className="flex flex-col items-center gap-8 my-auto animate-pop-in">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-purple-400 drop-shadow-lg">
              DareDown
            </h1>
            <p className="text-lg md:text-xl text-gray-300">The ultimate party game of dares and challenges.</p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {currentPlayer.isAdmin && (
                <button
                onClick={onQuickStart}
                className="py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
                >
                🚀 Quick Start
                </button>
            )}
            <button
              onClick={onCreateLobby}
              className="py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100 animate-pulse"
            >
              Create Lobby
            </button>
            <button
              onClick={onJoinLobby}
              className="py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
            >
              Join Lobby
            </button>
          </div>
      </div>
      
      {/* Spacer to push content up */}
      <div className="h-16"></div>
    </div>
  );
};

export default MainMenuScreen;