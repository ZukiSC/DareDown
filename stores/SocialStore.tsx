
import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, PropsWithChildren } from 'react';
import { Player, ChatMessage, PrivateChatMessage, FriendRequest, PlayerCustomization, Avatar, Badge, ColorTheme, DarePassChallenge, BadgeTier } from '../types';
import { calculateLevelInfo, calculateXpForLevel, getRewardForLevel } from '../services/levelingService';
import { getInitialChallenges, STARS_PER_TIER, CURRENT_SEASON_REWARDS } from '../services/darePassService';
import { getAllBadges } from '../services/customizationService';

// --- MOCK DATA ---
const MOCK_ALL_PLAYERS_DATA: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category' | 'teamId'>[] = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
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
    // Dare Pass
    darePassTier: 1,
    darePassStars: 0,
    hasPremiumPass: false,
    darePassChallenges: getInitialChallenges(),
}));

const initialPlayer: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category' | 'teamId'> & { friends: string[], friendRequests: FriendRequest[] } = {
    ...MOCK_ALL_PLAYERS_DATA[0],
    friends: ['p3', 'p5'],
    friendRequests: [{ fromId: 'p8', fromName: 'Player 8', fromCustomization: MOCK_ALL_PLAYERS_DATA[7].customization, status: 'pending' as const }],
    hasPremiumPass: true, // Main player has premium for testing
    stats: { wins: 5, daresCompleted: 12, daresFailed: 3 },
    badgeUnlocks: { 'badge_dare_survivor': 2, 'badge_winner': 2 }, // Unlocked silver for both
    customization: { avatarId: 'avatar_1', colorId: 'color_1', equippedBadge: { id: 'badge_dare_survivor', tier: 2 } },
};
MOCK_ALL_PLAYERS_DATA[0] = initialPlayer;
MOCK_ALL_PLAYERS_DATA[2].friends.push('p1');
MOCK_ALL_PLAYERS_DATA[4].friends.push('p1');
// --- END MOCK DATA ---

// --- STATE ---
interface SocialStoreState {
  allPlayers: Player[];
  currentPlayerId: string;
  chatMessages: ChatMessage[];
  privateChats: { [key: string]: PrivateChatMessage[] };
}

const initialState: SocialStoreState = {
  allPlayers: MOCK_ALL_PLAYERS_DATA.map(p => ({ ...p, score: 0, isHost: false, powerUps: [], category: undefined, teamId: null })),
  currentPlayerId: 'p1',
  chatMessages: [],
  privateChats: {},
};

