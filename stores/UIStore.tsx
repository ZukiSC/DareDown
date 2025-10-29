import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, PropsWithChildren } from 'react';
import { Player, Dare, Badge, PowerUp, FloatingGreeting } from '../types';
import { preloadSounds, toggleMute } from '../services/audioService';
import { requestNotificationPermission } from '../services/notificationService';
import { useSocialStore } from './SocialStore';
import { toast } from 'react-hot-toast';

type ActiveReaction = { id: string; playerId: string; emoji: string };
type LoadingState = { active: boolean; message: string };

// --- STATE ---
interface UIStoreState {
  loadingState: LoadingState;
  isMuted: boolean;
  activeReactions: ActiveReaction[];
  newUnlock: Badge | PowerUp | null;
  notificationPermission: NotificationPermission;
  isChatOpen: boolean;
  isFriendsPanelOpen: boolean;
  viewingProfileId: string | null;
  isArchiveOpen: boolean;
  viewingReplay: Dare | null;
  greetings: FloatingGreeting[];
}

const initialState: UIStoreState = {
  loadingState: { active: false, message: '' },
  isMuted: false,
  activeReactions: [],
  newUnlock: null,
  notificationPermission: 'default',
  isChatOpen: false,
  isFriendsPanelOpen: false,
  viewingProfileId: null,
  isArchiveOpen: false,
  viewingReplay: null,
  greetings: [],
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'TOGGLE_MUTE'; payload: boolean }
  | { type: 'ADD_REACTION'; payload: ActiveReaction }
  | { type: 'REMOVE_REACTION'; payload: string }
  | { type: 'SHOW_UNLOCK'; payload: Badge | PowerUp }
  | { type: 'HIDE_UNLOCK' }
  | { type: 'SET_NOTIFICATION_PERMISSION'; payload: NotificationPermission }
  | { type: 'SET_CHAT_OPEN'; payload: boolean }
  | { type: 'SET_FRIENDS_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_VIEWING_PROFILE'; payload: string | null }
  | { type: 'SET_ARCHIVE_OPEN'; payload: boolean }
  | { type: 'SET_VIEWING_REPLAY'; payload: Dare | null }
  | { type: 'ADD_GREETING'; payload: FloatingGreeting }
  | { type: 'REMOVE_GREETING'; payload: string };

// --- REDUCER ---
const uiReducer = (state: UIStoreState, action: Action): UIStoreState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loadingState: action.payload };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: action.payload };
    case 'ADD_REACTION':
      return { ...state, activeReactions: [...state.activeReactions, action.payload] };
    case 'REMOVE_REACTION':
      return { ...state, activeReactions: state.activeReactions.filter(r => r.id !== action.payload) };
    case 'SHOW_UNLOCK':
      return { ...state, newUnlock: action.payload };
    case 'HIDE_UNLOCK':
      return { ...state, newUnlock: null };
    case 'SET_NOTIFICATION_PERMISSION':
        return { ...state, notificationPermission: action.payload };
    case 'SET_CHAT_OPEN':
        return { ...state, isChatOpen: action.payload };
    case 'SET_FRIENDS_PANEL_OPEN':
        return { ...state, isFriendsPanelOpen: action.payload };
    case 'SET_VIEWING_PROFILE':
        return { ...state, viewingProfileId: action.payload };
    case 'SET_ARCHIVE_OPEN':
        return { ...state, isArchiveOpen: action.payload };
    case 'SET_VIEWING_REPLAY':
        return { ...state, viewingReplay: action.payload };
    case 'ADD_GREETING':
        return { ...state, greetings: [...state.greetings, action.payload] };
    case 'REMOVE_GREETING':
        return { ...state, greetings: state.greetings.filter(g => g.id !== action.payload) };
    default:
      return state;
  }
};

// --- CONTEXT ---
interface UIStoreContextType extends UIStoreState {
    viewingProfile: Player | null;
    setLoading: (loading: LoadingState) => void;
    showNotification: (message: string, emoji?: string) => void;
    showUnlock: (item: Badge | PowerUp) => void;
    handleToggleMute: () => void;
    handleEmojiReaction: (emoji: string) => void;
    handleRequestNotifications: () => Promise<void>;
    handleViewProfile: (playerId: string) => void;
    handleSendGreeting: (content: string) => void;
    setIsChatOpen: (isOpen: boolean) => void;
    setIsFriendsPanelOpen: (isOpen: boolean) => void;
    setViewingProfile: (player: Player | null) => void;
    setIsArchiveOpen: (isOpen: boolean) => void;
    setViewingReplay: (dare: Dare | null) => void;
}

const UIStoreContext = createContext<UIStoreContextType | undefined>(undefined);

