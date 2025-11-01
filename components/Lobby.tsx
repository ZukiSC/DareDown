
import React, { useState, useEffect } from 'react';
import { Player, DareMode } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { useUIStore } from '../stores/UIStore';

interface LobbyProps {
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  onViewProfile: (playerId: string) => void;
  showNotification: (message: string, emoji?: string) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveLobby: () => void;
  maxRounds: number;
  onMaxRoundsChange: (rounds: number) => void;
  dareMode: DareMode;
  onDareModeChange: (mode: DareMode) => void;
  lobbyCode: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ 
  players, currentPlayer, onStartGame, onViewProfile, showNotification, onKickPlayer, 
  onLeaveLobby, maxRounds, onMaxRoundsChange, dareMode, onDareModeChange,
  lobbyCode
}) => {
  const [kickConfirmPlayer, setKickConfirmPlayer] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { activeReactions } = useUIStore();
  
  const canStart = currentPlayer.isHost && players.length >= 2;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      onStartGame();
      return;
    }
    const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timerId);
  }, [countdown, onStartGame]);


  const handleStartCountdown = () => { if (canStart && countdown === null) setCountdown(5); };
  const handleCancelCountdown = () => setCountdown(null);
  
  const handleAvatarClick = (player: Player) => {
    if (currentPlayer.isHost && player.id !== currentPlayer.id) {
      setKickConfirmPlayer(player);
    } else {
      onViewProfile(player.id);
    }
  };

  const confirmKick = () => {
    if (kickConfirmPlayer) {
      onKickPlayer(kickConfirmPlayer.id);
      setKickConfirmPlayer(null);
    }
  };

  const handleCopyCode = () => {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      showNotification('Lobby code copied!', '📋');
    }
  };

  const renderPlayerList = (list: Player[]) => (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 p-4 rounded-lg bg-gray-900/40">
      {list.map((player) => {
         const reaction = activeReactions.find(r => r.playerId === player.id)?.emoji;
        return <PlayerAvatar 
                    key={player.id} 
                    player={player} 
                    reaction={reaction} 
                    isCurrentPlayer={player.id === currentPlayer.id} 
                    onClick={() => handleAvatarClick(player)}
                />;
      })}
    </div>
  );

  const getStartButtonText = () => {
    if (players.length < 2) return `Waiting for more players... (${players.length}/2)`;
    return 'Start Game!';
  }

  return (
    <>
      <button onClick={onLeaveLobby} className="absolute top-2 left-2 text-sm px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded-full transition-colors transform active:scale-95 z-10">
          Leave Lobby
      </button>
      {currentPlayer.isHost && lobbyCode && (
        <div className="absolute top-2 right-2 bg-gray-900/80 p-2 rounded-lg text-center border border-purple-500/30">
          <p className="text-xs text-gray-400">LOBBY CODE</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold tracking-widest">{lobbyCode}</p>
            <button onClick={handleCopyCode} className="text-xl" title="Copy Code">📋</button>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full h-full items-center text-center p-1">
        <div className="pt-4 flex-shrink-0">
          <h1 className="text-4xl font-bold text-purple-400 drop-shadow-lg mb-1">Game Lobby</h1>
          <p className="text-md text-gray-300">Waiting for players to join...</p>
        </div>
        
        <div className="w-full flex-grow my-4 overflow-y-auto">
           {renderPlayerList(players)}
        </div>
        
        <div className="w-full p-4 bg-gray-800/80 backdrop-blur-sm border-t border-purple-500/30 flex-shrink-0">
          {currentPlayer.isHost ? (
            countdown !== null ? (
              <div className="w-full flex flex-col items-center gap-2">
                  <p className="text-3xl font-bold text-yellow-300 animate-pulse">Starting in {countdown}...</p>
                  <button onClick={handleCancelCountdown} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Cancel</button>
              </div>
            ) : (
               <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full grid grid-cols-2 gap-4 text-left">
                      {/* Max Rounds Setting */}
                      <div>
                          <label htmlFor="max-rounds" className="block text-sm font-semibold text-gray-300">Rounds</label>
                          <select
                              id="max-rounds"
                              value={maxRounds}
                              onChange={(e) => onMaxRoundsChange(Number(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                              <option value={7}>7</option>
                              <option value={10}>10</option>
                          </select>
                      </div>
                      {/* Dare Mode Setting */}
                      <div>
                          <label className="block text-sm font-semibold text-gray-300">Dare Mode</label>
                          <div className="flex items-center bg-gray-700 rounded-md p-1 mt-1">
                              <button
                                  onClick={() => onDareModeChange('AI')}
                                  className={`w-1/2 rounded-md py-1 text-sm font-semibold transition-colors ${dareMode === 'AI' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                              >
                                  🤖 AI
                              </button>
                              <button
                                  onClick={() => onDareModeChange('COMMUNITY')}
                                  className={`w-1/2 rounded-md py-1 text-sm font-semibold transition-colors ${dareMode === 'COMMUNITY' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                              >
                                  👥 Community
                              </button>
                          </div>
                      </div>
                  </div>
                  <button onClick={handleStartCountdown} disabled={!canStart} className={`w-full py-3 px-8 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 transform ${canStart ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                      {getStartButtonText()}
                  </button>
              </div>
            )
          ) : (
            countdown !== null ? (
                <p className="text-3xl font-bold text-yellow-300 animate-pulse">Starting in {countdown}...</p>
            ) : (
                <p className="text-lg text-yellow-400">Waiting for host to start...</p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Lobby;
