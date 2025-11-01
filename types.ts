
export type Category = 'General' | 'Programming' | 'Trivia' | 'Speed/Reflex' | 'Wordplay' | 'Puzzles' | 'Creative';

export interface PlayerCustomization {
    avatarId: string;
    colorId: string;
    equippedBadge: { id: string; tier: number } | null;
}

export type PowerUpType = 'SKIP_DARE' | 'EXTRA_TIME' | 'SWAP_CATEGORY';

export interface PlayerStats {
    wins: number;
    daresCompleted: number;
    daresFailed: number;
}

export interface FriendRequest {
    fromId: string;
    fromName: string;
    fromCustomization: PlayerCustomization;
    status: 'pending';
}

export interface GameHistoryEntry {
    gameId: string;
    date: number;
    players: { id: string; name: string; customization: PlayerCustomization }[];
    winnerId: string;
    dare?: {
        dareId: string;
        text: string;
        assigneeName: string;
        completed: boolean;
        replayUrl?: string;
    };
}


export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  teamId: 'blue' | 'orange' | null;
  category?: Category;
  customization: PlayerCustomization;
  unlocks: string[];
  powerUps: PowerUpType[];
  // Social Features
  friends: string[]; // array of player IDs
  friendRequests: FriendRequest[];
  gameHistory: GameHistoryEntry[];
  stats: PlayerStats;
  isOnline?: boolean;
  bio?: string;
  badgeUnlocks: { [badgeId: string]: number }; // badgeId -> highest tier unlocked
  isMuted: boolean;
  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  // FIX: Add Dare Pass properties to Player interface
  // Dare Pass
  darePassTier: number;
  darePassStars: number;
  hasPremiumPass: boolean;
  darePassChallenges: DarePassChallenge[];
  // Auth
  email?: string;
  password?: string;
  isAdmin?: boolean;
}

export interface Dare {
  id:string;
  text: string;
  assigneeId: string;
  status: 'pending' | 'completed' | 'failed';
  proof?: string; 
  submitterId?: string;
  replayUrl?: string;
  votes?: number;
}

export enum GameState {
  AUTH = 'AUTH',
  MAIN_MENU = 'MAIN_MENU',
  JOIN_LOBBY = 'JOIN_LOBBY',
  PROFILE = 'PROFILE',
  CATEGORY_SELECTION = 'CATEGORY_SELECTION',
  CUSTOMIZATION = 'CUSTOMIZATION',
  LOBBY = 'LOBBY',
  MINIGAME = 'MINIGAME',
  SUDDEN_DEATH = 'SUDDEN_DEATH',
  DARE_SUBMISSION = 'DARE_SUBMISSION',
  DARE_VOTING = 'DARE_VOTING',
  DARE_SCREEN = 'DARE_SCREEN',
  DARE_LIVE_STREAM = 'DARE_LIVE_STREAM',
  DARE_PROOF = 'DARE_PROOF',
  LEADERBOARD = 'LEADERBOARD',
  GAME_END = 'GAME_END',
}

export type MiniGameType = 'QUICK_QUIZ' | 'TAP_SPEED' | 'NUMBER_RACE' | 'MEMORY_MATCH' | 'DOODLE_DOWN' | 'RHYTHM_RUSH' | 'SPOT_THE_DIFFERENCE' | 'WORD_SCRAMBLE' | 'EMOJI_PUZZLE';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Challenge {
    id: string;
    type: MiniGameType;
    category: Category;
    content: any;
}

// --- COSMETIC TYPES ---
export interface Avatar {
    id: string;
    emoji: string;
    name: string;
    unlockId?: string;
}

export interface ColorTheme {
    id: string;
    name: string;
    primaryClass: string;
    secondaryClass: string;
    unlockId?: string;
}

export interface BadgeTier {
    tier: number;
    name: string;
    emoji: string;
    unlockRequirement: {
        stat: 'daresCompleted' | 'wins';
        value: number;
        description: string;
    };
}

export interface Badge {
    id: string;
    name: string; // Base name, e.g., "Dare Survivor"
    description: string;
    tiers: BadgeTier[];
}

// --- NOTIFICATION & UNLOCK TYPES ---
export type UnlockNotificationData = 
    | { type: 'powerup', item: PowerUp }
    | { type: 'item', item: Avatar | ColorTheme | Badge }
    | { type: 'badge_upgrade', item: Badge, tier: BadgeTier };


// --- POWER-UP TYPES ---
export interface PowerUp {
    id: PowerUpType;
    name: string;
    description: string;
    emoji: string;
}

// --- CHAT TYPES ---
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerCustomization: PlayerCustomization;
  text: string;
  timestamp: number;
  reactions: { [emoji: string]: string[] };
}

export interface PrivateChatMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

// --- LIVE INTERACTION TYPES ---
export interface FloatingGreeting {
  id: string;
  fromName: string;
  fromColorClass: string; // Tailwind class like 'border-purple-300'
  content: string;
}

export type DareMode = 'AI' | 'COMMUNITY';

// FIX: Add missing type definitions
// --- LOBBY & SOCIAL TYPES ---
export interface PublicLobby {
  id: string;
  hostName: string;
  hostCustomization: PlayerCustomization;
  playerCount: number;
  maxPlayers: number;
  category: Category;
  dareMode: DareMode;
}

export interface HallOfFameEntry {
  dare: Dare;
  assignee: Player;
  votes: number;
}

// --- COMMUNITY & CUSTOMIZATION ---
export interface DarePack {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  dares: string[];
  votes: number;
  isOfficial?: boolean;
}

// --- DARE PASS TYPES ---
export type DarePassChallengeType = 'play_minigame' | 'win_game';

export interface DarePassChallenge {
  id: string;
  type: DarePassChallengeType;
  description: string;
  goal: number;
  progress: number;
  stars: number;
  isClaimed: boolean;
}

export interface DarePassReward {
  tier: number;
  isPremium: boolean;
  unlockId: string;
}