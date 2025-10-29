import React, { useState } from 'react';
import { Player, PlayerCustomization, Avatar, ColorTheme, Badge } from '../types';
import { getAllAvatars, getAllColors, getAllBadges } from '../services/customizationService';

interface CustomizationScreenProps {
  player: Player;
  onSave: (customization: PlayerCustomization) => void;
  onGoBack: () => void;
}

const CustomizationScreen: React.FC<CustomizationScreenProps> = ({ player, onSave, onGoBack }) => {
  const [customization, setCustomization] = useState<PlayerCustomization>(player.customization);

  const avatars = getAllAvatars();
  const colors = getAllColors();
  const badges = getAllBadges();

  const handleSelect = (type: keyof PlayerCustomization, id: string | null) => {
    setCustomization(prev => ({ ...prev, [type]: id }));
  };

  const isUnlocked = (item: Avatar | ColorTheme | Badge): boolean => {
      if (!('unlockId' in item) || !item.unlockId) {
          return true; // Not an unlockable item
      }
      return player.unlocks.includes(item.unlockId);
  }

  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-2 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">Customize Your Avatar</h1>
      
      <div className="flex-grow w-full overflow-y-auto space-y-6">
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
            <button onClick={() => handleSelect('badgeId', null)} className={`p-2 rounded-full transition-all transform active:scale-95 ${!customization.badgeId ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:scale-105'}`}>
                <span className="text-4xl">🚫</span>
            </button>
            {badges.map(badge => {
              const unlocked = isUnlocked(badge);
              return (
                <button key={badge.id} onClick={() => unlocked && handleSelect('badgeId', badge.id)} disabled={!unlocked} className={`relative p-2 rounded-full transition-all transform active:scale-95 ${customization.badgeId === badge.id ? 'bg-purple-600 scale-110' : 'bg-gray-700'} ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                  <span className="text-4xl">{badge.emoji}</span>
                  {!unlocked && <span className="absolute bottom-0 right-0 text-xl">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button onClick={() => onSave(customization)} className="w-full max-w-sm mt-6 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transform transition-transform active:scale-95">
        Save & Join Lobby
      </button>
    </div>
  );
};

export default CustomizationScreen;