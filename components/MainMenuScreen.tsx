import React from 'react';
import { useSocialStore } from '../stores/SocialStore';
import PlayerAvatar from './PlayerAvatar';
import XPBar from './XPBar';

interface MainMenuScreenProps {
  onCreateLobby: () => void;
  onJoinLobby: () => void;
  onQuickPlay: () => void;
  onViewHallOfFame: () => void;
  onViewCommunityDares: () => void;
  onViewDarePass: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onCreateLobby, onJoinLobby, onQuickPlay, onViewHallOfFame, onViewCommunityDares, onViewDarePass }) => {
  const { currentPlayer } = useSocialStore();
  
  const NavButton: React.FC<{onClick: () => void, icon: string, label: string}> = ({ onClick, icon, label }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group"
    >
      <div className="p-3 bg-gray-700/50 group-hover:bg-purple-600/60 rounded-full transition-colors">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 animate-fade-in">
      {/* Player Progression Section */}
      {currentPlayer && (
        <div className="w-full max-w-sm bg-gray-800/50 p-3 rounded-xl border border-purple-500/30 flex items-center gap-4 animate-slide-down">
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
              onClick={onQuickPlay}
              className="py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100 animate-pulse"
            >
              Quick Play ⚡
            </button>
            <div className="grid grid-cols-2 gap-4">
               <button
                  onClick={onCreateLobby}
                  className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
                >
                  Create Lobby
                </button>
                <button
                  onClick={onJoinLobby}
                  className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
                >
                  Join Lobby
                </button>
            </div>
          </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="w-full max-w-sm flex justify-around items-center p-2 bg-gray-900/60 backdrop-blur-sm rounded-full border border-purple-500/30 animate-slide-in-bottom">
        <NavButton onClick={onViewDarePass} icon="✨" label="Dare Pass" />
        <NavButton onClick={onViewHallOfFame} icon="🏆" label="Hall of Fame" />
        <NavButton onClick={onViewCommunityDares} icon="📦" label="Community" />
      </div>
    </div>
  );
};

export default MainMenuScreen;