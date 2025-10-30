// FIX: Corrected React import syntax.
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, PropsWithChildren } from 'react';
// FIX: Added missing PlayerCustomization and PowerUpType to the import.
import { GameState, Player, Dare, Category, Challenge, GameHistoryEntry, PlayerCustomization, PowerUpType, MiniGameType, PublicLobby, HallOfFameEntry, DarePack, Avatar, Badge, ColorTheme } from '../types';
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
import { XP_REWARDS } from '../services/levelingService';

// --- STATE ---
interface GameStoreState {
  gameState: GameState;
  playersInRoom: string[]; // Array of player IDs
  currentRound: number;
  maxRounds: number;
  currentChallenge: Challenge | null;
  roundLoserId: string | null;
  losingTeamId: 'blue' | 'orange' | null;
  teamVotes: { [voterId: string]: string }; // voterId -> votedForId
  suddenDeathPlayerIds: string[];
  currentDare: Dare | null;
  extraTime: number;
  isSwappingCategory: boolean;
  dareArchive: Dare[];
  dareMode: 'AI' | 'COMMUNITY';
  submittedDares: Dare[];
  winningDareId: string | null;
  publicLobbies: PublicLobby[];
  hallOfFame: HallOfFameEntry[];
  hallOfFameVotes: string[]; // Dare IDs the player has voted for
  communityDarePacks: DarePack[];
  subscribedDarePackIds: string[];
  votedDarePackIds: string[];
  xpSummary: { [playerId: string]: { reason: string; amount: number }[] };
}

const MOCK_HALL_OF_FAME: HallOfFameEntry[] = [
    {
        dare: { id: 'hof_dare_1', text: "Sing everything you say for the next 5 minutes like an opera star.", assigneeId: 'p2', status: 'completed', replayUrl: 'mock-hof-replay-1.mp4'},
        assignee: { id: 'p2', name: 'Player 2', customization: { avatarId: 'avatar_2', colorId: 'color_2', badgeId: null } },
        votes: 127
    },
    {
        dare: { id: 'hof_dare_2', text: "Do your best impression of a chicken laying an egg.", assigneeId: 'p4', status: 'completed', replayUrl: 'mock-hof-replay-2.mp4' },
        assignee: { id: 'p4', name: 'Player 4', customization: { avatarId: 'avatar_4', colorId: 'color_4', badgeId: 'badge_winner' } },
        votes: 98
    },
    {
        dare: { id: 'hof_dare_3', text: "Create a hat out of toilet paper and wear it for the rest of the game.", assigneeId: 'p6', status: 'completed', replayUrl: 'mock-hof-replay-3.mp4' },
        assignee: { id: 'p6', name: 'Player 6', customization: { avatarId: 'avatar_6', colorId: 'color_6', badgeId: null } },
        votes: 75
    },
];

const MOCK_DARE_PACKS: DarePack[] = [
    {
        id: 'pack_1', name: 'Awkward Family Dinner', description: 'Dares perfect for making your next family meal unforgettable... for all the wrong reasons.',
        creatorId: 'p3', creatorName: 'Player 3',
        dares: ['Only speak in questions.', 'Pretend you are a food critic reviewing the meal.', 'Refer to a sibling by the wrong name all night.'],
        votes: 256, isOfficial: true,
    },
    {
        id: 'pack_2', name: 'Cringey TikTok Dares', description: 'Unleash your inner influencer with these viral-worthy (and cringey) challenges.',
        creatorId: 'p5', creatorName: 'Player 5',
        dares: ['Do the latest TikTok dance trend.', 'Create a "story time" video about a boring event.', 'Record a "get ready with me" video.'],
        votes: 189,
    },
    {
        id: 'pack_3', name: '90s Nostalgia', description: 'A blast from the past! These dares will have you feeling like you are back in the 90s.',
        creatorId: 'p8', creatorName: 'Player 8',
        dares: ['Sing the Fresh Prince of Bel-Air theme song.', 'Try to explain what a dial-up modem sounds like.', 'Do the Macarena.'],
        votes: 152,
    }
];

