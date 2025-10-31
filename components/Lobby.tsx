
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
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
  dareMode: 'AI' | 'COMMUNITY';
  onDareModeChange: (mode: 'AI' | 'COMMUNITY') => void;
  onJoinTeam: (teamId: 'blue' | 'orange' | null) => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  players, currentPlayer, onStartGame, onViewProfile, showNotification, onKickPlayer, 
  onLeaveLobby, maxRounds, onMaxRoundsChange, dareMode, onDareModeChange,
  onJoinTeam
}) => {
  const [kickConfirmPlayer, setKickConfirmPlayer] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { activeReactions } = useUIStore();
  const [draggingOverTeam, setDraggingOverTeam] = useState<'blue' | 'orange' | null>(null);
  
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


  const handleStartCountdown = () => { if (canStart && countdown === null) setCountdown(5); };
  const handleCancelCountdown = () => setCountdown(null);
  
  const handleAvatarClick = (player: Player) => {
    // Prevent profile view while dragging
    if (player.id === currentPlayer.id && currentPlayer.teamId === null) return;

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
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, playerId: string) => {
    if (playerId !== currentPlayer.id) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('playerId', playerId);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, teamId: 'blue' | 'orange') => {
      e.preventDefault();
      if (currentPlayer.teamId === null) {
          setDraggingOverTeam(teamId);
      }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDraggingOverTeam(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, teamId: 'blue' | 'orange') => {
      e.preventDefault();
      const playerId = e.dataTransfer.getData('playerId');
      if (playerId === currentPlayer.id) {
          onJoinTeam(teamId);
      }
      setDraggingOverTeam(null);
  };


  const renderPlayerList = (list: Player[], isUnassignedList?: boolean) => (
    <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-lg min-h-[90px]`}>
      {list.map((player) => {
         const reaction = activeReactions.find(r => r.playerId === player.id)?.emoji;
         const isDraggable = isUnassignedList && player.id === currentPlayer.id;
        return <PlayerAvatar 
                    key={player.id} 
                    player={player} 
                    reaction={reaction} 
                    isCurrentPlayer={player.id === currentPlayer.id} 
                    onClick={() => handleAvatarClick(player)} 
                    isDraggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, player.id)}
                />;
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
      <div className="flex flex-col w-full items-center text-center p-1">
        <div className="pt-4 flex-shrink-0">
          <h1 className="text-4xl font-bold text-purple-400 drop-shadow-lg mb-1">Team Lobby</h1>
          <p className="text-md text-gray-300">Join a team to begin!</p>
        </div>
        
        <div className="w-full flex flex-col gap-4 my-4">
            {/* Team Blue */}
            <div 
                className={`p-2 rounded-lg transition-all duration-200 bg-blue-900/40 ${draggingOverTeam === 'blue' ? 'border-2 border-dashed border-blue-400 bg-blue-900/80 scale-105' : 'border-2 border-transparent'}`}
                onDragOver={(e) => handleDragOver(e, 'blue')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'blue')}
            >
                <h2 className="text-2xl font-bold text-blue-400 mb-2">Team Blue</h2>
                {renderPlayerList(teamBlue)}
            </div>
            {/* Team Orange */}
             <div 
                className={`p-2 rounded-lg transition-all duration-200 bg-orange-900/40 ${draggingOverTeam === 'orange' ? 'border-2 border-dashed border-orange-400 bg-orange-900/80 scale-105' : 'border-2 border-transparent'}`}
                onDragOver={(e) => handleDragOver(e, 'orange')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'orange')}
            >
                <h2 className="text-2xl font-bold text-orange-400 mb-2">Team Orange</h2>
                {renderPlayerList(teamOrange)}
            </div>
            
            {unassigned.length > 0 && (
                <div className="w-full mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                         {currentPlayer.teamId === null ? "Drag your avatar to a team!" : "Unassigned Players"}
                    </h3>
                    {renderPlayerList(unassigned, true)}
                </div>
            )}
        </div>
        
        <div className="w-full p-4 bg-gray-800/80 backdrop-blur-sm border-t border-purple-500/30 flex-shrink-0">
          {currentPlayer.teamId !== null && !countdown && (
              <button onClick={() => onJoinTeam(null)} className="mb-2 px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg text-sm">Leave Team</button>
          )}

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
