import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { getAvatarById } from '../services/customizationService';

interface LobbyProps {
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  reactions: { playerId: string, emoji: string }[];
  notificationPermission: 'default' | 'granted' | 'denied';
  onRequestNotifications: () => void;
  onViewProfile: (playerId: string) => void;
  showNotification: (message: string, emoji?: string) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveLobby: () => void;
  maxRounds: number;
  onMaxRoundsChange: (rounds: number) => void;
  dareMode: 'AI' | 'COMMUNITY';
  onDareModeChange: (mode: 'AI' | 'COMMUNITY') => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  players, currentPlayer, onStartGame, reactions, notificationPermission, 
  onRequestNotifications, onViewProfile, showNotification, onKickPlayer, 
  onLeaveLobby, maxRounds, onMaxRoundsChange, dareMode, onDareModeChange
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [kickConfirmPlayer, setKickConfirmPlayer] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const canStart = currentPlayer.isHost && players.length >= 2;
  const onlineFriends = currentPlayer.friends.length; // Simplified for mock

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      onStartGame();
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    // This cleanup function will run when the component unmounts or before the effect runs again.
    return () => clearTimeout(timerId);
  }, [countdown, onStartGame]);

  const handleStartCountdown = () => {
    if (canStart && countdown === null) {
      setCountdown(5);
    }
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  const handleInvite = (friendName: string) => {
    showNotification(`Invitation sent to ${friendName}!`, '💌');
    setShowInviteModal(false);
  };
  
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

  const renderHostControls = () => {
    if (countdown !== null) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
                <p className="text-4xl font-bold text-yellow-300 animate-pulse">
                    Starting in {countdown}...
                </p>
                <button
                    onClick={handleCancelCountdown}
                    className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-transform transform active:scale-95"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-4 flex flex-col items-center gap-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
                <div className="flex items-center gap-3">
                    <label htmlFor="rounds-select" className="font-bold text-lg">Rounds:</label>
                    <select
                      id="rounds-select"
                      value={maxRounds}
                      onChange={(e) => onMaxRoundsChange(Number(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="7">7</option>
                    </select>
                </div>
                 <div className="flex items-center gap-3">
                    <label className="font-bold text-lg">Dares:</label>
                    <div className="flex items-center bg-gray-700 rounded-full p-1">
                        <button 
                            onClick={() => onDareModeChange('AI')}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${dareMode === 'AI' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
                        >
                            🤖 AI
                        </button>
                        <button 
                            onClick={() => onDareModeChange('COMMUNITY')}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${dareMode === 'COMMUNITY' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
                        >
                            👥 Players
                        </button>
                    </div>
                </div>
            </div>
            <button
              onClick={handleStartCountdown}
              disabled={!canStart}
              className={`w-full md:w-auto py-3 px-8 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 transform
                ${canStart 
                  ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse active:scale-95' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {canStart ? 'Start Game!' : `Waiting for players... (${players.length}/2)`}
            </button>
        </div>
    );
  };

  const renderPlayerView = () => {
    if (countdown !== null) {
        return (
            <div className="text-center">
                <p className="text-4xl font-bold text-yellow-300 animate-pulse">
                    Starting in {countdown}...
                </p>
            </div>
        );
    }
    return (
        <div className="text-center">
            <p className="text-lg md:text-xl text-yellow-400">Waiting for the host ({players.find(p => p.isHost)?.name}) to start...</p>
            <div className="flex justify-center items-center gap-4 mt-2">
                <p className="text-md text-gray-300">Rounds: <span className="font-bold text-white">{maxRounds}</span></p>
                <p className="text-md text-gray-300">Dares: <span className="font-bold text-white">{dareMode === 'AI' ? '🤖 AI' : '👥 Players'}</span></p>
            </div>
        </div>
    );
  };

  return (
    <>
      <button onClick={onLeaveLobby} className="absolute top-2 left-2 text-sm px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded-full transition-colors transform active:scale-95 z-10">
          Leave Lobby
      </button>
      <div className="flex flex-col h-full items-center justify-between text-center p-2 md:p-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg mb-2">Game Lobby</h1>
          <div className="flex justify-center items-center gap-4">
            <p className="text-md md:text-lg text-gray-300">Waiting for players... (2-8 players)</p>
            <button onClick={() => setShowInviteModal(true)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-full shadow-lg transform transition-transform active:scale-95">
                Invite Friends ({onlineFriends})
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full my-4 md:my-8 overflow-y-auto">
          {players.map((player, index) => {
              const reaction = reactions.find(r => r.playerId === player.id)?.emoji;
              return <PlayerAvatar key={player.id} player={player} isCurrentPlayer={player.id === currentPlayer.id} reaction={reaction} onClick={() => handleAvatarClick(player)} className="animate-boing-in opacity-0" style={{ animationDelay: `${index * 75}ms` }} />;
          })}
          {Array.from({ length: 8 - players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700/50 border-2 border-dashed border-gray-600 w-full h-36">
                  <div className="w-16 h-16 rounded-full bg-gray-600/50 mb-2 relative overflow-hidden animate-shimmer"></div>
                  <div className="h-4 w-20 bg-gray-600/50 rounded relative overflow-hidden animate-shimmer"></div>
              </div>
          ))}
        </div>
        
        <div className="w-full">
          {notificationPermission === 'default' && (
              <div className="mb-4 bg-gray-900/70 p-3 rounded-lg max-w-sm mx-auto">
                  <p className="text-sm mb-2">Stay updated on game events!</p>
                  <button
                      onClick={onRequestNotifications}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded transform transition-transform active:scale-95"
                  >
                      Enable Notifications
                  </button>
              </div>
          )}
          {currentPlayer.isHost ? renderHostControls() : renderPlayerView()}
        </div>
      </div>

      {showInviteModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowInviteModal(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-purple-500/50" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-purple-400 mb-4">Invite Friends</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentPlayer.friends.length > 0 ? (
                        currentPlayer.friends.map(friendId => (
                            <div key={friendId} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                                <span className="font-semibold">Friend {friendId}</span>
                                <button onClick={() => handleInvite(`Friend ${friendId}`)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded">Invite</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">You have no friends to invite yet. Add some from the Social panel!</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {kickConfirmPlayer && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={() => setKickConfirmPlayer(null)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-red-500/50 animate-pop-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-red-400 mb-4">Kick Player?</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to remove <span className="font-bold">{kickConfirmPlayer.name}</span> from the lobby?</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setKickConfirmPlayer(null)} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-transform transform active:scale-95">Cancel</button>
                    <button onClick={confirmKick} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-transform transform active:scale-95">Kick</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Lobby;