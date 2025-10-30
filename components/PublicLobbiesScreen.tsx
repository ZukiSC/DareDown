import React from 'react';
import { PublicLobby } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface PublicLobbiesScreenProps {
  lobbies: PublicLobby[];
  onJoin: (lobbyId: string) => void;
  onQuickJoin: () => void;
  onRefresh: () => void;
  onGoBack: () => void;
}

const PublicLobbiesScreen: React.FC<PublicLobbiesScreenProps> = ({ lobbies, onJoin, onQuickJoin, onRefresh, onGoBack }) => {
  return (
    <div className="flex flex-col h-full w-full items-center p-2 sm:p-4 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-400 drop-shadow-lg">Public Lobbies</h1>
        <p className="text-md text-gray-300">Find a game and jump into the action!</p>
      </div>
      
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 mb-4">
        <button onClick={onQuickJoin} className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100">
          ⚡ Quick Join
        </button>
        <button onClick={onRefresh} className="sm:w-auto px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" />
          </svg>
        </button>
      </div>

      <div className="flex-grow w-full max-w-2xl overflow-y-auto pr-2 space-y-3">
        {lobbies.length > 0 ? (
          lobbies.map((lobby, index) => {
            const avatar = getAvatarById(lobby.hostCustomization.avatarId);
            const color = getColorById(lobby.hostCustomization.colorId);
            const canJoin = lobby.playerCount < lobby.maxPlayers;
            return (
              <div 
                key={lobby.id}
                className="bg-gray-700/60 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-in opacity-0"
                style={{ animationDelay: `${100 + index * 75}ms`}}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${color?.primaryClass} flex items-center justify-center text-3xl border-2 ${color?.secondaryClass}`}>
                    {avatar?.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{lobby.hostName}'s Lobby</p>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
                        <span>Category: <span className="font-semibold text-purple-300">{lobby.category}</span></span>
                        <span>Mode: <span className="font-semibold text-yellow-300">{lobby.dareMode}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="font-bold text-lg">{lobby.playerCount}/{lobby.maxPlayers}</p>
                        <p className="text-xs text-gray-400">Players</p>
                    </div>
                    <button
                        onClick={() => onJoin(lobby.id)}
                        disabled={!canJoin}
                        className={`px-6 py-2 font-bold rounded-lg shadow-md transition-all transform active:scale-95 ${canJoin ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                    >
                        Join
                    </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-5xl mb-4">💨</p>
            <h3 className="text-xl font-semibold">No Lobbies Found</h3>
            <p>Why not create one and be the host?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLobbiesScreen;