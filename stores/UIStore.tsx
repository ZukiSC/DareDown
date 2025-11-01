import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, PropsWithChildren } from 'react';
import { Player, Dare, Badge, PowerUp, FloatingGreeting, Avatar, ColorTheme, UnlockNotificationData, BadgeTier } from '../types';
import { preloadSounds, toggleMute } from '../services/audioService';
import { requestNotificationPermission } from '../services/notificationService';
import { useSocialStore } from './SocialStore';
import { toast } from 'react-hot-toast';
import { voiceService } from '../services/voiceService';

type ActiveReaction = { id: string; playerId: string; emoji: string };
type LoadingState = { active: boolean; message: string };
type LevelUpModalData = { level: number, reward: Avatar | ColorTheme | Badge };

// --- STATE ---
interface UIStoreState {
  loadingState: LoadingState;
  isMuted: boolean; // sound effects mute
  activeReactions: ActiveReaction[];
  newUnlock: UnlockNotificationData | null;
  notificationPermission: NotificationPermission;
  isChatOpen: boolean;
  isFriendsPanelOpen: boolean;
  isArchiveOpen: boolean;
  viewingReplay: Dare | null;
  greetings: FloatingGreeting[];
  levelUpModalData: LevelUpModalData | null;
  // Voice Chat State
  isVoiceConnected: boolean;
  isVoiceMuted: boolean; // microphone mute
  speakingPlayerId: string | null;
}

const initialState: UIStoreState = {
  loadingState: { active: false, message: '' },
  isMuted: false,
  activeReactions: [],
  newUnlock: null,
  notificationPermission: 'default',
  isChatOpen: false,
  isFriendsPanelOpen: false,
  isArchiveOpen: false,
  viewingReplay: null,
  greetings: [],
  levelUpModalData: null,
  // Voice Chat State
  isVoiceConnected: false,
  isVoiceMuted: true,
  speakingPlayerId: null,
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'TOGGLE_MUTE'; payload: boolean }
  | { type: 'ADD_REACTION'; payload: ActiveReaction }
  | { type: 'REMOVE_REACTION'; payload: string }
  | { type: 'SHOW_UNLOCK'; payload: UnlockNotificationData }
  | { type: 'HIDE_UNLOCK' }
  | { type: 'SET_NOTIFICATION_PERMISSION'; payload: NotificationPermission }
  | { type: 'SET_CHAT_OPEN'; payload: boolean }
  | { type: 'SET_FRIENDS_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_ARCHIVE_OPEN'; payload: boolean }
  | { type: 'SET_VIEWING_REPLAY'; payload: Dare | null }
  | { type: 'ADD_GREETING'; payload: FloatingGreeting }
  | { type: 'REMOVE_GREETING'; payload: string }
  | { type: 'SHOW_LEVEL_UP_MODAL'; payload: LevelUpModalData }
  | { type: 'HIDE_LEVEL_UP_MODAL' }
  | { type: 'SET_VOICE_CONNECTED'; payload: boolean }
  | { type: 'SET_VOICE_MUTED'; payload: boolean }
  | { type: 'SET_SPEAKING_PLAYER'; payload: string | null };

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
    case 'SET_ARCHIVE_OPEN':
        return { ...state, isArchiveOpen: action.payload };
    case 'SET_VIEWING_REPLAY':
        return { ...state, viewingReplay: action.payload };
    case 'ADD_GREETING':
        return { ...state, greetings: [...state.greetings, action.payload] };
    case 'REMOVE_GREETING':
        return { ...state, greetings: state.greetings.filter(g => g.id !== action.payload) };
    case 'SHOW_LEVEL_UP_MODAL':
      return { ...state, levelUpModalData: action.payload };
    case 'HIDE_LEVEL_UP_MODAL':
      return { ...state, levelUpModalData: null };
    case 'SET_VOICE_CONNECTED':
      return { ...state, isVoiceConnected: action.payload };
    case 'SET_VOICE_MUTED':
      return { ...state, isVoiceMuted: action.payload };
    case 'SET_SPEAKING_PLAYER':
        // Prevent flickering by only updating if the value changes
        if (state.speakingPlayerId === action.payload) return state;
        return { ...state, speakingPlayerId: action.payload };
    default:
      return state;
  }
};

// --- CONTEXT ---
interface UIStoreContextType extends UIStoreState {
    setLoading: (loading: LoadingState) => void;
    showNotification: (message: string, emoji?: string) => void;
    showUnlock: (notificationData: UnlockNotificationData) => void;
    showLevelUpNotification: (data: LevelUpModalData) => void;
    hideLevelUpNotification: () => void;
    handleToggleMute: () => void;
    handleEmojiReaction: (emoji: string) => void;
    handleRequestNotifications: () => Promise<void>;
    handleSendGreeting: (content: string) => void;
    setIsChatOpen: (isOpen: boolean) => void;
    setIsFriendsPanelOpen: (isOpen: boolean) => void;
    setIsArchiveOpen: (isOpen: boolean) => void;
    setViewingReplay: (dare: Dare | null) => void;
    // Voice Chat
    connectVoiceChat: () => void;
    disconnectVoiceChat: () => void;
    handleToggleVoiceMute: () => void;
}