// --- ACTIONS ---
type Action =
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
                    ...action.payload.messages
                ]
            }
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
  currentPlayer: Player;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addXp: (playerId: string, amount: number) => Promise<{ leveledUp: boolean; newLevel?: number; reward?: Avatar | ColorTheme | Badge } | null>;
  checkForBadgeUpgrades: (playerId: string) => { badge: Badge, tier: BadgeTier } | null;
  // Dare Pass
  updateChallengeProgress: (playerId: string, type: 'play_minigame' | 'win_game', amount: number) => void;
  claimChallengeReward: (playerId: string, challengeId: string) => void;
  purchasePremiumPass: (playerId: string) => void;
  // Social
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

    const currentPlayer = useMemo(() => state.allPlayers.find(p => p.id === state.currentPlayerId)!, [state.allPlayers, state.currentPlayerId]);

    // --- MOCK CHAT ---
    useEffect(() => {
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
      }, [state.allPlayers, state.currentPlayerId]);

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

    const updateChallengeProgress = useCallback((playerId: string, type: 'play_minigame' | 'win_game', amount: number) => {
        const player = state.allPlayers.find(p => p.id === playerId);
        if (!player) return;

        const updatedChallenges = player.darePassChallenges.map(challenge => {
            if (challenge.type === type && !challenge.isClaimed) {
                return { ...challenge, progress: Math.min(challenge.goal, challenge.progress + amount) };
            }
            return challenge;
        });
        updatePlayer(playerId, { darePassChallenges: updatedChallenges });
    }, [state.allPlayers, updatePlayer]);

    const claimChallengeReward = useCallback((playerId: string, challengeId: string) => {
        const player = state.allPlayers.find(p => p.id === playerId);
        if (!player) return;

        const challenge = player.darePassChallenges.find(c => c.id === challengeId);
        if (!challenge || challenge.isClaimed || challenge.progress < challenge.goal) return;

        let currentStars = player.darePassStars + challenge.stars;
        let currentTier = player.darePassTier;
        let newUnlocks = [...player.unlocks];

        while (currentStars >= STARS_PER_TIER) {
            currentTier += 1;
            currentStars -= STARS_PER_TIER;

            const rewardsForTier = CURRENT_SEASON_REWARDS.filter(r => r.tier === currentTier);
            for (const reward of rewardsForTier) {
                const canUnlock = !reward.isPremium || (reward.isPremium && player.hasPremiumPass);
                if (canUnlock && !newUnlocks.includes(reward.unlockId)) {
                    newUnlocks.push(reward.unlockId);
                }
            }
        }
        
        const updatedChallenges = player.darePassChallenges.map(c => c.id === challengeId ? { ...c, isClaimed: true } : c);

        updatePlayer(playerId, {
            darePassTier: currentTier,
            darePassStars: currentStars,
            darePassChallenges: updatedChallenges,
            unlocks: newUnlocks,
        });

    }, [state.allPlayers, updatePlayer]);

    const purchasePremiumPass = useCallback((playerId: string) => {
        const player = state.allPlayers.find(p => p.id === playerId);
        if (!player || player.hasPremiumPass) return;
        
        let newUnlocks = [...player.unlocks];
        for (let i = 1; i <= player.darePassTier; i++) {
            const premiumReward = CURRENT_SEASON_REWARDS.find(r => r.tier === i && r.isPremium);
            if (premiumReward && !newUnlocks.includes(premiumReward.unlockId)) {
                newUnlocks.push(premiumReward.unlockId);
            }
        }

        updatePlayer(playerId, {
            hasPremiumPass: true,
            unlocks: newUnlocks,
        });
    }, [state.allPlayers, updatePlayer]);
    
    const handleSendFriendRequest = (targetId: string): boolean => {
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
        updatePlayer(currentPlayer.id, {
            friendRequests: currentPlayer.friendRequests.filter(req => req.fromId !== fromId)
        });
    };

    const handleSendMessage = (text: string) => {
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`, playerId: currentPlayer.id, playerName: currentPlayer.name,
          playerCustomization: currentPlayer.customization, text, timestamp: Date.now(), reactions: {},
        };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
    };

    const handleReactToMessage = (messageId: string, emoji: string) => {
        dispatch({ type: 'REACT_TO_MESSAGE', payload: { messageId, emoji, reactorId: currentPlayer.id } });
    };

    const handleOpenPrivateChat = (friendId: string) => {
        dispatch({ type: 'OPEN_PRIVATE_CHAT', payload: friendId });
    };
    
    const handleClosePrivateChat = (friendId: string) => {
        dispatch({ type: 'CLOSE_PRIVATE_CHAT', payload: friendId });
    };

    const handleSendPrivateMessage = (toId: string, text: string) => {
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
        updateChallengeProgress,
        claimChallengeReward,
        purchasePremiumPass,
        handleSendFriendRequest,
        handleAcceptFriendRequest,
        handleDeclineFriendRequest,
        handleSendMessage,
        handleReactToMessage,
        handleOpenPrivateChat,
        handleClosePrivateChat,
        handleSendPrivateMessage,
    }), [state, currentPlayer, updatePlayer, addPlayer, removePlayer, addXp, checkForBadgeUpgrades, updateChallengeProgress, claimChallengeReward, purchasePremiumPass]);

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
