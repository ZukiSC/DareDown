import React, { useState } from 'react';
import { Player, Avatar, ColorTheme, Badge } from '../types';
import { getAllAvatars, getAllColors, getAllBadges, getBadgeTierDetails } from '../services/customizationService';
import PlayerAvatar from './PlayerAvatar';
import XPBar from './XPBar';

interface ProfileScreenProps {
  profilePlayer: Player;
  currentPlayer: Player;
  onGoBack: () => void;
  onUpdateBio: (bio: string) => void;
  onViewReplay: (dareId: string) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div className="bg-gray-900/50 p-4 rounded-lg text-center">
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const CustomizationItem: React.FC<{ item: Avatar | ColorTheme | Badge, isUnlocked: boolean }> = ({ item, isUnlocked }) => {
  const isColor = (i: any): i is ColorTheme => 'primaryClass' in i;
  const isBadge = (i: any): i is Badge => 'tiers' in i;

  return (
    <div className={`relative p-2 rounded-lg text-center transition-opacity ${isUnlocked ? 'bg-gray-700' : 'bg-gray-800 opacity-50'}`} title={isUnlocked ? item.name : 'Locked'}>
        <div className="text-4xl h-12 flex items-center justify-center">
        {isColor(item) ? (
            <div className={`w-10 h-10 rounded-full ${item.primaryClass}`} />
        ) : (
            <span>{isBadge(item) ? item.tiers[0].emoji : item.emoji}</span>
        )}
        </div>
        <p className="text-xs truncate w-full mt-1">{item.name}</p>
        {!isUnlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg"><span className="text-2xl">🔒</span></div>}
    </div>
  );
};


const ProfileScreen: React.FC<ProfileScreenProps> = ({ profilePlayer, currentPlayer, onGoBack, onUpdateBio, onViewReplay }) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profilePlayer.bio || '');

  const isOwnProfile = profilePlayer.id === currentPlayer.id;
  const totalGames = profilePlayer.gameHistory.length;
  const winRate = totalGames > 0 ? ((profilePlayer.stats.wins / totalGames) * 100).toFixed(0) : 0;

  const handleBioSave = () => {
    onUpdateBio(bioText);
    setIsEditingBio(false);
  };

  return (
    <div className="flex flex-col h-full w-full items-center p-2 relative animate-fade-in">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="w-full flex-grow overflow-y-auto pr-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-800/50 p-4 rounded-xl mb-4">
          <div className="w-24 h-24">
            <PlayerAvatar player={profilePlayer} isCurrentPlayer={false} className="w-full h-full bg-transparent" />
          </div>
          <div className="flex-grow text-center sm:text-left w-full">
            <h2 className="text-4xl font-bold">{profilePlayer.name}</h2>
            <div className="mt-2">
                <XPBar level={profilePlayer.level} xp={profilePlayer.xp} xpToNextLevel={profilePlayer.xpToNextLevel} />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-purple-300">Bio</h3>
            {isOwnProfile && !isEditingBio && (
              <button onClick={() => setIsEditingBio(true)} className="text-xs font-semibold px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500">Edit</button>
            )}
          </div>
          {isEditingBio ? (
            <div>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={3}
                maxLength={150}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditingBio(false)} className="text-xs font-semibold px-3 py-1.5 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                <button onClick={handleBioSave} className="text-xs font-semibold px-3 py-1.5 bg-green-600 rounded-md hover:bg-green-500">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 italic">{profilePlayer.bio || 'This player is a mystery...'}</p>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Wins" value={profilePlayer.stats.wins} colorClass="text-green-400" />
          <StatCard label="Win Rate" value={`${winRate}%`} colorClass="text-blue-400" />
          <StatCard label="Dares Done" value={profilePlayer.stats.daresCompleted} colorClass="text-yellow-400" />
          <StatCard label="Dares Failed" value={profilePlayer.stats.daresFailed} colorClass="text-red-400" />
        </div>

        {/* Customization Showcase */}
         <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Unlocked Items</h3>
             <div className="space-y-3">
                 <div>
                     <h4 className="font-semibold text-gray-400 text-sm mb-1">Avatars</h4>
                     <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                         {getAllAvatars().map(item => <CustomizationItem key={item.id} item={item} isUnlocked={!item.unlockId || profilePlayer.unlocks.includes(item.unlockId)} />)}
                     </div>
                 </div>
                  <div>
                     <h4 className="font-semibold text-gray-400 text-sm mb-1">Colors</h4>
                     <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                         {getAllColors().map(item => <CustomizationItem key={item.id} item={item} isUnlocked={!item.unlockId || profilePlayer.unlocks.includes(item.unlockId)} />)}
                     </div>
                 </div>
             </div>
        </div>

        {/* Game History */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <h3 className="text-xl font-semibold text-purple-300 mb-2">Game History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {profilePlayer.gameHistory.length > 0 ? (
              profilePlayer.gameHistory.slice().reverse().map(game => (
                <div key={game.gameId} className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className={`font-bold text-lg ${game.winnerId === profilePlayer.id ? 'text-green-400' : 'text-red-400'}`}>
                      {game.winnerId === profilePlayer.id ? 'VICTORY' : 'DEFEAT'}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(game.date).toLocaleDateString()}</p>
                  </div>
                  {game.dare && (
                    <div className="bg-gray-800/60 p-2 rounded text-sm flex justify-between items-center">
                      <p><span className="font-semibold">{game.dare.assigneeName}'s Dare:</span> "{game.dare.text}"</p>
                      {game.dare.replayUrl && (
                        <button onClick={() => onViewReplay(game.dare.dareId)} className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full transform active:scale-95">
                          ▶️
                        </button>
                      )}
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

export default ProfileScreen;
