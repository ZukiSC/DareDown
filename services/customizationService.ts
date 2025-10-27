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
];

// --- EXPORT FUNCTIONS ---

export const getAllAvatars = (): Avatar[] => AVATARS;
export const getAllColors = (): ColorTheme[] => COLORS;
export const getAllBadges = (): Badge[] => BADGES;

export const getAvatarById = (id: string): Avatar | undefined => AVATARS.find(a => a.id === id);
export const getColorById = (id: string): ColorTheme | undefined => COLORS.find(c => c.id === id);
export const getBadgeById = (id: string): Badge | undefined => BADGES.find(b => b.id === id);