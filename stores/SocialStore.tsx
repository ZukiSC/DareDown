
// FIX: Add DarePassChallenge to import.
import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, PropsWithChildren } from 'react';
import { Player, ChatMessage, PrivateChatMessage, FriendRequest, PlayerCustomization, Avatar, Badge, ColorTheme, BadgeTier, DarePassChallenge } from '../types';
import { calculateLevelInfo, calculateXpForLevel, getRewardForLevel } from '../services/levelingService';
import { getAllBadges } from '../services/customizationService';
import { getInitialChallenges } from '../services/darePassService';


// --- MOCK DATA ---
const MOCK_ALL_PLAYERS_DATA: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category' | 'teamId'>[] = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    email: `player${i+1}@daredown.com`,
    password: 'password123',
    isAdmin: false,
    bio: `Just here for the dares! Currently on a ${Math.floor(Math.random() * 10)}-game winning streak.`,
    customization: { avatarId: `avatar_${(i % 10) + 1}`, colorId: `color_${(i % 8) + 1}`, equippedBadge: null },
    unlocks: [],
    stats: { wins: Math.floor(Math.random() * 20), daresCompleted: Math.floor(Math.random() * 50), daresFailed: Math.floor(Math.random() * 15) },
    friends: [],
    friendRequests: [],
    gameHistory: [],
    isOnline: Math.random() > 0.3,
    level: 1,
    xp: 0,
    xpToNextLevel: calculateLevelInfo(0).xpToNextLevel,
    badgeUnlocks: {},
    // FIX: Add Dare Pass properties to mock data
    darePassTier: 1,
    darePassStars: 0,
    hasPremiumPass: false,
    darePassChallenges: getInitialChallenges(),
}));

const initialPlayer: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category' | 'teamId'> & { friends: string[], friendRequests: FriendRequest[] } = {
    ...MOCK_ALL_PLAYERS_DATA[0],
    email: 'admin@daredown.com',
    isAdmin: true,
    bio: 'The original DareDown champion. Challenge me if you dare!',
    friends: ['p3', 'p5'],
    friendRequests: [{ fromId: 'p8', fromName: 'Player 8', fromCustomization: MOCK_ALL_PLAYERS_DATA[7].customization, status: 'pending' as const }],
    stats: { wins: 5, daresCompleted: 12, daresFailed: 3 },
    badgeUnlocks: { 'badge_dare_survivor': 2, 'badge_winner': 2 }, // Unlocked silver for both
    customization: { avatarId: 'avatar_1', colorId: 'color_1', equippedBadge: { id: 'badge_dare_survivor', tier: 2 } },
    // FIX: Add Dare Pass properties to initial player
    hasPremiumPass: true,
    darePassTier: 3,
    darePassStars: 5,
};
MOCK_ALL_PLAYERS_DATA[0] = initialPlayer;
MOCK_ALL_PLAYERS_DATA[2].friends.push('p1');
MOCK_ALL_PLAYERS_DATA[4].friends.push('p1');
// --- END MOCK DATA ---

// --- STATE ---
interface SocialStoreState {
  allPlayers: Player[];
  currentPlayerId: string | null;
  chatMessages: ChatMessage[];
  privateChats: { [key: string]: PrivateChatMessage[] };
}

