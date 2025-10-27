import React from 'react';
import { Dare, Player } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface DareArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: Dare[];
  allPlayers: Player[];
  onPlay: (dareId: string) => void;
}

const DareArchiveModal: React.FC<DareArchiveModalProps> = ({ isOpen, onClose, archive, allPlayers, onPlay }) => {
  if (!isOpen) return null;

  const getPlayerForDare = (dare: Dare) => allPlayers.find(p => p.id === dare.assigneeId);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl h-[85vh] bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col p-6 animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h2 className="text-3xl font-bold text-purple-400">📼 Dare Archive</h2>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-white transition-transform transform active:scale-95">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {archive.length > 0 ? (
            archive.map(dare => {
              const player = getPlayerForDare(dare);
              if (!player) return null;
              
              const avatar = getAvatarById(player.customization.avatarId);
              const color = getColorById(player.customization.colorId);

              return (
                <div key={dare.id} className="bg-gray-900/60 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-in-up">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full ${color?.primaryClass} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {avatar?.emoji}
                      </div>
                      <div>
                          <p className="font-bold">{player.name}</p>
                          <p className="text-xs text-gray-400">{new Date(parseInt(dare.id.split('_')[1])).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="italic text-gray-300">"{dare.text}"</p>
                  </div>
                  <button 
                    onClick={() => onPlay(dare.id)}
                    className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transform transition-transform active:scale-95"
                  >
                    Watch Replay ▶️
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p className="text-5xl mb-4">🎬</p>
                <p className="text-xl">No Dares Archived Yet</p>
                <p>Successfully completed dares will appear here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DareArchiveModal;
