import { Avatar, ColorTheme, Badge } from '../types';
import { getAvatarById, getColorById, getBadgeById } from './customizationService';

export const XP_REWARDS = {
  GAME_PLAYED: 15,
  DARE_COMPLETED: 50,
  GAME_WON: 100,
  REPLAY_VOTE: 5,
};

/**
 * Calculates the total XP required to reach a given level.
 * @param level The target level.
 * @returns The total XP required.
 */
export const calculateXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // A simple curve for XP requirements
  return Math.floor(100 * Math.pow(level - 1, 1.5));
};

/**
 * Determines a player's level and progress based on their total XP.
 * @param totalXp The player's total accumulated XP.
 * @returns An object with the player's current level, XP within that level, and XP needed for the next level.
 */
export const calculateLevelInfo = (totalXp: number) => {
  let level = 1;
  // Find the current level
  while (totalXp >= calculateXpForLevel(level + 1)) {
    level++;
  }
  const xpForCurrentLevel = calculateXpForLevel(level);
  const xpForNextLevel = calculateXpForLevel(level + 1);

  const xp = totalXp - xpForCurrentLevel;
  const xpToNextLevel = xpForNextLevel - xpForCurrentLevel;

  return { level, xp, xpToNextLevel };
};


const LEVEL_REWARDS: { level: number; unlockId: string; getItem: () => Avatar | ColorTheme | Badge | undefined }[] = [
    { level: 2, unlockId: 'level_2', getItem: () => getAvatarById('avatar_11') },
    { level: 3, unlockId: 'level_3', getItem: () => getColorById('color_9') },
    { level: 4, unlockId: 'level_4', getItem: () => getBadgeById('badge_veteran') },
    { level: 5, unlockId: 'level_5', getItem: () => getAvatarById('avatar_12') },
    { level: 7, unlockId: 'level_7', getItem: () => getColorById('color_10') },
    { level: 10, unlockId: 'level_10', getItem: () => getAvatarById('avatar_13') },
];

/**
 * Gets the cosmetic reward for achieving a specific level.
 * @param level The level that was just reached.
 * @returns An object containing the reward item and its unique unlockId, or null if there is no reward for that level.
 */
export const getRewardForLevel = (level: number): { item: Avatar | ColorTheme | Badge, unlockId: string } | null => {
    const reward = LEVEL_REWARDS.find(r => r.level === level);
    if (!reward) return null;
    
    const item = reward.getItem();
    if (!item) return null;

    return { item, unlockId: reward.unlockId };
};
