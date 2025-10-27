import React from 'react';
import { Dare, Player } from '../types';

interface ReplayViewerModalProps {
  dare: Dare;
  player: Player | undefined;
  onClose: () => void;
}

const ReplayViewerModal: React.FC<ReplayViewerModalProps> = ({ dare, player, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] animate-fade-in p-4" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl border border-green-500/30 flex flex-col p-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center text-gray-500">
          <p className="text-2xl z-10">Mock Replay for "{dare.replayUrl}"</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l8.58-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
            </div>
          </div>
           <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-bold text-red-500 text-sm">REPLAY</span>
            </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xl font-bold">{player?.name || 'Unknown Player'}</p>
          <p className="text-lg text-gray-300 mt-1">"{dare.text}"</p>
          <button 
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transform transition-transform active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplayViewerModal;
