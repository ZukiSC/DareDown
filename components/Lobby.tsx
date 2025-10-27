import React from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';

interface LobbyProps {
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  reactions: { playerId: string, emoji: string }[];
  notificationPermission: 'default' | 'granted' | 'denied';
  onRequestNotifications: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ players, currentPlayer, onStartGame, reactions, notificationPermission, onRequestNotifications }) => {
  const canStart = currentPlayer.isHost && players.length >= 2;

  return (
    <div className="flex flex-col h-full items-center justify-between text-center p-2 md:p-4">
      <div>
        <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg mb-2">Game Lobby</h1>
        <p className="text-md md:text-lg text-gray-300">Waiting for players to join... (2-8 players)</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full my-4 md:my-8 overflow-y-auto">
        {players.map(player => {
            const reaction = reactions.find(r => r.playerId === player.id)?.emoji;
            return <PlayerAvatar key={player.id} player={player} isCurrentPlayer={player.id === currentPlayer.id} reaction={reaction} />;
        })}
        {Array.from({ length: 8 - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700/50 border-2 border-dashed border-gray-600 animate-pulse w-full h-36">
                <div className="w-16 h-16 rounded-full bg-gray-600 mb-2"></div>
                <div className="h-4 w-20 bg-gray-600 rounded"></div>
            </div>
        ))}
      </div>
      
      <div className="w-full">
        {notificationPermission === 'default' && (
            <div className="mb-4 bg-gray-900/70 p-3 rounded-lg max-w-sm mx-auto">
                <p className="text-sm mb-2">Stay updated on game events!</p>
                <button
                    onClick={onRequestNotifications}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded"
                >
                    Enable Notifications
                </button>
            </div>
        )}
        {currentPlayer.isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full max-w-sm mx-auto py-3 md:py-4 px-8 text-lg md:text-xl font-bold rounded-lg shadow-lg transition-all duration-300
              ${canStart 
                ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
          >
            {canStart ? 'Start Game!' : `Waiting for more players... (${players.length}/2)`}
          </button>
        ) : (
          <p className="text-lg md:text-xl text-yellow-400">Waiting for the host ({players.find(p => p.isHost)?.name}) to start the game...</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;