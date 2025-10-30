import React from 'react';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const XPBar: React.FC<XPBarProps> = ({ level, xp, xpToNextLevel }) => {
  const progress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm font-semibold mb-1">
        <span className="text-purple-300">Level {level}</span>
        <span className="text-gray-400">{xp} / {xpToNextLevel} XP</span>
      </div>
      <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out animate-shimmer"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
