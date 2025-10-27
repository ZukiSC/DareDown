export type Category = 'General' | 'Programming' | 'Trivia' | 'Speed/Reflex';

export interface PlayerCustomization {
    avatarId: string;
    colorId: string;
    badgeId: string | null;
}

export type PowerUpType = 'SKIP_DARE' | 'EXTRA_TIME' | 'SWAP_CATEGORY';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  category?: Category;
  customization: PlayerCustomization;
  unlocks: string[]; // e.g., ['badge_dare_survivor']
  powerUps: PowerUpType[];
}

export interface Dare {
  id: string;
  text: string;
  assigneeId: string; // The one who does the dare
  submitterId: string; // The one who suggested it
  status: 'pending' | 'completed';
  proof?: string; // URL to image or text proof
  votes: string[]; // Array of player IDs who voted for it
}

export enum GameState {
  CATEGORY_SELECTION = 'CATEGORY_SELECTION',
  CUSTOMIZATION = 'CUSTOMIZATION',
  LOBBY = 'LOBBY',
  MINIGAME = 'MINIGAME',
  DARE_SUBMISSION = 'DARE_SUBMISSION',
  DARE_VOTING = 'DARE_VOTING',
  DARE_SCREEN = 'DARE_SCREEN',
  LEADERBOARD = 'LEADERBOARD',
}

export type MiniGameType = 'QUICK_QUIZ' | 'TAP_SPEED' | 'NUMBER_RACE';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// A Challenge represents a specific task for a round
export interface Challenge {
    id: string;
    type: MiniGameType;
    category: Category;
    content: any; // Can be QuizQuestion or other types for different games
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
    primaryClass: string; // e.g., 'bg-red-500'
    secondaryClass: string; // e.g., 'border-red-300'
    unlockId?: string;
}

export interface Badge {
    id: string;
    emoji: string;
    name: string;
    description: string;
    unlockId: string; // All badges are unlockable
}

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
  reactions: { [emoji: string]: string[] }; // e.g., { '👍': ['p1', 'p2'] }
}
