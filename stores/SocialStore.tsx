import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, PropsWithChildren } from 'react';
import { Player, ChatMessage, PrivateChatMessage, FriendRequest, PlayerCustomization } from '../types';

// --- MOCK DATA ---
const MOCK_ALL_PLAYERS_DATA: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category'>[] = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    customization: { avatarId: `avatar_${(i % 10) + 1}`, colorId: `color_${(i % 8) + 1}`, badgeId: null },
    unlocks: [],
    stats: { wins: Math.floor(Math.random() * 20), daresCompleted: Math.floor(Math.random() * 50), daresFailed: Math.floor(Math.random() * 15) },
    friends: [],
    friendRequests: [],
    gameHistory: [],
    isOnline: Math.random() > 0.3,
}));

const initialPlayer: Player = {
    ...MOCK_ALL_PLAYERS_DATA[0],
    score: 0, isHost: false, powerUps: ['SKIP_DARE'],
    friends: ['p3', 'p5'],
    friendRequests: [{ fromId: 'p8', fromName: 'Player 8', fromCustomization: MOCK_ALL_PLAYERS_DATA[7].customization, status: 'pending' as const }],
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
  allPlayers: MOCK_ALL_PLAYERS_DATA.map(p => ({ ...p, score: 0, isHost: false, powerUps: [], category: undefined })),
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
        handleSendFriendRequest,
        handleAcceptFriendRequest,
        handleDeclineFriendRequest,
        handleSendMessage,
        handleReactToMessage,
        handleOpenPrivateChat,
        handleClosePrivateChat,
        handleSendPrivateMessage,
    }), [state, currentPlayer, updatePlayer, addPlayer, removePlayer]);

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
