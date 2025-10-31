

import React from 'react';
import { Avatar, Badge, ColorTheme } from '../types';
import Confetti from './Confetti';

interface LevelUpModalProps {
  data: {
    level: number;
    reward: Avatar | ColorTheme | Badge;
  };
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ data, onClose }) => {
  const { level, reward } = data;

  // Type guards
  const isColor = (item: any): item is ColorTheme => 'primaryClass' in item;
  const isBadge = (item: any): item is Badge => 'tiers' in item;

  const renderRewardIcon = () => {
    if (isColor(reward)) {
      return <div className={`w-14 h-14 rounded-full ${reward.primaryClass} border-4 ${reward.secondaryClass}`} />;
    }
    if (isBadge(reward)) {
      return <span>{reward.tiers[0].emoji}</span>;
    }
    // It must be an Avatar
    return <span>{reward.emoji}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in p-4" onClick={onClose}>
        <Confetti />
        <div 
            className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-yellow-400/50 flex flex-col p-8 items-center text-center animate-boing-in relative"
            onClick={e => e.stopPropagation()}
        >
            <span className="absolute -top-8 text-6xl">🎉</span>
            <h2 className="text-4xl font-bold text-yellow-300 drop-shadow-lg">LEVEL UP!</h2>
            <p className="text-xl mt-2">You've reached <span className="font-bold text-purple-400">Level {level}!</span></p>
            
            <div className="my-6">
                <p className="text-gray-400 mb-2">You've unlocked:</p>
                <div className="bg-gray-900/50 p-4 rounded-xl flex items-center gap-4">
                    <div className="text-5xl">
                        {renderRewardIcon()}
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold">{reward.name}</h3>
                        <p className="text-sm text-gray-300">
                            {isBadge(reward) ? reward.description : (isColor(reward) ? 'New Color Theme' : 'New Avatar')}
                        </p>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full max-w-xs py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform active:scale-95"
            >
                Awesome!
            </button>
        </div>
    </div>
  );
};

export default LevelUpModal;