const initialState: GameStoreState = {
  gameState: GameState.MAIN_MENU,
  playersInRoom: [],
  currentRound: 0,
  maxRounds: 5,
  currentChallenge: null,
  roundLoserId: null,
  losingTeamId: null,
  teamVotes: {},
  suddenDeathPlayerIds: [],
  currentDare: null,
  extraTime: 0,
  isSwappingCategory: false,
  dareArchive: [],
  dareMode: 'AI',
  submittedDares: [],
  winningDareId: null,
  publicLobbies: [],
  hallOfFame: MOCK_HALL_OF_FAME,
  hallOfFameVotes: [],
  communityDarePacks: MOCK_DARE_PACKS,
  subscribedDarePackIds: ['pack_1'],
  votedDarePackIds: [],
  xpSummary: {},
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'CREATE_LOBBY'; payload: { hostId: string } }
  | { type: 'SET_PLAYERS_IN_ROOM'; payload: string[] }
  | { type: 'START_GAME'; payload: { challenge: Challenge } }
  | { type: 'SET_MAX_ROUNDS'; payload: number }
  // FIX: Updated END_MINIGAME to carry losingTeamId in payload.
  | { type: 'END_MINIGAME'; payload: { playerScores: Map<string, number>, challengeType: MiniGameType, losingTeamId: 'blue' | 'orange' | null } }
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
  | { type: 'PROCEED_TO_DARE_SCREEN' }
  | { type: 'UPDATE_CURRENT_DARE'; payload: Partial<Dare> }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'GO_BACK' }
  | { type: 'VOTE_FOR_TEAMMATE'; payload: { voterId: string, targetId: string } }
  // FIX: Updated FINALIZE_TEAM_VOTE to carry losingTeamPlayers in payload.
  | { type: 'FINALIZE_TEAM_VOTE', payload: { losingTeamPlayers: Player[] } }
  | { type: 'VIEW_PUBLIC_LOBBIES'; payload: { lobbies: PublicLobby[] } }
  | { type: 'JOIN_LOBBY'; payload: { hostId: string; playerId: string } }
  | { type: 'REFRESH_LOBBIES'; payload: { lobbies: PublicLobby[] } }
  | { type: 'VOTE_HALL_OF_FAME'; payload: string } // dareId
  | { type: 'SUBSCRIBE_DARE_PACK'; payload: string } // packId
  | { type: 'VOTE_DARE_PACK'; payload: string } // packId
  | { type: 'CREATE_DARE_PACK'; payload: Omit<DarePack, 'id' | 'votes'> }
  | { type: 'ADD_XP_SUMMARY'; payload: { playerId: string, reason: string, amount: number } }
  | { type: 'CLEAR_XP_SUMMARY' };


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
      return { ...state, gameState: GameState.MINIGAME, currentRound: 1, currentChallenge: action.payload.challenge, xpSummary: {} };
    case 'SET_MAX_ROUNDS':
      return { ...state, maxRounds: action.payload };
    // FIX: Updated reducer to set losingTeamId from the action payload.
    case 'END_MINIGAME': {
      // Team logic is handled in the action creator, this just transitions state
      return { ...state, gameState: GameState.TEAM_DARE_VOTE, submittedDares: [], losingTeamId: action.payload.losingTeamId };
    }
    case 'VOTE_FOR_TEAMMATE': {
        return {
            ...state,
            teamVotes: {
                ...state.teamVotes,
                [action.payload.voterId]: action.payload.targetId,
            }
        };
    }
    // FIX: Refactored reducer to use losingTeamPlayers from payload, removing dependency on external state.
    case 'FINALIZE_TEAM_VOTE': {
        const { losingTeamPlayers } = action.payload;
        const votes = Object.values(state.teamVotes);
        if (votes.length === 0) { // Should not happen with real players
             const randomLoser = losingTeamPlayers[Math.floor(Math.random() * losingTeamPlayers.length)];
             return { ...state, roundLoserId: randomLoser?.id || null, teamVotes: {} };
        }
        const voteCounts = votes.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const maxVotes = Math.max(...Object.values(voteCounts));
        const losers = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
        
        // If there's a tie, pick one randomly
        const finalLoserId = losers[Math.floor(Math.random() * losers.length)];

        return { ...state, roundLoserId: finalLoserId, teamVotes: {} };
    }
    case 'SET_SUDDEN_DEATH': // Note: Sudden death is individual, overrides teams for a round.
      return { ...state, gameState: GameState.SUDDEN_DEATH, suddenDeathPlayerIds: action.payload.playerIds };
    case 'SET_DARE':
      return { ...state, gameState: GameState.DARE_SCREEN, currentDare: action.payload.dare, roundLoserId: action.payload.loserId, losingTeamId: null };
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
            losingTeamId: null,
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
            losingTeamId: null,
            teamVotes: {},
            xpSummary: {},
        };
    case 'RETURN_TO_MENU':
        return initialState;
    case 'GO_BACK':
        switch (state.gameState) {
            case GameState.PUBLIC_LOBBIES:
            case GameState.HALL_OF_FAME:
            case GameState.COMMUNITY_DARES:
            case GameState.DARE_PASS:
                return { ...state, gameState: GameState.MAIN_MENU };
            case GameState.CATEGORY_SELECTION:
                return { ...state, gameState: GameState.MAIN_MENU };
            case GameState.CUSTOMIZATION:
                return { ...state, gameState: GameState.CATEGORY_SELECTION };
            default:
                return state;
        }
    case 'VIEW_PUBLIC_LOBBIES':
        return { ...state, gameState: GameState.PUBLIC_LOBBIES, publicLobbies: action.payload.lobbies };
    case 'JOIN_LOBBY':
        return { ...state, gameState: GameState.LOBBY, playersInRoom: [action.payload.hostId, action.payload.playerId] };
    case 'REFRESH_LOBBIES':
        return { ...state, publicLobbies: action.payload.lobbies };
    case 'VOTE_HALL_OF_FAME':
        if (state.hallOfFameVotes.includes(action.payload)) return state;
        return {
            ...state,
            hallOfFame: state.hallOfFame.map(entry => 
                entry.dare.id === action.payload ? { ...entry, votes: entry.votes + 1 } : entry
            ),
            hallOfFameVotes: [...state.hallOfFameVotes, action.payload]
        };
    case 'SUBSCRIBE_DARE_PACK': {
        const { payload: packId } = action;
        const isSubscribed = state.subscribedDarePackIds.includes(packId);
        return {
            ...state,
            subscribedDarePackIds: isSubscribed
                ? state.subscribedDarePackIds.filter(id => id !== packId)
                : [...state.subscribedDarePackIds, packId]
        };
    }
    case 'VOTE_DARE_PACK': {
        const { payload: packId } = action;
        if (state.votedDarePackIds.includes(packId)) return state;
        return {
            ...state,
            communityDarePacks: state.communityDarePacks.map(pack =>
                pack.id === packId ? { ...pack, votes: pack.votes + 1 } : pack
            ),
            votedDarePackIds: [...state.votedDarePackIds, packId]
        };
    }
    case 'CREATE_DARE_PACK': {
        const newPack: DarePack = {
            ...action.payload,
            id: `pack_${Date.now()}`,
            votes: 0,
        };
        return {
            ...state,
            communityDarePacks: [newPack, ...state.communityDarePacks]
        };
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
  handleCategorySelect: (category: Category) => void;
  handleCustomizationSave: (customization: PlayerCustomization) => void;
  handleStartGame: () => void;
  handleMiniGameEnd: (scores: Map<string, number>, challengeType: MiniGameType) => void;
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
  handleGoBack: () => void;
  setMaxRounds: (rounds: number) => void;
  setDareMode: (mode: 'AI' | 'COMMUNITY') => void;
  handleDareSubmit: (dareText: string) => void;
  handleDareVote: (dareId: string) => void;
  handleJoinTeam: (teamId: 'blue' | 'orange' | null) => void;
  handleTeamMateVote: (targetId: string) => void;
  handleViewPublicLobbies: () => void;
  handleJoinPublicLobby: (lobbyId: string) => void;
  handleQuickJoin: () => void;
  handleRefreshLobbies: () => void;
  handleViewHallOfFame: () => void;
  handleVoteHallOfFame: (dareId: string) => void;
  handleViewCommunityDares: () => void;
  handleViewDarePass: () => void;
  handleSubscribeDarePack: (packId: string) => void;
  handleVoteDarePack: (packId: string) => void;
  handleCreateDarePack: (packData: Omit<DarePack, 'id' | 'votes' | 'creatorId' | 'creatorName'>) => void;
}

