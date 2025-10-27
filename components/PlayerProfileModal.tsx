import React from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onViewReplay: (dareId: string) => void;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose, onViewReplay }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-2xl h-[80vh] bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col p-6 animate-pop-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-white z-10 transition-transform transform active:scale-95">&times;</button>
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-700 pb-4 mb-4">
            <PlayerAvatar player={player} isCurrentPlayer={false} />
            <div>
                <h2 className="text-4xl font-bold text-center sm:text-left">{player.name}</h2>
                <div className="flex justify-center sm:justify-start gap-4 mt-2">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{player.stats.wins}</p>
                        <p className="text-sm text-gray-400">Wins</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{player.stats.daresCompleted}</p>
                        <p className="text-sm text-gray-400">Dares Done</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{player.stats.daresFailed}</p>
                        <p className="text-sm text-gray-400">Dares Failed</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Game History */}
        <div className="flex-grow overflow-y-auto pr-2">
            <h3 className="text-xl font-semibold mb-2">Game History</h3>
            <div className="space-y-3">
                {player.gameHistory.length > 0 ? (
                    player.gameHistory.slice().reverse().map(game => (
                        <div key={game.gameId} className="bg-gray-900/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <p className={`font-bold text-lg ${game.winnerId === player.id ? 'text-green-400' : 'text-red-400'}`}>
                                    {game.winnerId === player.id ? 'VICTORY' : 'DEFEAT'}
                                </p>
                                <p className="text-xs text-gray-400">{new Date(game.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">Players:</span>
                                <div className="flex gap-1">
                                    {game.players.map(p => (
                                        <div key={p.id} className="w-6 h-6 bg-gray-700 rounded-full text-sm flex items-center justify-center" title={p.name}>
                                            {p.name.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {game.dare && (
                                <div className="bg-gray-800/60 p-2 rounded text-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p><span className="font-semibold">Final Dare for {game.dare.assigneeName}:</span> "{game.dare.text}"</p>
                                            <p>Result: <span className={game.dare.completed ? 'text-green-400' : 'text-red-400'}>{game.dare.completed ? 'Completed' : 'Failed'}</span></p>
                                        </div>
                                        {game.dare.replayUrl && (
                                            <button 
                                                onClick={() => onViewReplay(game.dare.dareId)}
                                                className="ml-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg transform transition-transform active:scale-95"
                                            >
                                                Watch Replay ▶️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-8">No games played yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileModal;