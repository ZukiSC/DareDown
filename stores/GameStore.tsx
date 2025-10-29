// FIX: Corrected React import syntax.
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, PropsWithChildren } from 'react';
// FIX: Added missing PlayerCustomization and PowerUpType to the import.
import { GameState, Player, Dare, Category, Challenge, GameHistoryEntry, PlayerCustomization, PowerUpType } from '../types';
import { getChallengeForRoom } from '../services/challengeService';
import { generateDare } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { showLocalNotification } from '../services/notificationService';
// FIX: Removed getRandomPowerUp from this import as it's in powerUpService.
import { getBadgeById } from '../services/customizationService';
// FIX: Imported power-up related functions from the correct service.
import { getRandomPowerUp, getPowerUpById } from '../services/powerUpService';
import { useSocialStore } from './SocialStore';
import { useUIStore } from './UIStore';

// --- STATE ---
interface GameStoreState {
  gameState: GameState;
  playersInRoom: string[]; // Array of player IDs
  currentRound: number;
  maxRounds: number;
  currentChallenge: Challenge | null;
  roundLoserId: string | null;
  suddenDeathPlayerIds: string[];
  currentDare: Dare | null;
  extraTime: number;
  isSwappingCategory: boolean;
  dareArchive: Dare[];
  dareMode: 'AI' | 'COMMUNITY';
  submittedDares: Dare[];
}

const initialState: GameStoreState = {
  gameState: GameState.MAIN_MENU,
  playersInRoom: [],
  currentRound: 0,
  maxRounds: 5,
  currentChallenge: null,
  roundLoserId: null,
  suddenDeathPlayerIds: [],
  currentDare: null,
  extraTime: 0,
  isSwappingCategory: false,
  dareArchive: [],
  dareMode: 'AI',
  submittedDares: [],
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'CREATE_LOBBY'; payload: { hostId: string } }
  | { type: 'SET_PLAYERS_IN_ROOM'; payload: string[] }
  | { type: 'START_GAME'; payload: { challenge: Challenge } }
  | { type: 'SET_MAX_ROUNDS'; payload: number }
  | { type: 'END_MINIGAME'; payload: { loserIds: string[] } }
  | { type: 'SET_SUDDEN_DEATH'; payload: { playerIds: string[] } }
  | { type: 'SET_DARE'; payload: { dare: Dare; loserId: string } }
  | { type: 'START_LIVE_DARE' }
  | { type: 'COMPLETE_DARE'; payload: { dare: Dare, passed: boolean } }
  | { type: 'ADD_TO_ARCHIVE'; payload: Dare }
  | { type: 'NEXT_ROUND'; payload: { challenge: Challenge } }
  | { type: 'END_GAME' }
  | { type: 'USE_EXTRA_TIME' }
  | { type: 'SET_SWAPPING_CATEGORY'; payload: boolean }
  | { type: 'RESET_LOBBY' }
  | { type: 'SET_DARE_MODE'; payload: 'AI' | 'COMMUNITY' }
  | { type: 'SUBMIT_DARE'; payload: Dare }
  | { type: 'START_DARE_VOTING' }
  | { type: 'VOTE_FOR_DARE'; payload: string }
  | { type: 'FINALIZE_DARE_VOTE' }
  | { type: 'UPDATE_CURRENT_DARE'; payload: Partial<Dare> }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RETURN_TO_MENU' };


// --- REDUCER ---
const gameReducer = (state: GameStoreState, action: Action): GameStoreState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'CREATE_LOBBY':
      return { ...initialState, playersInRoom: [action.payload.hostId], gameState: GameState.CATEGORY_SELECTION };
    case 'SET_PLAYERS_IN_ROOM':
        return { ...state, playersInRoom: action.payload };
    case 'START_GAME':
      return { ...state, gameState: GameState.MINIGAME, currentRound: 1, currentChallenge: action.payload.challenge };
    case 'SET_MAX_ROUNDS':
      return { ...state, maxRounds: action.payload };
    case 'END_MINIGAME':
        if (action.payload.loserIds.length > 1) {
            return { ...state, gameState: GameState.SUDDEN_DEATH, suddenDeathPlayerIds: action.payload.loserIds, submittedDares: [] };
        }
        return { ...state, roundLoserId: action.payload.loserIds[0] || null, submittedDares: [] };
    case 'SET_SUDDEN_DEATH':
      return { ...state, gameState: GameState.SUDDEN_DEATH, suddenDeathPlayerIds: action.payload.playerIds };
    case 'SET_DARE':
      return { ...state, gameState: GameState.DARE_SCREEN, currentDare: action.payload.dare, roundLoserId: action.payload.loserId };
    case 'START_LIVE_DARE':
      return { ...state, gameState: GameState.DARE_LIVE_STREAM };
    case 'UPDATE_CURRENT_DARE':
        return { ...state, currentDare: state.currentDare ? { ...state.currentDare, ...action.payload } : null };
    case 'COMPLETE_DARE':
      return { ...state, currentDare: action.payload.dare, gameState: GameState.LEADERBOARD };
    case 'ADD_TO_ARCHIVE':
      return { ...state, dareArchive: [action.payload, ...state.dareArchive] };
    case 'NEXT_ROUND':
        return {
            ...state,
            currentRound: state.currentRound + 1,
            gameState: GameState.MINIGAME,
            currentChallenge: action.payload.challenge,
            roundLoserId: null,
            currentDare: null,
            suddenDeathPlayerIds: [],
            extraTime: 0
        };
    case 'END_GAME':
        return { ...state, gameState: GameState.GAME_END };
    case 'USE_EXTRA_TIME':
        return { ...state, extraTime: 5 };
    case 'SET_SWAPPING_CATEGORY':
        return { ...state, isSwappingCategory: action.payload };
    case 'RESET_LOBBY':
        return { ...initialState, playersInRoom: [state.playersInRoom[0]] }; // Keep current player
    case 'SET_DARE_MODE':
      return { ...state, dareMode: action.payload };
    case 'SUBMIT_DARE':
      // Prevent duplicate submissions from same player (for mock)
      if (state.submittedDares.some(d => d.submitterId === action.payload.submitterId)) {
          return state;
      }
      return { ...state, submittedDares: [...state.submittedDares, action.payload] };
    case 'START_DARE_VOTING':
      return { ...state, gameState: GameState.DARE_VOTING };
    case 'VOTE_FOR_DARE':
      return {
        ...state,
        submittedDares: state.submittedDares.map(d =>
          d.id === action.payload ? { ...d, votes: (d.votes || 0) + 1 } : d
        )
      };
    case 'FINALIZE_DARE_VOTE':
      const winningDare = [...state.submittedDares].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      return {
        ...state,
        currentDare: winningDare,
        gameState: GameState.DARE_SCREEN,
        submittedDares: [], // Clear for next round
      };
    case 'PLAY_AGAIN':
        return {
            ...state,
            gameState: GameState.LOBBY,
            currentRound: 0,
            currentChallenge: null,
            roundLoserId: null,
            suddenDeathPlayerIds: [],
            currentDare: null,
            extraTime: 0,
        };
    case 'RETURN_TO_MENU':
        return initialState;
    default:
      return state;
  }
};

// --- CONTEXT ---
interface GameStoreContextType extends GameStoreState {
  players: Player[];
  roundLoser: Player | null;
  suddenDeathPlayers: Player[];
  handleCreateLobby: () => void;
  handleCategorySelect: (category: Category) => void;
  handleCustomizationSave: (customization: PlayerCustomization) => void;
  handleStartGame: () => void;
  handleMiniGameEnd: (loserIds: string[]) => void;
  handleSuddenDeathEnd: (loserId: string) => void;
  handleStartLiveDare: () => void;
  handleStreamEnd: (replayUrl?: string) => void;
  handleProofVote: (passed: boolean) => void;
  handleUsePowerUp: (powerUpId: PowerUpType) => void;
  handleKickPlayer: (playerId: string) => void;
  handleLeaveLobby: () => void;
  handleViewReplay: (dareId: string) => void;
  handlePlayAgain: () => void;
  handleReturnToMenu: () => void;
  setMaxRounds: (rounds: number) => void;
  setDareMode: (mode: 'AI' | 'COMMUNITY') => void;
  handleDareSubmit: (dareText: string) => void;
  handleDareVote: (dareId: string) => void;
}

const GameStoreContext = createContext<GameStoreContextType | undefined>(undefined);

export const GameStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { currentPlayer, allPlayers, updatePlayer, addPlayer, removePlayer } = useSocialStore();
    const { setLoading, showNotification, showUnlock, setViewingReplay } = useUIStore();

    // --- SELECTORS / DERIVED STATE ---
    const players = useMemo(() => allPlayers.filter(p => state.playersInRoom.includes(p.id)), [allPlayers, state.playersInRoom]);
    const roundLoser = useMemo(() => allPlayers.find(p => p.id === state.roundLoserId) || null, [allPlayers, state.roundLoserId]);
    const suddenDeathPlayers = useMemo(() => allPlayers.filter(p => state.suddenDeathPlayerIds.includes(p.id)), [allPlayers, state.suddenDeathPlayerIds]);

    // --- MOCK GAMEPLAY EFFECTS ---
    useEffect(() => {
        const playerJoinInterval = setInterval(() => {
          if (state.gameState === GameState.LOBBY && players.length < 8) {
            const nonRoomPlayers = allPlayers.filter(ap => !players.some(p => p.id === ap.id) && ap.id !== currentPlayer.id);
            if(nonRoomPlayers.length === 0) return;
            const newPlayer = nonRoomPlayers[Math.floor(Math.random() * nonRoomPlayers.length)];
            dispatch({ type: 'SET_PLAYERS_IN_ROOM', payload: [...state.playersInRoom, newPlayer.id] });
          }
        }, 5000);
        return () => clearInterval(playerJoinInterval);
    }, [state.gameState, players, allPlayers, currentPlayer, state.playersInRoom]);

    // --- CORE LOGIC HANDLERS ---
    const generateNextChallenge = useCallback(() => {
        const availableCategories = [...new Set(players.map(p => p.category).filter(Boolean))] as Category[];
        if (availableCategories.length === 0) availableCategories.push('General');
        return getChallengeForRoom(availableCategories);
    }, [players]);

    const handleEndOfGame = useCallback(() => {
        playSound('winGame');
        const winner = [...players].sort((a,b) => b.score - a.score)[0];
        
        const gameHistoryEntry: GameHistoryEntry = {
            gameId: `game_${Date.now()}`,
            date: Date.now(),
            players: players.map(p => ({ id: p.id, name: p.name, customization: p.customization })),
            winnerId: winner.id,
            dare: state.currentDare ? {
                dareId: state.currentDare.id,
                text: state.currentDare.text,
                assigneeName: players.find(p => p.id === state.currentDare.assigneeId)?.name || 'Unknown',
                completed: state.currentDare.status === 'completed',
                replayUrl: state.currentDare.replayUrl
            } : undefined
        };

        players.forEach(p => {
            const isWinner = p.id === winner.id;
            updatePlayer(p.id, {
                gameHistory: [...p.gameHistory, gameHistoryEntry],
                stats: { ...p.stats, wins: p.stats.wins + (isWinner ? 1 : 0) }
            });
        });

        if (winner && !winner.unlocks.includes('badge_winner')) {
            showUnlock(getBadgeById('badge_winner'));
            updatePlayer(winner.id, { unlocks: [...winner.unlocks, 'badge_winner'] });
        }
        
        dispatch({ type: 'END_GAME' });
    }, [players, state.currentDare, updatePlayer, showUnlock]);

    const handleNextRound = useCallback(() => {
        const potentialRecipients = players.filter(p => p.id !== state.roundLoserId);
        if (potentialRecipients.length > 0) {
            const recipient = potentialRecipients[Math.floor(Math.random() * potentialRecipients.length)];
            const newPowerUp = getRandomPowerUp();
            updatePlayer(recipient.id, { powerUps: [...recipient.powerUps, newPowerUp.id] });
            
            if (recipient.id === currentPlayer.id) {
                showUnlock(newPowerUp);
            }
            showNotification(`${recipient.name} got a power-up!`, newPowerUp.emoji);
            showLocalNotification("You got a power-up!", { body: `You received: ${newPowerUp.name}` });
        }
    
        if (state.currentRound + 1 > state.maxRounds) {
            handleEndOfGame();
            return;
        }
        playSound('nextRound');
        dispatch({ type: 'NEXT_ROUND', payload: { challenge: generateNextChallenge() } });

    }, [players, state.roundLoserId, state.currentRound, state.maxRounds, currentPlayer, updatePlayer, showNotification, showUnlock, generateNextChallenge, handleEndOfGame]);

    const generateAndShowDare = useCallback(async (loser: Player) => {
        setLoading({ active: true, message: 'Picking a legendary dare...' });
        try {
            const roomCategories = [...new Set(players.map(p => p.category).filter(Boolean))] as Category[];
            const dareText = await generateDare(loser.name, roomCategories);
            const newDare: Dare = {
                id: `d_${Date.now()}`, text: dareText, assigneeId: loser.id, status: 'pending',
            };
            dispatch({ type: 'SET_DARE', payload: { dare: newDare, loserId: loser.id } });
            if (loser.id === currentPlayer.id) {
                showLocalNotification("It's your turn!", { body: `Your dare is: ${newDare.text}` });
            }
        } catch (error) {
            console.error("Failed to generate and show dare:", error);
            handleNextRound();
        } finally {
            setLoading({ active: false, message: '' });
        }
    }, [players, currentPlayer, handleNextRound, setLoading]);
    
    useEffect(() => {
        if (roundLoser && ![GameState.DARE_SCREEN, GameState.DARE_SUBMISSION, GameState.DARE_VOTING, GameState.DARE_PROOF, GameState.DARE_LIVE_STREAM].includes(state.gameState)) {
            if (state.dareMode === 'AI') {
                generateAndShowDare(roundLoser);
            } else {
                dispatch({ type: 'SET_GAME_STATE', payload: GameState.DARE_SUBMISSION });
            }
        }
    }, [roundLoser, state.gameState, state.dareMode, generateAndShowDare]);

    const handleMiniGameEnd = useCallback((loserIds: string[]) => {
        if (loserIds.length === 0) {
            handleNextRound();
            return;
        }
        dispatch({ type: 'END_MINIGAME', payload: { loserIds } });
    }, [handleNextRound]);

    const handleSuddenDeathEnd = (loserId: string) => {
        dispatch({ type: 'END_MINIGAME', payload: { loserIds: [loserId] } });
    };

    const handleStreamEnd = useCallback((replayUrl?: string) => {
        if (state.currentDare) {
            // Using a funny GIF as mock proof.
            const proofUrl = 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExejE3aGo2aWRucmNtd2ZucWJsd3hrYjF0M3p2dTk0bThscjFkeXVoYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LqxpA22cuYg426iI4i/giphy.gif';
            dispatch({ type: 'UPDATE_CURRENT_DARE', payload: { proof: proofUrl, replayUrl } });
            dispatch({ type: 'SET_GAME_STATE', payload: GameState.DARE_PROOF });
        }
    }, [state.currentDare]);
    
    const handleProofVote = useCallback((passed: boolean) => {
        if (roundLoser && state.currentDare) {
            const newStatus = passed ? 'completed' : 'failed';
            const completedDare: Dare = { ...state.currentDare, status: newStatus };
            dispatch({ type: 'COMPLETE_DARE', payload: { dare: completedDare, passed } });

            if(passed && completedDare.replayUrl) {
                dispatch({ type: 'ADD_TO_ARCHIVE', payload: completedDare });
            }

            playSound(passed ? 'dareComplete' : 'incorrect');
            
            updatePlayer(roundLoser.id, {
                stats: {
                    ...roundLoser.stats,
                    daresCompleted: roundLoser.stats.daresCompleted + (passed ? 1 : 0),
                    daresFailed: roundLoser.stats.daresFailed + (passed ? 0 : 1),
                }
            });

            if (passed) {
                showLocalNotification("Dare Completed!", { body: `${roundLoser.name} completed their dare.` });
                if (!roundLoser.unlocks.includes('badge_dare_survivor')) {
                    showUnlock(getBadgeById('badge_dare_survivor'));
                    updatePlayer(roundLoser.id, { unlocks: [...roundLoser.unlocks, 'badge_dare_survivor'] });
                }
                players.forEach(p => {
                    if (p.id !== roundLoser.id) updatePlayer(p.id, { score: p.score + 10 });
                });
            } else {
                updatePlayer(roundLoser.id, { score: Math.max(0, roundLoser.score - 5) });
            }
        }
        setTimeout(() => handleNextRound(), 5000);
    }, [roundLoser, state.currentDare, updatePlayer, players, handleNextRound, showUnlock]);


    const handleUsePowerUp = (powerUpId: PowerUpType) => {
        if (!currentPlayer.powerUps.includes(powerUpId)) return;
        
        const updatedPowerUps = currentPlayer.powerUps.filter(p => p !== powerUpId);
        updatePlayer(currentPlayer.id, { powerUps: updatedPowerUps });
        
        const powerUp = getPowerUpById(powerUpId);
        showNotification(`${powerUp?.name} used!`, powerUp?.emoji);
    
        switch (powerUpId) {
            case 'SKIP_DARE':
                dispatch({ type: 'SET_GAME_STATE', payload: GameState.LEADERBOARD });
                setTimeout(() => handleNextRound(), 4000);
                break;
            case 'EXTRA_TIME':
                dispatch({ type: 'USE_EXTRA_TIME' });
                break;
            case 'SWAP_CATEGORY':
                dispatch({ type: 'SET_SWAPPING_CATEGORY', payload: true });
                break;
        }
    };
    
    const handleDareSubmit = (dareText: string) => {
        const newDare: Dare = {
            id: `d_sub_${Date.now()}`, text: dareText, assigneeId: state.roundLoserId!,
            submitterId: currentPlayer.id, status: 'pending', votes: 0,
        };
        dispatch({ type: 'SUBMIT_DARE', payload: newDare });
    
        // Simulate other players submitting dares
        const otherPlayers = players.filter(p => p.id !== currentPlayer.id && p.id !== state.roundLoserId);
        otherPlayers.forEach((player, index) => {
            setTimeout(() => {
                const botDare: Dare = {
                    id: `d_sub_${Date.now()}_${player.id}`, text: `A super creative bot dare from ${player.name}`,
                    assigneeId: state.roundLoserId!, submitterId: player.id, status: 'pending', votes: 0,
                };
                dispatch({ type: 'SUBMIT_DARE', payload: botDare });
            }, 500 * (index + 1));
        });
    
        // After all submissions, move to voting
        setTimeout(() => {
            dispatch({ type: 'START_DARE_VOTING' });
        }, 500 * otherPlayers.length + 1000);
    };

    const handleDareVote = (dareId: string) => {
        dispatch({ type: 'VOTE_FOR_DARE', payload: dareId });
    
        // Simulate other players voting
        const otherPlayers = players.filter(p => p.id !== currentPlayer.id && p.id !== state.roundLoserId);
        const availableDareIds = state.submittedDares.map(d => d.id);
        
        if (availableDareIds.length > 0) {
            otherPlayers.forEach((player, index) => {
                setTimeout(() => {
                    const randomDareId = availableDareIds[Math.floor(Math.random() * availableDareIds.length)];
                    dispatch({ type: 'VOTE_FOR_DARE', payload: randomDareId });
                }, 300 * (index + 1));
            });
        }
    
        // Finalize vote
        setTimeout(() => {
            dispatch({ type: 'FINALIZE_DARE_VOTE' });
        }, 300 * otherPlayers.length + 1000);
    };


    const handleCreateLobby = () => {
        updatePlayer(currentPlayer.id, { isHost: true, score: 0 });
        dispatch({ type: 'CREATE_LOBBY', payload: { hostId: currentPlayer.id } });
        playSound('tap');
    };

    const handleCategorySelect = (category: Category) => {
        if (state.isSwappingCategory) {
            updatePlayer(currentPlayer.id, { category });
            dispatch({ type: 'SET_SWAPPING_CATEGORY', payload: false });
            showNotification('Category swapped!');
        } else {
            updatePlayer(currentPlayer.id, { category });
            dispatch({ type: 'SET_GAME_STATE', payload: GameState.CUSTOMIZATION });
        }
    };
    
    const handleCustomizationSave = (customization: PlayerCustomization) => {
        updatePlayer(currentPlayer.id, { customization });
        dispatch({ type: 'SET_GAME_STATE', payload: GameState.LOBBY });
    };

    const handleStartGame = useCallback(() => {
        playSound('gameStart');
        dispatch({ type: 'START_GAME', payload: { challenge: generateNextChallenge() } });
    }, [generateNextChallenge]);

    const handleKickPlayer = (playerId: string) => {
        const kickedPlayer = players.find(p => p.id === playerId);
        if (kickedPlayer) {
            dispatch({ type: 'SET_PLAYERS_IN_ROOM', payload: state.playersInRoom.filter(id => id !== playerId) });
            showNotification(`${kickedPlayer.name} was kicked from the lobby.`, '👋');
        }
    };
    
    const handleLeaveLobby = () => {
        dispatch({ type: 'RESET_LOBBY' });
        dispatch({ type: 'SET_GAME_STATE', payload: GameState.MAIN_MENU });
        updatePlayer(currentPlayer.id, { isHost: false, score: 0 });
        showNotification("You left the lobby.", "👋");
    };

    const handleViewReplay = (dareId: string) => {
        const dareToPlay = state.dareArchive.find(d => d.id === dareId);
        if (dareToPlay) {
            setViewingReplay(dareToPlay);
        }
    };
    
    const handlePlayAgain = () => {
        // Reset scores for all players in the room for the new game
        players.forEach(p => {
            updatePlayer(p.id, { score: 0, powerUps: [] });
        });
        dispatch({ type: 'PLAY_AGAIN' });
    };

    const handleReturnToMenu = () => {
        updatePlayer(currentPlayer.id, { isHost: false, score: 0, powerUps: [], category: undefined });
        dispatch({ type: 'RETURN_TO_MENU' });
    };

    // --- CONTEXT VALUE ---
    const value = useMemo(() => ({
        ...state,
        players,
        roundLoser,
        suddenDeathPlayers,
        handleCreateLobby,
        handleCategorySelect,
        handleCustomizationSave,
        handleStartGame,
        handleMiniGameEnd,
        handleSuddenDeathEnd,
        handleStartLiveDare: () => dispatch({ type: 'START_LIVE_DARE' }),
        handleStreamEnd,
        handleProofVote,
        handleUsePowerUp,
        handleKickPlayer,
        handleLeaveLobby,
        handleViewReplay,
        handlePlayAgain,
        handleReturnToMenu,
        setMaxRounds: (r: number) => dispatch({ type: 'SET_MAX_ROUNDS', payload: r }),
        setDareMode: (mode: 'AI' | 'COMMUNITY') => dispatch({ type: 'SET_DARE_MODE', payload: mode }),
        handleDareSubmit,
        handleDareVote,
    }), [state, players, roundLoser, suddenDeathPlayers, handleStartGame, handleMiniGameEnd, handleStreamEnd, handleProofVote, handleUsePowerUp, handleKickPlayer, handleLeaveLobby, handleViewReplay, handleCategorySelect, handleCustomizationSave, handleSuddenDeathEnd, handleDareSubmit, handleDareVote]);

    return (
        <GameStoreContext.Provider value={value}>
            {children}
        </GameStoreContext.Provider>
    );
}

// --- HOOK ---
export const useGameStore = () => {
    const context = useContext(GameStoreContext);
    if (context === undefined) {
        throw new Error('useGameStore must be used within a GameStoreProvider');
    }
    return context;
};