const GameStoreContext = createContext<GameStoreContextType | undefined>(undefined);

// Mock data generator for public lobbies
const generateMockLobbies = (allPlayers: Player[], count: number): PublicLobby[] => {
    const lobbies: PublicLobby[] = [];
    const availableHosts = allPlayers.filter(p => p.id !== 'p1');

    for (let i = 0; i < count; i++) {
        if (availableHosts.length === 0) break;
        const hostIndex = Math.floor(Math.random() * availableHosts.length);
        const host = availableHosts.splice(hostIndex, 1)[0];
        
        lobbies.push({
            id: `lobby_${host.id}`,
            hostName: host.name,
            hostCustomization: host.customization,
            playerCount: Math.floor(Math.random() * 6) + 2, // 2-7 players
            maxPlayers: 8,
            category: ['General', 'Trivia', 'Speed/Reflex', 'Puzzles'][Math.floor(Math.random() * 4)] as Category,
            dareMode: Math.random() > 0.5 ? 'AI' : 'COMMUNITY',
        });
    }
    return lobbies;
};


export const GameStoreProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { currentPlayer, allPlayers, updatePlayer, addXp, updateChallengeProgress } = useSocialStore();
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
        
        if(winner) {
            addXp(winner.id, XP_REWARDS.GAME_WON);
            dispatch({ type: 'ADD_XP_SUMMARY', payload: { playerId: winner.id, reason: 'Game Won!', amount: XP_REWARDS.GAME_WON } });
            updateChallengeProgress(winner.id, 'win_game', 1);
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
    }, [players, state.currentDare, updatePlayer, showUnlock, addXp, updateChallengeProgress]);

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

    const handleMiniGameEnd = useCallback((playerScores: Map<string, number>, challengeType: MiniGameType) => {
        players.forEach(p => {
            addXp(p.id, XP_REWARDS.GAME_PLAYED);
            dispatch({ type: 'ADD_XP_SUMMARY', payload: { playerId: p.id, reason: 'Played a round', amount: XP_REWARDS.GAME_PLAYED } });
            updateChallengeProgress(p.id, 'play_minigame', 1);
        });

        const teamScores = { blue: { totalScore: 0, playerCount: 0 }, orange: { totalScore: 0, playerCount: 0 } };
        
        for (const player of players) {
            if (player.teamId) {
                const score = playerScores.get(player.id) || 0;
                teamScores[player.teamId].totalScore += score;
                teamScores[player.teamId].playerCount++;
            }
        }

        const blueAvg = teamScores.blue.playerCount > 0 ? teamScores.blue.totalScore / teamScores.blue.playerCount : 0;
        const orangeAvg = teamScores.orange.playerCount > 0 ? teamScores.orange.totalScore / teamScores.orange.playerCount : 0;
        
        // Higher is better for: QUICK_QUIZ, TAP_SPEED, RHYTHM_RUSH, SPOT_THE_DIFFERENCE, DOODLE_DOWN
        const higherIsBetter = ['QUICK_QUIZ', 'TAP_SPEED', 'RHYTHM_RUSH', 'SPOT_THE_DIFFERENCE', 'DOODLE_DOWN'].includes(challengeType);
        
        let losingTeamId: 'blue' | 'orange' | null = null;
        if (teamScores.blue.playerCount > 0 && teamScores.orange.playerCount > 0) {
            if (higherIsBetter) {
                losingTeamId = blueAvg < orangeAvg ? 'blue' : 'orange';
            } else { // Lower is better for MEMORY_MATCH, NUMBER_RACE
                losingTeamId = blueAvg > orangeAvg ? 'blue' : 'orange';
            }
             if (blueAvg === orangeAvg) { // On tie, pick randomly
                losingTeamId = Math.random() < 0.5 ? 'blue' : 'orange';
            }
        } else if (teamScores.blue.playerCount > 0) {
            losingTeamId = 'blue';
        } else if (teamScores.orange.playerCount > 0) {
            losingTeamId = 'orange';
        }

        // FIX: Replaced direct reducer call and state mutation with a proper dispatch.
        if (losingTeamId) {
            dispatch({ type: 'END_MINIGAME', payload: { playerScores, challengeType, losingTeamId } });
        } else {
            handleNextRound();
        }
    }, [players, handleNextRound, addXp, updateChallengeProgress]);

    const handleSuddenDeathEnd = (loserId: string) => {
        const loserPlayer = players.find(p => p.id === loserId);
        if(loserPlayer) {
            // Sudden death loser is determined, go straight to dare. The dare will be generated by the effect hook.
            // We set a dummy dare here just to set the roundLoserId and transition state correctly.
            const dummyDare: Dare = {
                id: `dummy_${Date.now()}`,
                text: 'Preparing dare...',
                assigneeId: loserId,
                status: 'pending'
            };
            dispatch({ type: 'SET_DARE', payload: { dare: dummyDare, loserId: loserId } });
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
    }, [roundLoser, state.currentDare, updatePlayer, players, handleNextRound, showUnlock, addXp]);


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

    const handleTeamMateVote = (targetId: string) => {
        dispatch({ type: 'VOTE_FOR_TEAMMATE', payload: { voterId: currentPlayer.id, targetId } });
        // Simulate other losing team members voting
        const losingTeam = players.filter(p => p.teamId === state.losingTeamId);
        const otherVoters = losingTeam.filter(p => p.id !== currentPlayer.id);
        const candidates = losingTeam.map(p => p.id);

        otherVoters.forEach((voter, i) => {
            setTimeout(() => {
                const vote = candidates[Math.floor(Math.random() * candidates.length)];
                dispatch({ type: 'VOTE_FOR_TEAMMATE', payload: { voterId: voter.id, targetId: vote } });
            }, (i + 1) * 400);
        });

        // FIX: Dispatch with payload containing losing team players.
        setTimeout(() => {
            dispatch({ type: 'FINALIZE_TEAM_VOTE', payload: { losingTeamPlayers: losingTeam } });
        }, (otherVoters.length + 1) * 500);
    };

    const handleViewPublicLobbies = () => {
        const lobbies = generateMockLobbies(allPlayers, 5);
        dispatch({ type: 'VIEW_PUBLIC_LOBBIES', payload: { lobbies } });
    };

    const handleRefreshLobbies = () => {
        const lobbies = generateMockLobbies(allPlayers, 5);
        dispatch({ type: 'REFRESH_LOBBIES', payload: { lobbies } });
    };

    const handleJoinPublicLobby = (lobbyId: string) => {
        const hostId = lobbyId.replace('lobby_', '');
        updatePlayer(currentPlayer.id, { isHost: false, score: 0, teamId: null, powerUps: [], category: undefined });
        dispatch({ type: 'JOIN_LOBBY', payload: { hostId, playerId: currentPlayer.id } });
    };
    
    const handleQuickJoin = () => {
        const availableLobbies = state.publicLobbies.filter(l => l.playerCount < l.maxPlayers);
        if (availableLobbies.length > 0) {
            // Pick a random available lobby
            const lobbyToJoin = availableLobbies[Math.floor(Math.random() * availableLobbies.length)];
            handleJoinPublicLobby(lobbyToJoin.id);
        } else {
            showNotification('No available lobbies for Quick Join.', '😢');
        }
    };


    const handleCreateLobby = () => {
        updatePlayer(currentPlayer.id, { isHost: true, score: 0, teamId: null });
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
    
    const handleJoinTeam = (teamId: 'blue' | 'orange' | null) => {
        updatePlayer(currentPlayer.id, { teamId });
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
        updatePlayer(currentPlayer.id, { isHost: false, score: 0, teamId: null });
        showNotification("You left the lobby.", "👋");
    };

    const handleViewReplay = (dareId: string) => {
        const dareToPlay = [...state.dareArchive, ...state.hallOfFame.map(e => e.dare)].find(d => d.id === dareId);
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
        updatePlayer(currentPlayer.id, { isHost: false, score: 0, powerUps: [], category: undefined, teamId: null });
        dispatch({ type: 'RETURN_TO_MENU' });
    };

    const handleGoBack = () => {
        dispatch({ type: 'GO_BACK' });
    };

    const handleViewHallOfFame = () => dispatch({ type: 'SET_GAME_STATE', payload: GameState.HALL_OF_FAME });
    
    const handleVoteHallOfFame = (dareId: string) => {
        const entry = state.hallOfFame.find(e => e.dare.id === dareId);
        if (entry) {
            addXp(entry.assignee.id, XP_REWARDS.REPLAY_VOTE);
        }
        dispatch({ type: 'VOTE_HALL_OF_FAME', payload: dareId });
    };

    const handleViewCommunityDares = () => dispatch({ type: 'SET_GAME_STATE', payload: GameState.COMMUNITY_DARES });
    const handleViewDarePass = () => dispatch({ type: 'SET_GAME_STATE', payload: GameState.DARE_PASS });
    const handleSubscribeDarePack = (packId: string) => dispatch({ type: 'SUBSCRIBE_DARE_PACK', payload: packId });
    const handleVoteDarePack = (packId: string) => dispatch({ type: 'VOTE_DARE_PACK', payload: packId });
    const handleCreateDarePack = (packData: Omit<DarePack, 'id' | 'votes' | 'creatorId' | 'creatorName'>) => {
        if (!currentPlayer) return;
        const fullPackData = {
            ...packData,
            creatorId: currentPlayer.id,
            creatorName: currentPlayer.name,
        };
        dispatch({ type: 'CREATE_DARE_PACK', payload: fullPackData });
    };

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
        handleGoBack,
        setMaxRounds: (r: number) => dispatch({ type: 'SET_MAX_ROUNDS', payload: r }),
        setDareMode: (mode: 'AI' | 'COMMUNITY') => dispatch({ type: 'SET_DARE_MODE', payload: mode }),
        handleDareSubmit,
        handleDareVote,
        handleJoinTeam,
        handleTeamMateVote,
        handleViewPublicLobbies,
        handleJoinPublicLobby,
        handleQuickJoin,
        handleRefreshLobbies,
        handleViewHallOfFame,
        handleVoteHallOfFame,
        handleViewCommunityDares,
        handleViewDarePass,
        handleSubscribeDarePack,
        handleVoteDarePack,
        handleCreateDarePack,
    }), [state, players, roundLoser, suddenDeathPlayers, handleStartGame, handleMiniGameEnd, handleStreamEnd, handleProofVote, handleUsePowerUp, handleKickPlayer, handleLeaveLobby, handleViewReplay, handleCategorySelect, handleCustomizationSave, handleSuddenDeathEnd, handleDareSubmit, handleDareVote, handleTeamMateVote, allPlayers, handlePlayAgain, handleReturnToMenu, handleGoBack, handleQuickJoin, handleRefreshLobbies, handleJoinPublicLobby, handleViewPublicLobbies, handleVoteHallOfFame, handleViewHallOfFame]);

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