
// FIX: Corrected React import syntax.
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, PropsWithChildren } from 'react';
// FIX: Added missing PlayerCustomization and PowerUpType to the import.
import { GameState, Player, Dare, Category, Challenge, GameHistoryEntry, PlayerCustomization, PowerUpType, MiniGameType, Avatar, Badge, ColorTheme, DareMode } from '../types';
import { getChallengeForRoom } from '../services/challengeService';
import { generateDare } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { showLocalNotification } from '../services/notificationService';
import { getRandomPowerUp, getPowerUpById } from '../services/powerUpService';
import { useSocialStore } from './SocialStore';
import { useUIStore } from './UIStore';
import { XP_REWARDS } from '../services/levelingService';

// --- HELPERS ---
const generateLobbyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


// --- STATE ---
interface GameStoreState {
  gameState: GameState;
  previousGameState: GameState | null;
  viewingProfileId: string | null;
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
  dareMode: DareMode;
  submittedDares: Dare[];
  winningDareId: string | null;
  xpSummary: { [playerId: string]: { reason: string; amount: number }[] };
  lastRoundScores: {
    scores: { playerId: string; score: number }[];
    challengeType: MiniGameType;
  } | null;
  lobbyCode: string | null;
}

const initialState: GameStoreState = {
  gameState: GameState.MAIN_MENU,
  previousGameState: null,
  viewingProfileId: null,
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
  dareMode: 'COMMUNITY',
  submittedDares: [],
  winningDareId: null,
  xpSummary: {},
  lastRoundScores: null,
  lobbyCode: null,
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'VIEW_PROFILE'; payload: string }
  | { type: 'CREATE_LOBBY'; payload: { hostId: string, lobbyCode: string } }
  | { type: 'JOIN_LOBBY_SUCCESS'; payload: string }
  | { type: 'SET_PLAYERS_IN_ROOM'; payload: string[] }
  | { type: 'START_GAME'; payload: { challenge: Challenge } }
  | { type: 'SET_MAX_ROUNDS'; payload: number }
  | { type: 'SET_SUDDEN_DEATH'; payload: { playerIds: string[] } }
  | { type: 'SET_ROUND_LOSER'; payload: string }
  | { type: 'SET_DARE'; payload: { dare: Dare; loserId: string } }
  | { type: 'START_LIVE_DARE' }
  | { type: 'COMPLETE_DARE'; payload: { dare: Dare, passed: boolean } }
  | { type: 'ADD_TO_ARCHIVE'; payload: Dare }
  | { type: 'NEXT_ROUND'; payload: { challenge: Challenge } }
  | { type: 'END_GAME' }
  | { type: 'USE_EXTRA_TIME' }
  | { type: 'SET_SWAPPING_CATEGORY'; payload: boolean }
  | { type: 'RESET_LOBBY' }
  | { type: 'SET_DARE_MODE'; payload: DareMode }
  | { type: 'SUBMIT_DARE'; payload: Dare }
  | { type: 'START_DARE_VOTING' }
  | { type: 'VOTE_FOR_DARE'; payload: string }
  | { type: 'FINALIZE_DARE_VOTE' }
  | { type: 'PROCEED_TO_DARE_SCREEN' }
  | { type: 'UPDATE_CURRENT_DARE'; payload: Partial<Dare> }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'GO_BACK' }
  | { type: 'ADD_XP_SUMMARY'; payload: { playerId: string, reason: string, amount: number } }
  | { type: 'CLEAR_XP_SUMMARY' }
  | { type: 'PASS_DARE'; payload: { newLoserId: string, newDare: Dare } };


