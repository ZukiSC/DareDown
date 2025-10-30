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

  const isColor = (item: any): item is ColorTheme => 'primaryClass' in item;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in p-4" onClick={onClose}>
        <Confetti />
        <div 
            className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-yellow-400/50 flex flex-col p-8 items-center text-center animate-boing-in relative"
            onClick={e => e.stopPropagation()}
        >
            <span className="absolute -top-8 text-6xl">🎉</span>
            <h2 className="text-4xl font-bold text-yellow-300 drop-shadow-lg">LEVEL UP!</h2>
            <p className="text-8xl font-bold my-4 text-white drop-shadow-md">{level}</p>
            
            <p className="text-lg text-gray-300 mb-2">You've unlocked a new reward!</p>
            
            <div className="bg-gray-900/70 p-4 rounded-lg flex items-center gap-4 w-full justify-center">
                <div className="text-5xl">
                    {isColor(reward) ? (
                        <div className={`w-14 h-14 rounded-full ${reward.primaryClass} border-4 ${reward.secondaryClass}`}></div>
                    ) : (
                        <span>{reward.emoji}</span>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-purple-300">{reward.name}</h3>
                    {'description' in reward && <p className="text-sm text-gray-400">{reward.description}</p>}
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-8 w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transform transition-transform active:scale-95"
            >
                Awesome!
            </button>
        </div>
    </div>
  );
};

export default LevelUpModal;
