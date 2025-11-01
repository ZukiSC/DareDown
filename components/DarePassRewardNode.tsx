import React from 'react';
// FIX: Import missing DarePassReward type.
import { Player, DarePassReward, Avatar, ColorTheme, Badge } from '../types';
import { getItemByUnlockId } from '../services/customizationService';

interface DarePassRewardNodeProps {
  reward: DarePassReward | undefined;
  player: Player;
  isPremiumTrack?: boolean;
}

const DarePassRewardNode: React.FC<DarePassRewardNodeProps> = ({ reward, player, isPremiumTrack = false }) => {
  const isColor = (item: any): item is ColorTheme => 'primaryClass' in item;

  const renderEmptyNode = () => (
    <div className={`w-full h-24 flex items-center justify-center p-1 rounded-md ${isPremiumTrack ? 'bg-yellow-900/20' : 'bg-gray-700/30'}`}>
      <span className="text-3xl text-gray-600"></span>
    </div>
  );

  if (!reward) return renderEmptyNode();
  
  const item = getItemByUnlockId(reward.unlockId);
  if (!item) return renderEmptyNode();

  const isUnlocked = player.unlocks.includes(reward.unlockId);
  const isTierReached = player.darePassTier >= reward.tier;
  const canBeUnlocked = isTierReached && (!isPremiumTrack || (isPremiumTrack && player.hasPremiumPass));

  let containerClasses = `w-full h-24 flex flex-col items-center justify-center p-1 rounded-md transition-all duration-300 relative overflow-hidden `;
  if (isPremiumTrack) {
      containerClasses += isUnlocked ? 'bg-yellow-600/50 border border-yellow-400' : 'bg-yellow-900/30 border border-yellow-700/50';
  } else {
      containerClasses += isUnlocked ? 'bg-teal-600/50 border border-teal-400' : 'bg-gray-700/50 border border-gray-600';
  }
  if (!canBeUnlocked && !isUnlocked) {
      containerClasses += ' opacity-50';
  }

  return (
    <div className={containerClasses} title={`${isPremiumTrack ? '[Premium] ' : ''}${item.name}`}>
      {!canBeUnlocked && !isUnlocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-2xl">🔒</span>
          </div>
      )}
      <div className="text-3xl">
          {isColor(item) ? (
              <div className={`w-10 h-10 rounded-full ${item.primaryClass} border-2 ${item.secondaryClass}`} />
          ) : (
              <span>{item.emoji}</span>
          )}
      </div>
      <p className="text-xs text-center font-semibold truncate w-full mt-1">{item.name}</p>
      {isPremiumTrack && <span className="absolute top-1 right-1 text-xs text-yellow-300">P</span>}
    </div>
  );
};

export default DarePassRewardNode;