// --- REDUCER ---
const gameReducer = (state: GameStoreState, action: Action): GameStoreState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'VIEW_PROFILE':
      return { 
          ...state, 
          previousGameState: state.gameState,
          gameState: GameState.PROFILE, 
          viewingProfileId: action.payload 
      };
    case 'CREATE_LOBBY':
      return { ...initialState, lobbyCode: action.payload.lobbyCode, playersInRoom: [action.payload.hostId], gameState: GameState.CATEGORY_SELECTION };
    case 'JOIN_LOBBY_SUCCESS':
      return { ...state, playersInRoom: [...state.playersInRoom, action.payload], gameState: GameState.LOBBY };
    case 'SET_PLAYERS_IN_ROOM':
        return { ...state, playersInRoom: action.payload };
    case 'START_GAME':
      return { ...state, gameState: GameState.MINIGAME, currentRound: 1, currentChallenge: action.payload.challenge, xpSummary: {} };
    case 'SET_MAX_ROUNDS':
      return { ...state, maxRounds: action.payload };
    case 'SET_SUDDEN_DEATH':
      return { ...state, gameState: GameState.SUDDEN_DEATH, suddenDeathPlayerIds: action.payload.playerIds };
    case 'SET_ROUND_LOSER':
        return { ...state, roundLoserId: action.payload };
    case 'SET_DARE':
      return { ...state, gameState: GameState.DARE_SCREEN, currentDare: action.payload.dare, roundLoserId: action.payload.loserId };
    case 'PASS_DARE':
      return {
        ...state,
        roundLoserId: action.payload.newLoserId,
        currentDare: action.payload.newDare,
      };
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
        return { ...initialState, lobbyCode: null, playersInRoom: [state.playersInRoom[0]] }; // Keep current player
    case 'SET_DARE_MODE':
      return { ...state, dareMode: action.payload };
    case 'SUBMIT_DARE':
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
    case 'FINALIZE_DARE_VOTE': {
      if (state.submittedDares.length === 0) return state;
      const winningDare = [...state.submittedDares].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      return {
        ...state,
        currentDare: winningDare,
        winningDareId: winningDare.id,
      };
    }
    case 'PROCEED_TO_DARE_SCREEN':
      return {
        ...state,
        gameState: GameState.DARE_SCREEN,
        submittedDares: [],
        winningDareId: null,
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
            winningDareId: null,
            xpSummary: {},
            lastRoundScores: null,
            lobbyCode: generateLobbyCode(),
        };
    case 'RETURN_TO_MENU':
        return initialState;
    case 'GO_BACK':
        switch (state.gameState) {
            case GameState.PROFILE:
                return { 
                    ...state, 
                    gameState: state.previousGameState === GameState.PROFILE ? GameState.MAIN_MENU : state.previousGameState || GameState.MAIN_MENU,
                    viewingProfileId: null,
                    previousGameState: null
                };
            case GameState.JOIN_LOBBY:
            case GameState.CATEGORY_SELECTION:
                return { ...state, gameState: GameState.MAIN_MENU };
            case GameState.CUSTOMIZATION:
                return { ...state, gameState: GameState.CATEGORY_SELECTION };
            default:
                return state;
        }
    case 'ADD_XP_SUMMARY': {
      const { playerId, reason, amount } = action.payload;
      const playerSummary = state.xpSummary[playerId] || [];
      return {
        ...state,
        xpSummary: {
          ...state.xpSummary,
          [playerId]: [...playerSummary, { reason, amount }],
        },
      };
    }
    case 'CLEAR_XP_SUMMARY':
      return { ...state, xpSummary: {} };
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
  handleGoToJoinLobby: () => void;
  handleJoinLobbyWithCode: (code: string) => void;
  handleCategorySelect: (category: Category) => void;
  handleCustomizationSave: (customization: PlayerCustomization) => void;
  handleStartGame: () => void;
  handleQuickStart: () => void;
  handleMiniGameEnd: (scores: Map<string, number>, challengeType: MiniGameType) => void;
  handleSuddenDeathEnd: (loserId: string) => void;
  handleStartLiveDare: () => void;
  handleStreamEnd: (replayUrl?: string) => void;
  handleProofVote: (passed: boolean) => void;
  handleUsePowerUp: (powerUpId: PowerUpType) => void;
  handleKickPlayer: (playerId: string) => void;
  handleLeaveLobby: () => void;
  handleViewProfile: (playerId: string) => void;
  handleViewReplay: (dareId: string) => void;
  handlePlayAgain: () => void;
  handleReturnToMenu: () => void;
  handleGoBack: () => void;
  setMaxRounds: (rounds: number) => void;
  setDareMode: (mode: DareMode) => void;
  handleDareSubmit: (dareText: string) => void;
  handleDareVote: (dareId: string) => void;
}

