import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';

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
  onJoinTeam: (teamId: 'blue' | 'orange' | null) => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  players, currentPlayer, onStartGame, reactions, notificationPermission, 
  onRequestNotifications, onViewProfile, showNotification, onKickPlayer, 
  onLeaveLobby, maxRounds, onMaxRoundsChange, dareMode, onDareModeChange,
  onJoinTeam
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [kickConfirmPlayer, setKickConfirmPlayer] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  
  const teamBlue = players.filter(p => p.teamId === 'blue');
  const teamOrange = players.filter(p => p.teamId === 'orange');
  const unassigned = players.filter(p => p.teamId === null);
  
  const canStart = currentPlayer.isHost && players.length >= 2 && teamBlue.length > 0 && teamOrange.length > 0 && unassigned.length === 0;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      onStartGame();
      return;
    }
    const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timerId);
  }, [countdown, onStartGame]);

  useEffect(() => {
    if (showInviteModal) {
      const lobbyId = Math.random().toString(36).substring(2, 9).toUpperCase();
      const newLink = `${window.location.origin}${window.location.pathname}?lobby=${lobbyId}`;
      setInviteLink(newLink);
    }
  }, [showInviteModal]);

  const handleStartCountdown = () => { if (canStart && countdown === null) setCountdown(5); };
  const handleCancelCountdown = () => setCountdown(null);

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      showNotification('Invite link copied!', '📋');
    });
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

  const renderPlayerList = (list: Player[], team?: 'blue' | 'orange') => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-lg h-full min-h-[120px] ${team === 'blue' ? 'bg-blue-900/40' : team === 'orange' ? 'bg-orange-900/40' : ''}`}>
      {list.map((player) => {
        const reaction = reactions.find(r => r.playerId === player.id)?.emoji;
        return <PlayerAvatar key={player.id} player={player} isCurrentPlayer={player.id === currentPlayer.id} reaction={reaction} onClick={() => handleAvatarClick(player)} />;
      })}
    </div>
  );

  const getStartButtonText = () => {
    if (unassigned.length > 0) return 'All players must join a team!';
    if (teamBlue.length === 0 || teamOrange.length === 0) return 'Teams must have players!';
    if (players.length < 2) return `Waiting for players... (${players.length}/2)`;
    return 'Start Game!';
  }

  return (
    <>
      <button onClick={onLeaveLobby} className="absolute top-2 left-2 text-sm px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded-full transition-colors transform active:scale-95 z-10">
          Leave Lobby
      </button>
      <div className="flex flex-col h-full items-center justify-between text-center p-2 md:p-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-purple-400 drop-shadow-lg mb-2">Team Lobby</h1>
          <p className="text-md md:text-lg text-gray-300">Join a team to begin!</p>
        </div>
        
        <div className="w-full flex-grow grid grid-cols-2 gap-4 my-4 overflow-y-auto">
            {/* Team Blue */}
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-blue-400 mb-2">Team Blue</h2>
                {renderPlayerList(teamBlue, 'blue')}
            </div>
            {/* Team Orange */}
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-orange-400 mb-2">Team Orange</h2>
                {renderPlayerList(teamOrange, 'orange')}
            </div>
        </div>

        {unassigned.length > 0 && (
            <div className="w-full mb-4">
                <h3 className="text-lg font-semibold mb-2">Unassigned Players</h3>
                {renderPlayerList(unassigned)}
            </div>
        )}

        {currentPlayer.teamId === null && (
          <div className="flex gap-4 mb-4">
              <button onClick={() => onJoinTeam('blue')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95">Join Blue</button>
              <button onClick={() => onJoinTeam('orange')} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95">Join Orange</button>
          </div>
        )}
        {currentPlayer.teamId !== null && (
            <button onClick={() => onJoinTeam(null)} className="mb-4 px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg text-sm">Leave Team</button>
        )}
        
        <div className="w-full">
          {currentPlayer.isHost ? (
            countdown !== null ? (
              <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
                  <p className="text-4xl font-bold text-yellow-300 animate-pulse">Starting in {countdown}...</p>
                  <button onClick={handleCancelCountdown} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Cancel</button>
              </div>
            ) : (
               <div className="w-full max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-4 flex flex-col items-center gap-4">
                  <button onClick={handleStartCountdown} disabled={!canStart} className={`w-full md:w-auto py-3 px-8 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 transform ${canStart ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                      {getStartButtonText()}
                  </button>
              </div>
            )
          ) : (
            countdown !== null ? (
                <p className="text-4xl font-bold text-yellow-300 animate-pulse">Starting in {countdown}...</p>
            ) : (
                <p className="text-lg md:text-xl text-yellow-400">Waiting for the host ({players.find(p => p.isHost)?.name}) to start...</p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Lobby;