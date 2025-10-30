import { Avatar, ColorTheme, Badge } from '../types';

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
    // Dare Pass Avatars
    { id: 'avatar_dp1', emoji: '🏴‍☠️', name: 'Pirate', unlockId: 'darepass_s1_t5' },
    { id: 'avatar_dp2', emoji: '🐲', name: 'Dragon', unlockId: 'darepass_s1_t15' },

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
    // Dare Pass Colors
    { id: 'color_dp1', name: 'Gold', primaryClass: 'bg-yellow-400', secondaryClass: 'border-yellow-200', unlockId: 'darepass_s1_t8' },
    { id: 'color_dp2', name: 'Emerald', primaryClass: 'bg-emerald-500', secondaryClass: 'border-emerald-300', unlockId: 'darepass_s1_t12' },
];

// --- BADGES (all are unlockable) ---
const BADGES: Badge[] = [
    { 
        id: 'badge_dare_survivor', 
        emoji: '👹', 
        name: 'Dare Survivor', 
        description: 'Awarded for completing a dare.',
        unlockId: 'badge_dare_survivor' 
    },
    { 
        id: 'badge_winner', 
        emoji: '👑', 
        name: 'Winner', 
        description: 'Awarded for winning a game.',
        unlockId: 'badge_winner' 
    },
    {
        id: 'badge_veteran',
        emoji: '🛡️',
        name: 'Veteran',
        description: 'Awarded for reaching level 4.',
        unlockId: 'level_4',
    },
    {
        id: 'badge_darepass_s1',
        emoji: '🌟',
        name: 'Season 1 Star',
        description: 'Awarded for completing Tier 1 of the Season 1 Dare Pass.',
        unlockId: 'darepass_s1_t1',
    }
];

// --- EXPORT FUNCTIONS ---

export const getAllAvatars = (): Avatar[] => AVATARS;
export const getAllColors = (): ColorTheme[] => COLORS;
export const getAllBadges = (): Badge[] => BADGES;

export const getAvatarById = (id: string): Avatar | undefined => AVATARS.find(a => a.id === id);
export const getColorById = (id: string): ColorTheme | undefined => COLORS.find(c => c.id === id);
export const getBadgeById = (id: string): Badge | undefined => BADGES.find(b => b.id === id);
export const getItemByUnlockId = (unlockId: string): Avatar | ColorTheme | Badge | undefined => {
    return [...AVATARS, ...COLORS, ...BADGES].find(item => item.unlockId === unlockId);
}