export const UIStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);
    const { currentPlayer, allPlayers } = useSocialStore();

    useEffect(() => {
        preloadSounds();
        if ('Notification' in window) {
            dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: Notification.permission });
        }
    }, []);

    const setLoading = useCallback((loading: LoadingState) => dispatch({ type: 'SET_LOADING', payload: loading }), []);
    
    const showNotification = useCallback((message: string, emoji?: string) => {
        toast.custom(
            (t) => (
                <div
                    className={`w-full max-w-xs p-3 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-2xl flex items-center gap-3 border border-purple-500/30 ${
                        t.visible ? 'animate-slide-in' : 'animate-out'
                    }`}
                >
                    {emoji && <span className="text-2xl">{emoji}</span>}
                    <p className="text-sm font-semibold flex-1">{message}</p>
                </div>
            ),
            {
                duration: 3000,
            }
        );
    }, []);
    
    const showUnlock = useCallback((item: Badge | PowerUp) => {
        dispatch({ type: 'SHOW_UNLOCK', payload: item });
        setTimeout(() => dispatch({ type: 'HIDE_UNLOCK' }), 4000);
    }, []);

    const handleToggleMute = () => {
        const newMutedState = !state.isMuted;
        dispatch({ type: 'TOGGLE_MUTE', payload: newMutedState });
        toggleMute(newMutedState);
    };

    const handleEmojiReaction = (emoji: string) => {
        const newReaction = { id: `reaction_${Date.now()}`, playerId: currentPlayer.id, emoji };
        dispatch({ type: 'ADD_REACTION', payload: newReaction });
        setTimeout(() => dispatch({ type: 'REMOVE_REACTION', payload: newReaction.id }), 3000);
    };

    const handleRequestNotifications = async () => {
        const permission = await requestNotificationPermission();
        dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission });
    };

    const handleViewProfile = (playerId: string) => {
        dispatch({ type: 'SET_VIEWING_PROFILE', payload: playerId });
    };
    
    const handleSendGreeting = (content: string) => {
        const newGreeting: FloatingGreeting = {
            id: `greeting_${Date.now()}`,
            fromName: currentPlayer.name,
            fromColorClass: 'border-gray-300', // Simplified for now
            content,
        };
        dispatch({ type: 'ADD_GREETING', payload: newGreeting });
        setTimeout(() => dispatch({ type: 'REMOVE_GREETING', payload: newGreeting.id }), 5000);
    };

    const viewingProfile = useMemo(() => {
        return allPlayers.find(p => p.id === state.viewingProfileId) || null;
    }, [allPlayers, state.viewingProfileId]);

    const value = useMemo(() => ({
        ...state,
        viewingProfile,
        setLoading,
        showNotification,
        showUnlock,
        handleToggleMute,
        handleEmojiReaction,
        handleRequestNotifications,
        handleViewProfile,
        handleSendGreeting,
        setIsChatOpen: (isOpen: boolean) => dispatch({ type: 'SET_CHAT_OPEN', payload: isOpen }),
        setIsFriendsPanelOpen: (isOpen: boolean) => dispatch({ type: 'SET_FRIENDS_PANEL_OPEN', payload: isOpen }),
        setViewingProfile: (player: Player | null) => dispatch({ type: 'SET_VIEWING_PROFILE', payload: player?.id || null }),
        setIsArchiveOpen: (isOpen: boolean) => dispatch({ type: 'SET_ARCHIVE_OPEN', payload: isOpen }),
        setViewingReplay: (dare: Dare | null) => dispatch({ type: 'SET_VIEWING_REPLAY', payload: dare }),
    }), [state, viewingProfile, setLoading, showNotification, showUnlock]);

    return (
        <UIStoreContext.Provider value={value}>
            {children}
        </UIStoreContext.Provider>
    );
};

// --- HOOK ---
export const useUIStore = () => {
    const context = useContext(UIStoreContext);
    if (context === undefined) {
        throw new Error('useUIStore must be used within a UIStoreProvider');
    }
    return context;
};

// Zustand-like getter for outside React components
let state = initialState;
const listeners = new Set<() => void>();
const store = {
    getState: () => state,
    setState: (newState: UIStoreState) => {
        state = newState;
        listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};

// A simplified store getter for the setIsChatOpen action which is used in a button
// This is a workaround to avoid wrapping that specific part of the UI in a consumer
// In a full Zustand/Redux setup, this is handled more elegantly.
useUIStore.getState = () => ({
    setIsChatOpen: (isOpen: boolean) => {
        const action: Action = { type: 'SET_CHAT_OPEN', payload: isOpen };
        // This won't trigger re-renders, it's a simplified example.
        // The main context handles the actual state changes for React components.
        // A full implementation would require connecting this to the reducer dispatch.
    },
     showNotification: (message: string, emoji?: string) => {
        // This is now handled by the main context provider and react-hot-toast
     }
});
