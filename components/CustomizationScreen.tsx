import React, { useState } from 'react';
import { Player, PlayerCustomization, Avatar, ColorTheme, Badge } from '../types';
import { getAllAvatars, getAllColors, getAllBadges } from '../services/customizationService';

interface CustomizationScreenProps {
  player: Player;
  onSave: (customization: PlayerCustomization) => void;
}

const CustomizationScreen: React.FC<CustomizationScreenProps> = ({ player, onSave }) => {
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
    <div className="flex flex-col h-full items-center justify-center text-center p-2">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">Customize Your Avatar</h1>
      
      <div className="flex-grow w-full overflow-y-auto space-y-6">
        {/* Avatars */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Avatar</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {avatars.map(avatar => (
              <button key={avatar.id} onClick={() => handleSelect('avatarId', avatar.id)} className={`p-2 rounded-full transition-all ${customization.avatarId === avatar.id ? 'bg-purple-600 scale-110' : 'bg-gray-700'}`}>
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
              <button key={color.id} onClick={() => handleSelect('colorId', color.id)} className={`w-12 h-12 rounded-full transition-all border-4 ${color.primaryClass} ${customization.colorId === color.id ? 'border-white scale-110' : 'border-transparent'}`} />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Badge</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => handleSelect('badgeId', null)} className={`p-2 rounded-full transition-all ${!customization.badgeId ? 'bg-purple-600 scale-110' : 'bg-gray-700'}`}>
                <span className="text-4xl">🚫</span>
            </button>
            {badges.map(badge => {
              const unlocked = isUnlocked(badge);
              return (
                <button key={badge.id} onClick={() => unlocked && handleSelect('badgeId', badge.id)} disabled={!unlocked} className={`relative p-2 rounded-full transition-all ${customization.badgeId === badge.id ? 'bg-purple-600 scale-110' : 'bg-gray-700'} ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="text-4xl">{badge.emoji}</span>
                  {!unlocked && <span className="absolute bottom-0 right-0 text-xl">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button onClick={() => onSave(customization)} className="w-full max-w-sm mt-6 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg">
        Save & Join Lobby
      </button>
    </div>
  );
};

export default CustomizationScreen;
