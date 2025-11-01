// FIX: Import missing DarePassReward and DarePassChallenge types.
import { DarePassReward, DarePassChallenge } from '../types';

export const STARS_PER_TIER = 10;
export const TOTAL_TIERS = 15;

export const CURRENT_SEASON_REWARDS: DarePassReward[] = [
  // Tier 1
  { tier: 1, isPremium: false, unlockId: 'badge_darepass_s1' },
  // Tier 2
  { tier: 2, isPremium: false, unlockId: 'color_2' }, // Free: Blue Color
  { tier: 3, isPremium: true, unlockId: 'avatar_3' }, // Premium: Wizard Avatar
  // Tier 4
  { tier: 4, isPremium: false, unlockId: 'color_3' }, // Free: Green Color
  // Tier 5
  { tier: 5, isPremium: true, unlockId: 'avatar_dp1' }, // Premium: Pirate Avatar
  // Tier 6
  { tier: 6, isPremium: false, unlockId: 'avatar_6' }, // Free: Dino Avatar
  // Tier 7
  { tier: 7, isPremium: false, unlockId: 'color_7' }, // Free: Indigo Color
  // Tier 8
  { tier: 8, isPremium: true, unlockId: 'color_dp1' }, // Premium: Gold Color
  // Tier 9
  { tier: 9, isPremium: false, unlockId: 'avatar_9' }, // Free: Detective Avatar
  // Tier 10
  { tier: 10, isPremium: false, unlockId: 'level_10' }, // Free: Celestial Avatar (from level rewards, as a bonus)
  // Tier 11
  { tier: 11, isPremium: true, unlockId: 'badge_winner' }, // Premium: Winner Badge
  // Tier 12
  { tier: 12, isPremium: true, unlockId: 'color_dp2' }, // Premium: Emerald Color
  // Tier 13
  { tier: 13, isPremium: false, unlockId: 'avatar_10' }, // Free: Alien Avatar
  // Tier 14
  { tier: 14, isPremium: false, unlockId: 'color_1' }, // Free: Purple Color
  // Tier 15
  { tier: 15, isPremium: true, unlockId: 'avatar_dp2' }, // Premium: Dragon Avatar
];

export const MOCK_CHALLENGES: Omit<DarePassChallenge, 'progress' | 'isClaimed'>[] = [
    {
        id: 'd1',
        type: 'play_minigame',
        description: 'Play 3 mini-games',
        goal: 3,
        stars: 5,
    },
    {
        id: 'd2',
        type: 'win_game',
        description: 'Win 1 game',
        goal: 1,
        stars: 10,
    },
     {
        id: 'w1',
        type: 'play_minigame',
        description: 'Play 10 mini-games',
        goal: 10,
        stars: 15,
    },
];

export const getInitialChallenges = (): DarePassChallenge[] => {
    return MOCK_CHALLENGES.map(c => ({
        ...c,
        progress: 0,
        isClaimed: false,
    }));
};
