import React, { useState } from 'react';
import { Player, PlayerCustomization, Avatar, ColorTheme, Badge, BadgeTier } from '../types';
import { getAllAvatars, getAllColors, getAllBadges, getBadgeTierDetails } from '../services/customizationService';

interface CustomizationScreenProps {
  player: Player;
  onSave: (customization: PlayerCustomization) => void;
  onGoBack: () => void;
}

const CustomizationScreen: React.FC<CustomizationScreenProps> = ({ player, onSave, onGoBack }) => {
  const [customization, setCustomization] = useState<PlayerCustomization>(player.customization);
  const [viewingBadge, setViewingBadge] = useState<Badge | null>(null);

  const avatars = getAllAvatars();
  const colors = getAllColors();
  const badges = getAllBadges();

  const handleSelect = (type: keyof PlayerCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [type]: value }));
  };

  const isUnlocked = (item: { unlockId?: string }): boolean => {
      if (!item.unlockId) return true;
      return player.unlocks.includes(item.unlockId);
  }

  const renderBadgeTiers = () => {
    if (!viewingBadge) return null;
    
    const highestUnlockedTier = player.badgeUnlocks[viewingBadge.id] || 0;

    return (
      <div className="w-full bg-gray-900/50 p-4 rounded-lg mt-4 border border-gray-700 animate-fade-in-fast">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-purple-300">{viewingBadge.name} Tiers</h3>
            <button onClick={() => setViewingBadge(null)} className="text-xl text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-sm text-gray-400 mb-4">{viewingBadge.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {viewingBadge.tiers.map(tier => {
            const isTierUnlocked = tier.tier <= highestUnlockedTier;
            const isEquipped = customization.equippedBadge?.id === viewingBadge.id && customization.equippedBadge?.tier === tier.tier;
            
            return (
              <button
                key={tier.tier}
                onClick={() => isTierUnlocked && handleSelect('equippedBadge', { id: viewingBadge.id, tier: tier.tier })}
                disabled={!isTierUnlocked}
                className={`relative p-3 rounded-lg text-center transition-all transform active:scale-95
                  ${isEquipped ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-gray-700'}
                  ${!isTierUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}
                `}
              >
                <span className="text-4xl block">{tier.emoji}</span>
                <span className="font-semibold block mt-1 text-sm">{tier.name}</span>
                {!isTierUnlocked && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg p-1">
                    <span className="text-2xl">🔒</span>
                    <p className="text-xs text-center font-semibold text-yellow-300">{tier.unlockRequirement.description}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full items-center text-center p-2 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">Customize</h1>
      
      <div className="flex-grow w-full overflow-y-auto space-y-6 pr-2">
        {/* Avatars */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Avatar</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {avatars.map(avatar => (
              <button key={avatar.id} onClick={() => handleSelect('avatarId', avatar.id)} className={`p-2 rounded-full transition-all transform active:scale-95 ${customization.avatarId === avatar.id ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:scale-105'}`}>
                <span className="text-4xl">{avatar.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Color</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {colors.map(color => (
              <button key={color.id} onClick={() => handleSelect('colorId', color.id)} className={`w-12 h-12 rounded-full transition-all border-4 transform active:scale-95 ${color.primaryClass} ${customization.colorId === color.id ? 'border-white scale-110' : 'hover:scale-105 border-transparent'}`} />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Badge</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => { handleSelect('equippedBadge', null); setViewingBadge(null); }} className={`p-2 rounded-full transition-all transform active:scale-95 ${!customization.equippedBadge ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:scale-105'}`}>
                <span className="text-4xl">🚫</span>
            </button>
            {badges.map(badge => {
              const highestUnlockedTier = player.badgeUnlocks[badge.id] || 0;
              const badgeTierDetails = highestUnlockedTier > 0 ? getBadgeTierDetails(badge.id, highestUnlockedTier) : null;
              const isEquipped = customization.equippedBadge?.id === badge.id;
              
              if (highestUnlockedTier === 0) {
                 return (
                    <div key={badge.id} className="relative p-2 rounded-full bg-gray-700 opacity-50" title={badge.tiers[0].unlockRequirement.description}>
                      <span className="text-4xl">{badge.tiers[0].emoji}</span>
                      <span className="absolute bottom-0 right-0 text-xl">🔒</span>
                    </div>
                 )
              }
              return (
                <button key={badge.id} onClick={() => setViewingBadge(badge)} className={`relative p-2 rounded-full transition-all transform active:scale-95 ${isEquipped ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:scale-105'}`}>
                  <span className="text-4xl">{badgeTierDetails?.emoji}</span>
                </button>
              );
            })}
          </div>
          {renderBadgeTiers()}
        </div>
      </div>

      <button onClick={() => onSave(customization)} className="w-full max-w-sm mt-6 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transform transition-transform active:scale-95 flex-shrink-0">
        Save
      </button>
    </div>
  );
};

export default CustomizationScreen;