const GameStoreContext = createContext<GameStoreContextType | undefined>(undefined);

export const GameStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { currentPlayer, allPlayers, updatePlayer, addXp, checkForBadgeUpgrades } = useSocialStore();
    const { setLoading, showNotification, showUnlock, setViewingReplay } = useUIStore();

    // --- SELECTORS / DERIVED STATE ---
    const players = useMemo(() => allPlayers.filter(p => state.playersInRoom.includes(p.id)), [allPlayers, state.playersInRoom]);
    const roundLoser = useMemo(() => allPlayers.find(p => p.id === state.roundLoserId) || null, [allPlayers, state.roundLoserId]);
    const suddenDeathPlayers = useMemo(() => allPlayers.filter(p => state.suddenDeathPlayerIds.includes(p.id)), [allPlayers, state.suddenDeathPlayerIds]);

    // --- MOCK GAMEPLAY EFFECTS ---
    useEffect(() => {
        const playerJoinInterval = setInterval(() => {
          if (state.gameState === GameState.LOBBY && players.length < 8) {
            const nonRoomPlayers = allPlayers.filter(ap => !players.some(p => p.id === ap.id) && ap.id !== currentPlayer?.id);
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
        
        if(winner) {
            addXp(winner.id, XP_REWARDS.GAME_WON);
            dispatch({ type: 'ADD_XP_SUMMARY', payload: { playerId: winner.id, reason: 'Game Won!', amount: XP_REWARDS.GAME_WON } });
        }

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
            const newWins = p.stats.wins + (isWinner ? 1 : 0);
            updatePlayer(p.id, {
                gameHistory: [...p.gameHistory, gameHistoryEntry],
                stats: { ...p.stats, wins: newWins }
            });
            if (isWinner) {
                const upgradeInfo = checkForBadgeUpgrades(p.id);
                if (upgradeInfo && p.id === currentPlayer.id) {
                    showUnlock({ type: 'badge_upgrade', item: upgradeInfo.badge, tier: upgradeInfo.tier });
                }
            }
        });
        
        dispatch({ type: 'END_GAME' });
    }, [players, state.currentDare, updatePlayer, addXp, checkForBadgeUpgrades, currentPlayer, showUnlock]);

    const handleNextRound = useCallback(() => {
        const potentialRecipients = players.filter(p => p.id !== state.roundLoserId);
        if (potentialRecipients.length > 0) {
            const recipient = potentialRecipients[Math.floor(Math.random() * potentialRecipients.length)];
            const newPowerUp = getRandomPowerUp();
            updatePlayer(recipient.id, { powerUps: [...recipient.powerUps, newPowerUp.id] });
            
            if (recipient.id === currentPlayer.id) {
                showUnlock({ type: 'powerup', item: newPowerUp });
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

    const handleMiniGameEnd = useCallback((playerScores: Map<string, number>, challengeType: MiniGameType) => {
        players.forEach(p => {
            addXp(p.id, XP_REWARDS.GAME_PLAYED);
            dispatch({ type: 'ADD_XP_SUMMARY', payload: { playerId: p.id, reason: 'Played a round', amount: XP_REWARDS.GAME_PLAYED } });
        });
    
        const scoresArray = Array.from(playerScores.entries()).map(([playerId, score]) => ({ playerId, score }));
        if (scoresArray.length === 0) {
            handleNextRound();
            return;
        }
    
        // Determine sorting order: for memory match, lower is better. For others, higher is better.
        const higherIsBetter = !['MEMORY_MATCH'].includes(challengeType);
        if (higherIsBetter) {
            scoresArray.sort((a, b) => a.score - b.score); // Ascending, worst is first
        } else {
            scoresArray.sort((a, b) => b.score - a.score); // Descending, worst is first
        }
    
        const worstScore = scoresArray[0].score;
        const potentialLosers = scoresArray.filter(s => s.score === worstScore);
    
        if (potentialLosers.length === 1) {
            const loserId = potentialLosers[0].playerId;
            // The useEffect hook on `roundLoser` will handle the state transition based on dare mode.
            dispatch({ type: 'SET_ROUND_LOSER', payload: loserId });
        } else if (potentialLosers.length > 1 && potentialLosers.length < players.length) {
            // Tie for last place, but not everyone tied.
            dispatch({ type: 'SET_SUDDEN_DEATH', payload: { playerIds: potentialLosers.map(l => l.playerId) } });
        } else {
            // Everyone tied, or some other edge case. Just go to the next round.
            showNotification("It's a draw! No loser this round.", '🤝');
            setTimeout(() => handleNextRound(), 3000);
        }
    }, [players, handleNextRound, addXp, showNotification]);

    const handleSuddenDeathEnd = (loserId: string) => {
        const loserPlayer = players.find(p => p.id === loserId);
        if(loserPlayer) {
            // Sudden death loser is determined. The useEffect hook will now handle the state transition.
            dispatch({ type: 'SET_ROUND_LOSER', payload: loserId });
        }
    };

    const handleStreamEnd = useCallback((replayUrl?: string) => {
        if (state.currentDare) {
            const proofUrl = 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExejE3aGo2aWRucmNtd2ZucWJsd3hrYjF0M3p2dTk0bThscjFkeXVoYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LqxpA22cuYg426iI4i/giphy.gif';
            dispatch({ type: 'UPDATE_CURRENT_DARE', payload: { proof: proofUrl, replayUrl } });
            dispatch({ type: 'SET_GAME_STATE', payload: GameState.DARE_PROOF });
        }
    }, [state.currentDare]);
    
    const handleProofVote = useCallback((passed: boolean) => {
        if (roundLoser && state.currentDare) {
            if (passed) {
                addXp(roundLoser.id, XP_REWARDS.DARE_COMPLETED);
                dispatch({ type: 'ADD_XP_SUMMARY', payload: { playerId: roundLoser.id, reason: 'Dare Completed', amount: XP_REWARDS.DARE_COMPLETED } });
            }

            const newStatus = passed ? 'completed' : 'failed';
            const completedDare: Dare = { ...state.currentDare, status: newStatus };
            dispatch({ type: 'COMPLETE_DARE', payload: { dare: completedDare, passed } });

            if(passed && completedDare.replayUrl) {
                dispatch({ type: 'ADD_TO_ARCHIVE', payload: completedDare });
            }
            playSound(passed ? 'dareComplete' : 'incorrect');
            
            const newDaresCompleted = roundLoser.stats.daresCompleted + (passed ? 1 : 0);
            updatePlayer(roundLoser.id, {
                stats: {
                    ...roundLoser.stats,
                    daresCompleted: newDaresCompleted,
                    daresFailed: roundLoser.stats.daresFailed + (passed ? 0 : 1),
                }
            });
            if (passed) {
                const upgradeInfo = checkForBadgeUpgrades(roundLoser.id);
                if (upgradeInfo && roundLoser.id === currentPlayer.id) {
                    showUnlock({ type: 'badge_upgrade', item: upgradeInfo.badge, tier: upgradeInfo.tier });
                }
            }

            if (passed) {
                showLocalNotification("Dare Completed!", { body: `${roundLoser.name} completed their dare.` });
                players.forEach(p => {
                    if (p.id !== roundLoser.id) updatePlayer(p.id, { score: p.score + 10 });
                });
            } else {
                updatePlayer(roundLoser.id, { score: Math.max(0, roundLoser.score - 5) });
            }
        }
        setTimeout(() => handleNextRound(), 5000);
    }, [roundLoser, state.currentDare, updatePlayer, players, handleNextRound, addXp, checkForBadgeUpgrades, currentPlayer, showUnlock]);


    const handleUsePowerUp = (powerUpId: PowerUpType) => {
        if (!currentPlayer.powerUps.includes(powerUpId)) return;
        
        const updatedPowerUps = currentPlayer.powerUps.filter(p => p !== powerUpId);
        updatePlayer(currentPlayer.id, { powerUps: updatedPowerUps });
        
        const powerUp = getPowerUpById(powerUpId);
        if (powerUp) {
            showUnlock({type: 'powerup', item: powerUp});
            showNotification(`${powerUp.name} used!`, powerUp.emoji);
        }
    
        switch (powerUpId) {
            case 'SKIP_DARE': {
                const { lastRoundScores, currentDare, roundLoserId } = state;
                if (!lastRoundScores || !currentDare || !roundLoserId) {
                    showNotification('Could not pass dare, skipping instead!', '🤷');
                    dispatch({ type: 'SET_GAME_STATE', payload: GameState.LEADERBOARD });
                    setTimeout(() => handleNextRound(), 4000);
                    break;
                }

                const { scores, challengeType } = lastRoundScores;
                const higherIsBetter = !['MEMORY_MATCH'].includes(challengeType);
                const sortedPlayers = [...scores].sort((a, b) => higherIsBetter ? a.score - b.score : b.score - a.score);
                
                const newLoserScoreData = sortedPlayers.length > 1 ? sortedPlayers[1] : null;

                if (newLoserScoreData && newLoserScoreData.playerId !== roundLoserId) {
                    const newLoserId = newLoserScoreData.playerId;
                    const newLoserPlayer = players.find(p => p.id === newLoserId);
                    const oldLoserPlayer = players.find(p => p.id === roundLoserId);

                    if (newLoserPlayer && oldLoserPlayer) {
                        const newDare = { ...currentDare, assigneeId: newLoserId };
                        showNotification(`${oldLoserPlayer.name} passed the dare to ${newLoserPlayer.name}!`, '🔁');
                        dispatch({ type: 'PASS_DARE', payload: { newLoserId: newLoserId, newDare } });
                    } else {
                        showNotification('Could not find player to pass dare to, skipping instead!', '🤷');
                        dispatch({ type: 'SET_GAME_STATE', payload: GameState.LEADERBOARD });
                        setTimeout(() => handleNextRound(), 4000);
                    }
                } else {
                    showNotification('No one to pass the dare to, skipping!', '🤷');
                    dispatch({ type: 'SET_GAME_STATE', payload: GameState.LEADERBOARD });
                    setTimeout(() => handleNextRound(), 4000);
                }
                break;
            }
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
    
        setTimeout(() => {
            dispatch({ type: 'START_DARE_VOTING' });
        }, 500 * otherPlayers.length + 1000);
    };

    const handleDareVote = (dareId: string) => {
        dispatch({ type: 'VOTE_FOR_DARE', payload: dareId });
    
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
    
        setTimeout(() => {
            dispatch({ type: 'FINALIZE_DARE_VOTE' });
            setTimeout(() => {
                dispatch({ type: 'PROCEED_TO_DARE_SCREEN' });
            }, 4000); 
        }, 300 * otherPlayers.length + 1000);
    };

    const handleCreateLobby = () => {
        updatePlayer(currentPlayer.id, { isHost: true, score: 0, teamId: null });
        const newLobbyCode = generateLobbyCode();
        dispatch({ type: 'CREATE_LOBBY', payload: { hostId: currentPlayer.id, lobbyCode: newLobbyCode } });
        playSound('tap');
    };

    const handleGoToJoinLobby = () => {
        dispatch({ type: 'SET_GAME_STATE', payload: GameState.JOIN_LOBBY });
    };

    const handleJoinLobbyWithCode = (code: string) => {
        // This is a mock. In a real app, this would be an API call.
        if (state.lobbyCode && code.toUpperCase() === state.lobbyCode) {
            updatePlayer(currentPlayer.id, { isHost: false, score: 0, teamId: null });
            dispatch({ type: 'JOIN_LOBBY_SUCCESS', payload: currentPlayer.id });
            showNotification(`Joined lobby!`, '🎉');
        } else {
            showNotification(`Invalid lobby code!`, '❌');
        }
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

    const handleQuickStart = () => {
        if (!currentPlayer?.isAdmin) return;

        const botPlayers = allPlayers.filter(p => p.id !== currentPlayer.id).slice(0, 3);
        const roomPlayerIds = [currentPlayer.id, ...botPlayers.map(b => b.id)];
        
        dispatch({ type: 'SET_PLAYERS_IN_ROOM', payload: roomPlayerIds });

        // Force assign teams and other properties
        updatePlayer(currentPlayer.id, { teamId: null, score: 0, powerUps: [], category: 'General', isHost: true });
        botPlayers.forEach((bot) => {
            updatePlayer(bot.id, { teamId: null, score: 0, powerUps: [], category: 'General', isHost: false });
        });

        // Use a short timeout to ensure the player state updates before generating challenge
        setTimeout(() => {
            const tempPlayers = [currentPlayer, ...botPlayers].map(p => ({
                ...p,
                category: 'General', // ensure they have a category for challenge generation
            }));
            const challenge = getChallengeForRoom(tempPlayers.map(p => p.category as Category));
            playSound('gameStart');
            dispatch({ type: 'START_GAME', payload: { challenge } });
        }, 100);
    };

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
        updatePlayer(currentPlayer.id, { isHost: false, score: 0, teamId: null });
        showNotification("You left the lobby.", "👋");
    };

    const handleViewProfile = useCallback((playerId: string) => {
        dispatch({ type: 'VIEW_PROFILE', payload: playerId });
    }, []);

    const handleViewReplay = (dareId: string) => {
        const dareToPlay = state.dareArchive.find(d => d.id === dareId);
        if (dareToPlay) {
            setViewingReplay(dareToPlay);
        }
    };
    
    const handlePlayAgain = () => {
        players.forEach(p => {
            updatePlayer(p.id, { score: 0, powerUps: [] });
        });
        dispatch({ type: 'PLAY_AGAIN' });
    };

    const handleReturnToMenu = () => {
        if(currentPlayer) {
            updatePlayer(currentPlayer.id, { isHost: false, score: 0, powerUps: [], category: undefined, teamId: null });
        }
        dispatch({ type: 'RETURN_TO_MENU' });
    };

    const handleGoBack = () => {
        dispatch({ type: 'GO_BACK' });
    };

    const value = useMemo(() => ({
        ...state,
        players,
        roundLoser,
        suddenDeathPlayers,
        handleCreateLobby,
        handleGoToJoinLobby,
        handleJoinLobbyWithCode,
        handleCategorySelect,
        handleCustomizationSave,
        handleStartGame,
        handleQuickStart,
        handleMiniGameEnd,
        handleSuddenDeathEnd,
        handleStartLiveDare: () => dispatch({ type: 'START_LIVE_DARE' }),
        handleStreamEnd,
        handleProofVote,
        handleUsePowerUp,
        handleKickPlayer,
        handleLeaveLobby,
        handleViewProfile,
        handleViewReplay,
        handlePlayAgain,
        handleReturnToMenu,
        handleGoBack,
        setMaxRounds: (r: number) => dispatch({ type: 'SET_MAX_ROUNDS', payload: r }),
        setDareMode: (mode: DareMode) => dispatch({ type: 'SET_DARE_MODE', payload: mode }),
        handleDareSubmit,
        handleDareVote,
    }), [state, players, roundLoser, suddenDeathPlayers, handleStartGame, handleMiniGameEnd, handleStreamEnd, handleProofVote, handleUsePowerUp, handleKickPlayer, handleLeaveLobby, handleViewReplay, handleCategorySelect, handleCustomizationSave, handleSuddenDeathEnd, handleDareSubmit, handleDareVote, allPlayers, handlePlayAgain, handleReturnToMenu, handleGoBack, handleViewProfile, handleCreateLobby, handleGoToJoinLobby, handleJoinLobbyWithCode, handleQuickStart]);

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