const initialState: SocialStoreState = {
  allPlayers: MOCK_ALL_PLAYERS_DATA.map(p => ({ ...p, score: 0, isHost: false, powerUps: [], category: undefined, teamId: null })),
  currentPlayerId: null,
  chatMessages: [],
  privateChats: {},
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_CURRENT_PLAYER'; payload: string | null }
  | { type: 'UPDATE_PLAYER'; payload: { playerId: string; updates: Partial<Player> } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'REACT_TO_MESSAGE'; payload: { messageId: string; emoji: string; reactorId: string } }
  | { type: 'ADD_PRIVATE_CHAT_MESSAGES'; payload: { friendId: string; messages: PrivateChatMessage[] } }
  | { type: 'OPEN_PRIVATE_CHAT'; payload: string }
  | { type: 'CLOSE_PRIVATE_CHAT'; payload: string };

// --- REDUCER ---
const socialReducer = (state: SocialStoreState, action: Action): SocialStoreState => {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER':
        return { ...state, currentPlayerId: action.payload };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        allPlayers: state.allPlayers.map(p =>
          p.id === action.payload.playerId ? { ...p, ...action.payload.updates } : p
        ),
      };
    case 'ADD_PLAYER':
      return { ...state, allPlayers: [...state.allPlayers, action.payload] };
    case 'REMOVE_PLAYER':
      return { ...state, allPlayers: state.allPlayers.filter(p => p.id !== action.payload) };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'REACT_TO_MESSAGE': {
        const { messageId, emoji, reactorId } = action.payload;
        return {
            ...state,
            chatMessages: state.chatMessages.map(msg => {
                if (msg.id === messageId) {
                    const newReactions = { ...msg.reactions };
                    const existingReactors = newReactions[emoji] || [];
                    if (existingReactors.includes(reactorId)) {
                        newReactions[emoji] = existingReactors.filter(id => id !== reactorId);
                        if (newReactions[emoji].length === 0) delete newReactions[emoji];
                    } else {
                        newReactions[emoji] = [...existingReactors, reactorId];
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            })
        };
    }
    case 'ADD_PRIVATE_CHAT_MESSAGES':
      return {
        ...state,
        privateChats: {
          ...state.privateChats,
          [action.payload.friendId]: [
            ...(state.privateChats[action.payload.friendId] || []),
            ...action.payload.messages,
          ],
        },
      };
    case 'OPEN_PRIVATE_CHAT':
        if (state.privateChats[action.payload]) return state;
        return { ...state, privateChats: { ...state.privateChats, [action.payload]: [] } };
    case 'CLOSE_PRIVATE_CHAT': {
        const newChats = { ...state.privateChats };
        delete newChats[action.payload];
        return { ...state, privateChats: newChats };
    }
    default:
      return state;
  }
};

// --- CONTEXT ---
interface SocialStoreContextType extends SocialStoreState {
  currentPlayer: Player | null;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addXp: (playerId: string, amount: number) => Promise<{ leveledUp: boolean; newLevel?: number; reward?: Avatar | ColorTheme | Badge } | null>;
  checkForBadgeUpgrades: (playerId: string) => { badge: Badge, tier: BadgeTier } | null;
  // Auth
  handleLogin: (email: string, pass: string) => Promise<boolean>;
  handleSignup: (name: string, email: string, pass: string) => Promise<boolean>;
  handleLogout: () => void;
  // Social
  handleUpdateBio: (playerId: string, bio: string) => void;
  handleSendFriendRequest: (targetId: string) => boolean;
  handleAcceptFriendRequest: (fromId: string) => string | null;
  handleDeclineFriendRequest: (fromId: string) => void;
  handleSendMessage: (text: string) => void;
  handleReactToMessage: (messageId: string, emoji: string) => void;
  handleOpenPrivateChat: (friendId: string) => void;
  handleClosePrivateChat: (friendId: string) => void;
  handleSendPrivateMessage: (toId: string, text: string) => void;
}

const SocialStoreContext = createContext<SocialStoreContextType | undefined>(undefined);

export const SocialStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(socialReducer, initialState);

    const currentPlayer = useMemo(() => state.allPlayers.find(p => p.id === state.currentPlayerId) || null, [state.allPlayers, state.currentPlayerId]);

    // --- MOCK CHAT ---
    useEffect(() => {
        if (!currentPlayer) return;
        const chatInterval = setInterval(() => {
          const roomPlayers = state.allPlayers.slice(0, 8); // Simulate a room
          const bots = roomPlayers.filter(p => p.id !== state.currentPlayerId);
          if (bots.length > 0 && Math.random() < 0.25) { 
            const bot = bots[Math.floor(Math.random() * bots.length)];
            const messages = ["Let's go!", "Who's ready to lose?", "This is gonna be fun!", "Good luck!", "Don't mess up!"];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            const newMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              playerId: bot.id,
              playerName: bot.name,
              playerCustomization: bot.customization,
              text: randomMessage,
              timestamp: Date.now(),
              reactions: {},
            };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
          }
        }, 6000);
        return () => clearInterval(chatInterval);
      }, [state.allPlayers, state.currentPlayerId, currentPlayer]);

    // --- HANDLERS ---
    const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
        dispatch({ type: 'UPDATE_PLAYER', payload: { playerId, updates } });
    }, []);
    const addPlayer = useCallback((player: Player) => dispatch({ type: 'ADD_PLAYER', payload: player }), []);
    const removePlayer = useCallback((playerId: string) => dispatch({ type: 'REMOVE_PLAYER', payload: playerId }), []);
    
    const addXp = useCallback(async (playerId: string, amount: number): Promise<{ leveledUp: boolean; newLevel?: number; reward?: Avatar | ColorTheme | Badge } | null> => {
        const player = state.allPlayers.find(p => p.id === playerId);
        if (!player) return null;

        const currentTotalXp = calculateXpForLevel(player.level) + player.xp;
        const newTotalXp = currentTotalXp + amount;
        const oldLevel = player.level;
        const { level: newLevel, xp: newXp, xpToNextLevel: newXpToNextLevel } = calculateLevelInfo(newTotalXp);

        let newUnlocks = player.unlocks;
        let finalReward: Avatar | ColorTheme | Badge | undefined;

        if (newLevel > oldLevel) {
            for (let i = oldLevel + 1; i <= newLevel; i++) {
                const reward = getRewardForLevel(i);
                if (reward && !newUnlocks.includes(reward.unlockId)) {
                    newUnlocks = [...newUnlocks, reward.unlockId];
                    finalReward = reward.item; 
                }
            }
        }
        
        updatePlayer(playerId, {
            level: newLevel,
            xp: newXp,
            xpToNextLevel: newXpToNextLevel,
            unlocks: newUnlocks
        });

        if (newLevel > oldLevel) {
            return { leveledUp: true, newLevel, reward: finalReward };
        }
        
        return { leveledUp: false };
    }, [state.allPlayers, updatePlayer]);

    const checkForBadgeUpgrades = useCallback((playerId: string): { badge: Badge, tier: BadgeTier } | null => {
        const player = state.allPlayers.find(p => p.id === playerId);
        if (!player) return null;

        const allGameBadges = getAllBadges();
        let newBadgeUnlocks = { ...player.badgeUnlocks };
        let didUpgrade = false;
        let firstUpgrade: { badge: Badge, tier: BadgeTier } | null = null;

        allGameBadges.forEach(badge => {
            const currentTier = newBadgeUnlocks[badge.id] || 0;
            const nextTier = badge.tiers.find(t => t.tier === currentTier + 1);

            if (nextTier) {
                const statValue = player.stats[nextTier.unlockRequirement.stat];
                if (statValue >= nextTier.unlockRequirement.value) {
                    newBadgeUnlocks[badge.id] = nextTier.tier;
                    didUpgrade = true;
                    if (!firstUpgrade) {
                        firstUpgrade = { badge, tier: nextTier };
                    }
                }
            }
        });

        if (didUpgrade) {
            updatePlayer(playerId, { badgeUnlocks: newBadgeUnlocks });
        }
        
        return firstUpgrade;
    }, [state.allPlayers, updatePlayer]);

    const handleLogin = async (email: string, pass: string): Promise<boolean> => {
        const player = state.allPlayers.find(p => p.email === email && p.password === pass);
        if (player) {
            dispatch({ type: 'SET_CURRENT_PLAYER', payload: player.id });
            return true;
        }
        return false;
    };

    const handleSignup = async (name: string, email: string, pass: string): Promise<boolean> => {
        if (state.allPlayers.some(p => p.email === email)) {
            return false; // Email already exists
        }
        const newPlayer: Player = {
            id: `p${state.allPlayers.length + 1}`,
            name,
            email,
            password: pass,
            isAdmin: false,
            bio: 'New to DareDown!',
            customization: { avatarId: 'avatar_1', colorId: 'color_1', equippedBadge: null },
            unlocks: [],
            stats: { wins: 0, daresCompleted: 0, daresFailed: 0 },
            friends: [],
            friendRequests: [],
            gameHistory: [],
            isOnline: true,
            level: 1,
            xp: 0,
            xpToNextLevel: calculateLevelInfo(0).xpToNextLevel,
            badgeUnlocks: {},
            score: 0,
            isHost: false,
            powerUps: [],
            teamId: null,
            // FIX: Add Dare Pass properties for new players
            darePassTier: 1,
            darePassStars: 0,
            hasPremiumPass: false,
            darePassChallenges: getInitialChallenges(),
        };
        addPlayer(newPlayer);
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: newPlayer.id });
        return true;
    };
    
    const handleLogout = () => {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: null });
    };

    const handleUpdateBio = useCallback((playerId: string, bio: string) => {
        updatePlayer(playerId, { bio });
    }, [updatePlayer]);
    
    const handleSendFriendRequest = (targetId: string): boolean => {
        if (!currentPlayer) return false;
        const newRequest: FriendRequest = {
            fromId: currentPlayer.id, fromName: currentPlayer.name,
            fromCustomization: currentPlayer.customization, status: 'pending'
        };
        const targetPlayer = state.allPlayers.find(p => p.id === targetId);
        if(targetPlayer) {
            updatePlayer(targetId, { friendRequests: [...targetPlayer.friendRequests, newRequest] });
            return true;
        }
        return false;
    };

    const handleAcceptFriendRequest = (fromId: string): string | null => {
        if (!currentPlayer) return null;
        const fromPlayer = state.allPlayers.find(p => p.id === fromId);
        if (!fromPlayer) return null;

        updatePlayer(currentPlayer.id, {
            friends: [...currentPlayer.friends, fromId],
            friendRequests: currentPlayer.friendRequests.filter(req => req.fromId !== fromId)
        });
        updatePlayer(fromId, { friends: [...fromPlayer.friends, currentPlayer.id] });
        return fromPlayer.name;
    };

    const handleDeclineFriendRequest = (fromId: string) => {
        if (!currentPlayer) return;
        updatePlayer(currentPlayer.id, {
            friendRequests: currentPlayer.friendRequests.filter(req => req.fromId !== fromId)
        });
    };

    const handleSendMessage = (text: string) => {
        if (!currentPlayer) return;
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`, playerId: currentPlayer.id, playerName: currentPlayer.name,
          playerCustomization: currentPlayer.customization, text, timestamp: Date.now(), reactions: {},
        };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
    };

    const handleReactToMessage = (messageId: string, emoji: string) => {
        if (!currentPlayer) return;
        dispatch({ type: 'REACT_TO_MESSAGE', payload: { messageId, emoji, reactorId: currentPlayer.id } });
    };

    const handleOpenPrivateChat = (friendId: string) => {
        dispatch({ type: 'OPEN_PRIVATE_CHAT', payload: friendId });
    };
    
    const handleClosePrivateChat = (friendId: string) => {
        dispatch({ type: 'CLOSE_PRIVATE_CHAT', payload: friendId });
    };

    const handleSendPrivateMessage = (toId: string, text: string) => {
        if (!currentPlayer) return;
        const newMessage: PrivateChatMessage = {
            id: `priv_${Date.now()}`, fromId: currentPlayer.id, toId, text,
            timestamp: Date.now(), isRead: false
        };
        dispatch({ type: 'ADD_PRIVATE_CHAT_MESSAGES', payload: { friendId: toId, messages: [newMessage] } });
        
        // Simulate reply
        setTimeout(() => {
            const reply: PrivateChatMessage = {
                id: `priv_${Date.now()}_reply`, fromId: toId, toId: currentPlayer.id,
                text: "Haha nice!", timestamp: Date.now(), isRead: false
            };
            dispatch({ type: 'ADD_PRIVATE_CHAT_MESSAGES', payload: { friendId: toId, messages: [reply] } });
        }, 2000);
    };

    const value = useMemo(() => ({
        ...state,
        currentPlayer,
        updatePlayer,
        addPlayer,
        removePlayer,
        addXp,
        checkForBadgeUpgrades,
        handleLogin,
        handleSignup,
        handleLogout,
        handleUpdateBio,
        handleSendFriendRequest,
        handleAcceptFriendRequest,
        handleDeclineFriendRequest,
        handleSendMessage,
        handleReactToMessage,
        handleOpenPrivateChat,
        handleClosePrivateChat,
        handleSendPrivateMessage,
    }), [state, currentPlayer, updatePlayer, addPlayer, removePlayer, addXp, checkForBadgeUpgrades, handleUpdateBio]);

    return (
        <SocialStoreContext.Provider value={value}>
            {children}
        </SocialStoreContext.Provider>
    );
};

// --- HOOK ---
export const useSocialStore = () => {
    const context = useContext(SocialStoreContext);
    if (context === undefined) {
        throw new Error('useSocialStore must be used within a SocialStoreProvider');
    }
    return context;
};
