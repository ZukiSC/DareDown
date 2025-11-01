import { Avatar, ColorTheme, Badge, BadgeTier } from '../types';

// --- AVATARS ---
const AVATARS: Avatar[] = [
    { id: 'avatar_1', emoji: '🧑‍🚀', name: 'Astronaut' },
    { id: 'avatar_2', emoji: '🥷', name: 'Ninja' },
    { id: 'avatar_3', emoji: '🧙', name: 'Wizard' },
    { id: 'avatar_4', emoji: '🧑‍🎤', name: 'Rockstar' },
    { id: 'avatar_5', emoji: '🤖', name: 'Robot' },
    { id: 'avatar_6', emoji: '🦖', name: 'Dino' },
    { id: 'avatar_7', emoji: '🦄', name: 'Unicorn' },
    { id: 'avatar_8', emoji: '👨‍🍳', name: 'Chef' },
    { id: 'avatar_9', emoji: '🕵️', name: 'Detective' },
    { id: 'avatar_10', emoji: '👽', name: 'Alien' },
    // Unlockable Avatars
    { id: 'avatar_11', emoji: '🤖', name: 'Cyborg', unlockId: 'level_2' },
    { id: 'avatar_12', emoji: '🧛', name: 'Vampire', unlockId: 'level_5' },
    { id: 'avatar_13', emoji: '✨', name: 'Celestial', unlockId: 'level_10' },
];

// --- COLOR THEMES ---
const COLORS: ColorTheme[] = [
    { id: 'color_1', name: 'Purple', primaryClass: 'bg-purple-500', secondaryClass: 'border-purple-300' },
    { id: 'color_2', name: 'Blue', primaryClass: 'bg-blue-500', secondaryClass: 'border-blue-300' },
    { id: 'color_3', name: 'Green', primaryClass: 'bg-green-500', secondaryClass: 'border-green-300' },
    { id: 'color_4', name: 'Red', primaryClass: 'bg-red-500', secondaryClass: 'border-red-300' },
    { id: 'color_5', name: 'Yellow', primaryClass: 'bg-yellow-500', secondaryClass: 'border-yellow-300' },
    { id: 'color_6', name: 'Pink', primaryClass: 'bg-pink-500', secondaryClass: 'border-pink-300' },
    { id: 'color_7', name: 'Indigo', primaryClass: 'bg-indigo-500', secondaryClass: 'border-indigo-300' },
    { id: 'color_8', name: 'Teal', primaryClass: 'bg-teal-500', secondaryClass: 'border-teal-300' },
    // Unlockable Colors
    { id: 'color_9', name: 'Cyan', primaryClass: 'bg-cyan-500', secondaryClass: 'border-cyan-300', unlockId: 'level_3' },
    { id: 'color_10', name: 'Lime', primaryClass: 'bg-lime-500', secondaryClass: 'border-lime-300', unlockId: 'level_7' },
];

// --- BADGES (all are unlockable) ---
const BADGES: Badge[] = [
    { 
        id: 'badge_dare_survivor', 
        name: 'Dare Survivor', 
        description: 'Complete dares to upgrade this badge.',
        tiers: [
            { tier: 1, name: 'Bronze', emoji: '🥉', unlockRequirement: { stat: 'daresCompleted', value: 1, description: 'Complete 1 dare' } },
            { tier: 2, name: 'Silver', emoji: '🥈', unlockRequirement: { stat: 'daresCompleted', value: 10, description: 'Complete 10 dares' } },
            { tier: 3, name: 'Gold', emoji: '🥇', unlockRequirement: { stat: 'daresCompleted', value: 50, description: 'Complete 50 dares' } },
            { tier: 4, name: 'Legendary', emoji: '👹', unlockRequirement: { stat: 'daresCompleted', value: 100, description: 'Complete 100 dares' } },
        ]
    },
    { 
        id: 'badge_winner', 
        name: 'Winner', 
        description: 'Win games to upgrade this badge.',
        tiers: [
            { tier: 1, name: 'Bronze', emoji: '🏆', unlockRequirement: { stat: 'wins', value: 1, description: 'Win 1 game' } },
            { tier: 2, name: 'Silver', emoji: '👑', unlockRequirement: { stat: 'wins', value: 5, description: 'Win 5 games' } },
            { tier: 3, name: 'Gold', emoji: '💎', unlockRequirement: { stat: 'wins', value: 25, description: 'Win 25 games' } },
            { tier: 4, name: 'Legendary', emoji: '✨', unlockRequirement: { stat: 'wins', value: 50, description: 'Win 50 games' } },
        ]
    },
    {
        id: 'badge_veteran',
        name: 'Veteran',
        description: 'Awarded for reaching level 4.',
        tiers: [
             { tier: 1, name: 'Veteran', emoji: '🛡️', unlockRequirement: { stat: 'wins', value: 0, description: 'Reach level 4' } } // Stat is irrelevant here, unlocked by level
        ]
    },
];

// --- EXPORT FUNCTIONS ---

export const getAllAvatars = (): Avatar[] => AVATARS;
export const getAllColors = (): ColorTheme[] => COLORS;
export const getAllBadges = (): Badge[] => BADGES;

export const getAvatarById = (id: string): Avatar | undefined => AVATARS.find(a => a.id === id);
export const getColorById = (id: string): ColorTheme | undefined => COLORS.find(c => c.id === id);
export const getBadgeById = (id: string): Badge | undefined => BADGES.find(b => b.id === id);
export const getItemByUnlockId = (unlockId: string): Avatar | ColorTheme | undefined => {
    return [...AVATARS, ...COLORS].find(item => item.unlockId === unlockId);
}

export const getBadgeTierDetails = (id: string, tier: number): BadgeTier | undefined => {
    const badge = getBadgeById(id);
    return badge?.tiers.find(t => t.tier === tier);
}