const UIStoreContext = createContext<UIStoreContextType | undefined>(undefined);

export const UIStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);
    const { currentPlayer, updatePlayer } = useSocialStore();

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
    
    const showUnlock = useCallback((notificationData: UnlockNotificationData) => {
        dispatch({ type: 'SHOW_UNLOCK', payload: notificationData });
        setTimeout(() => dispatch({ type: 'HIDE_UNLOCK' }), 4000);
    }, []);

    const showLevelUpNotification = useCallback((data: LevelUpModalData) => {
        dispatch({ type: 'SHOW_LEVEL_UP_MODAL', payload: data });
    }, []);

    const hideLevelUpNotification = useCallback(() => {
        dispatch({ type: 'HIDE_LEVEL_UP_MODAL' });
    }, []);

    const handleToggleMute = () => {
        const newMutedState = !state.isMuted;
        dispatch({ type: 'TOGGLE_MUTE', payload: newMutedState });
        toggleMute(newMutedState);
    };

    const handleEmojiReaction = (emoji: string) => {
        if (!currentPlayer) return;
        const newReaction = { id: `reaction_${Date.now()}`, playerId: currentPlayer.id, emoji };
        dispatch({ type: 'ADD_REACTION', payload: newReaction });
        setTimeout(() => dispatch({ type: 'REMOVE_REACTION', payload: newReaction.id }), 3000);
    };

    const handleRequestNotifications = async () => {
        const permission = await requestNotificationPermission();
        dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission });
    };
    
    const handleSendGreeting = (content: string) => {
        if (!currentPlayer) return;
        const newGreeting: FloatingGreeting = {
            id: `greeting_${Date.now()}`,
            fromName: currentPlayer.name,
            fromColorClass: 'border-gray-300', // Simplified for now
            content,
        };
        dispatch({ type: 'ADD_GREETING', payload: newGreeting });
        setTimeout(() => dispatch({ type: 'REMOVE_GREETING', payload: newGreeting.id }), 5000);
    };

     // --- VOICE CHAT HANDLERS ---
    const handleSetSpeaking = useCallback((isSpeaking: boolean) => {
        if (!currentPlayer) return;
        dispatch({ type: 'SET_SPEAKING_PLAYER', payload: isSpeaking ? currentPlayer.id : null });
    }, [currentPlayer]);

    const connectVoiceChat = useCallback(async () => {
        if (state.isVoiceConnected) return;
        const stream = await voiceService.startLocalStream(
            () => handleSetSpeaking(true),
            () => handleSetSpeaking(false)
        );
        if (stream) {
            dispatch({ type: 'SET_VOICE_CONNECTED', payload: true });
             // Ensure the mic starts in the correct state
            voiceService.toggleMute(state.isVoiceMuted);
        }
    }, [state.isVoiceConnected, state.isVoiceMuted, handleSetSpeaking]);

    const disconnectVoiceChat = useCallback(() => {
        voiceService.stopLocalStream();
        if (state.isVoiceConnected) {
            dispatch({ type: 'SET_VOICE_CONNECTED', payload: false });
            dispatch({ type: 'SET_SPEAKING_PLAYER', payload: null });
        }
    }, [state.isVoiceConnected]);
    
    const handleToggleVoiceMute = useCallback(() => {
        if (!currentPlayer) return;
        const newMuteState = !state.isVoiceMuted;
        dispatch({ type: 'SET_VOICE_MUTED', payload: newMuteState });
        updatePlayer(currentPlayer.id, { isMuted: newMuteState });
        voiceService.toggleMute(newMuteState);
        if (newMuteState) {
            handleSetSpeaking(false);
        }
    }, [state.isVoiceMuted, currentPlayer, updatePlayer, handleSetSpeaking]);

    const value = useMemo(() => ({
        ...state,
        setLoading,
        showNotification,
        showUnlock,
        showLevelUpNotification,
        hideLevelUpNotification,
        handleToggleMute,
        handleEmojiReaction,
        handleRequestNotifications,
        handleSendGreeting,
        setIsChatOpen: (isOpen: boolean) => dispatch({ type: 'SET_CHAT_OPEN', payload: isOpen }),
        setIsFriendsPanelOpen: (isOpen: boolean) => dispatch({ type: 'SET_FRIENDS_PANEL_OPEN', payload: isOpen }),
        setIsArchiveOpen: (isOpen: boolean) => dispatch({ type: 'SET_ARCHIVE_OPEN', payload: isOpen }),
        setViewingReplay: (dare: Dare | null) => dispatch({ type: 'SET_VIEWING_REPLAY', payload: dare }),
        connectVoiceChat,
        disconnectVoiceChat,
        handleToggleVoiceMute,
    }), [state, setLoading, showNotification, showUnlock, showLevelUpNotification, hideLevelUpNotification, connectVoiceChat, disconnectVoiceChat, handleToggleVoiceMute]);

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

// This getter is simplified, as direct state manipulation outside of the provider/reducer
// context is complex to manage correctly without a full state management library.
useUIStore.getState = () => {};