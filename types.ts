export type Category = 'General' | 'Programming' | 'Trivia' | 'Speed/Reflex';

export interface PlayerCustomization {
    avatarId: string;
    colorId: string;
    badgeId: string | null;
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
  MAIN_MENU = 'MAIN_MENU',
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

export type MiniGameType = 'QUICK_QUIZ' | 'TAP_SPEED' | 'NUMBER_RACE' | 'MEMORY_MATCH' | 'DOODLE_DOWN' | 'RHYTHM_RUSH' | 'SPOT_THE_DIFFERENCE';

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

export interface Badge {
    id: string;
    emoji: string;
    name: string;
    description: string;
    unlockId: string;
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