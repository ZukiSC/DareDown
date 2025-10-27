
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GameState, Player, Dare, Category, Challenge, PlayerCustomization, Badge, PowerUp, PowerUpType, ChatMessage, PrivateChatMessage, PlayerStats, FriendRequest, GameHistoryEntry, FloatingGreeting } from './types';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import DareScreen from './components/DareScreen';
import Leaderboard from './components/Leaderboard';
import LiveDareView from './components/LiveDareView';
import SuddenDeathScreen from './components/SuddenDeathScreen';
import CategorySelectionScreen from './components/CategorySelectionScreen';
import CustomizationScreen from './components/CustomizationScreen';
import EmojiReactionPanel from './components/EmojiReactionPanel';
import PowerUpPanel from './components/PowerUpPanel';
import ChatPanel from './components/ChatPanel';
import FriendsPanel from './components/FriendsPanel';
import PlayerProfileModal from './components/PlayerProfileModal';
import PrivateChatWindow from './components/PrivateChatWindow';
import DareArchiveModal from './components/DareArchiveModal';
import ReplayViewerModal from './components/ReplayViewerModal';
import MainMenuScreen from './components/MainMenuScreen';
import { preloadSounds, playSound, toggleMute } from './services/audioService';
import { getChallengeForRoom } from './services/challengeService';
import { getBadgeById, getAvatarById, getColorById } from './services/customizationService';
import { getRandomPowerUp, getPowerUpById } from './services/powerUpService';
import { requestNotificationPermission, showLocalNotification } from './services/notificationService';
import { generateDare } from './services/geminiService';

// --- MOCK DATA & SIMULATION ---
const MOCK_ALL_PLAYERS_DATA: Omit<Player, 'score' | 'isHost' | 'powerUps' | 'category'>[] = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    customization: { avatarId: `avatar_${(i % 10) + 1}`, colorId: `color_${(i % 8) + 1}`, badgeId: null },
    unlocks: [],
    stats: { wins: Math.floor(Math.random() * 20), daresCompleted: Math.floor(Math.random() * 50), daresFailed: Math.floor(Math.random() * 15) },
    friends: [],
    friendRequests: [],
    gameHistory: [],
    isOnline: Math.random() > 0.3, // 70% chance of being online
}));

// Setup initial state for the current user
// FIX: Explicitly type initialPlayer to ensure powerUps is PowerUpType[] not string[].
const initialPlayer: Player = {
    ...MOCK_ALL_PLAYERS_DATA[0],
    score: 0, isHost: false, powerUps: ['SKIP_DARE'],
    friends: ['p3', 'p5'], // Friends with Player 3 and 5
    friendRequests: [{ fromId: 'p8', fromName: 'Player 8', fromCustomization: MOCK_ALL_PLAYERS_DATA[7].customization, status: 'pending' as const }],
};
MOCK_ALL_PLAYERS_DATA[0] = initialPlayer;
MOCK_ALL_PLAYERS_DATA[2].friends.push('p1');
MOCK_ALL_PLAYERS_DATA[4].friends.push('p1');


type ActiveReaction = { id: string; playerId: string; emoji: string };
type Notification = { message: string, emoji?: string };
type LoadingState = { active: boolean; message: string };
// --- END MOCK DATA ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MAIN_MENU);
  const [allPlayers, setAllPlayers] = useState<Player[]>(MOCK_ALL_PLAYERS_DATA.map(p => ({ ...p, score: 0, isHost: false, powerUps: [], category: undefined })));
  const [players, setPlayers] = useState<Player[]>([initialPlayer]); // Players in the current room
  const [currentPlayer, setCurrentPlayer] = useState<Player>(initialPlayer);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [roundLoser, setRoundLoser] = useState<Player | null>(null);
  const [suddenDeathPlayers, setSuddenDeathPlayers] = useState<Player[]>([]);
  const [currentDare, setCurrentDare] = useState<Dare | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ active: false, message: '' });
  const [isMuted, setIsMuted] = useState(false);
  const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);
  const [newUnlock, setNewUnlock] = useState<Badge | PowerUp | null>(null);
  const [extraTime, setExtraTime] = useState(0);
  const [isSwappingCategory, setIsSwappingCategory] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Social Feature States
  const [isFriendsPanelOpen, setIsFriendsPanelOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Player | null>(null);
  const [privateChats, setPrivateChats] = useState<{ [key: string]: PrivateChatMessage[] }>({});
  
  // Replay Feature States
  const [dareArchive, setDareArchive] = useState<Dare[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [viewingReplay, setViewingReplay] = useState<Dare | null>(null);

  // Live Greeting State
  const [greetings, setGreetings] = useState<FloatingGreeting[]>([]);


  useEffect(() => {
    preloadSounds();
  }, []);
  
  const handleRequestNotifications = async () => {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
  };

  const showNotification = useCallback((message: string, emoji?: string) => {
    setNotification({ message, emoji });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // --- MOCK SOCKET.IO LISTENERS ---
  useEffect(() => {
    const playerJoinInterval = setInterval(() => {
      if (gameState === GameState.LOBBY && players.length < 8) {
        const nonRoomPlayers = allPlayers.filter(ap => !players.some(p => p.id === ap.id) && ap.id !== currentPlayer.id);
        if(nonRoomPlayers.length === 0) return;
        const newPlayer = nonRoomPlayers[Math.floor(Math.random() * nonRoomPlayers.length)];

        setPlayers(prev => [...prev, { ...newPlayer, score: 0, isHost: false }]);
      }
    }, 5000);
    return () => clearInterval(playerJoinInterval);
  }, [gameState, players, allPlayers, currentPlayer.id]);
  
    // Simulate bot chat messages
    useEffect(() => {
      const chatInterval = setInterval(() => {
        const bots = players.filter(p => p.id !== currentPlayer.id);
        if (bots.length > 0 && Math.random() < 0.25) { 
          const bot = bots[Math.floor(Math.random() * bots.length)];
          const messages = {
              [GameState.LOBBY]: ["Let's go!", "Who's ready to lose?", "This is gonna be fun!"],
              [GameState.MINIGAME]: ["Good luck!", "Don't mess up!", "I got this."],
              [GameState.DARE_SCREEN]: ["Ooooh, tough one.", "Don't do it!", "lol"],
              [GameState.LEADERBOARD]: ["GG", "Nice one!", "I'll get you next time."]
          };
          const availableMessages = messages[gameState] || ["..."];
          const randomMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
          
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            playerId: bot.id,
            playerName: bot.name,
            playerCustomization: bot.customization,
            text: randomMessage,
            timestamp: Date.now(),
            reactions: {},
          };
          setChatMessages(prev => [...prev, newMessage]);
        }
      }, 6000);
      return () => clearInterval(chatInterval);
    }, [players, currentPlayer.id, gameState]);

    // Host Migration Logic
    useEffect(() => {
        if (gameState !== GameState.LOBBY) return;

        const hostExists = players.some(p => p.isHost);
        if (!hostExists && players.length > 0) {
            const newHost = players[0];
            const newPlayers = players.map((p, index) => 
                index === 0 ? { ...p, isHost: true } : p
            );
            setPlayers(newPlayers);
            if (newHost.id === currentPlayer.id) {
                setCurrentPlayer(newPlayers[0]);
            }
            showNotification(`${newHost.name} is the new host!`, '👑');
        }
    }, [players, showNotification, gameState, currentPlayer.id]);


  const updatePlayerInAllLists = (updatedPlayer: Player) => {
      setCurrentPlayer(updatedPlayer);
      setAllPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const handleCreateLobby = () => {
    // The player creating the lobby becomes the host.
    const hostPlayer = { ...currentPlayer, isHost: true };
    // This player is now the only one in the new lobby's player list.
    setPlayers([hostPlayer]);
    // Also update the currentPlayer state to reflect host status.
    setCurrentPlayer(hostPlayer);
    // And update the master list of all players.
    setAllPlayers(prev => prev.map(p => p.id === hostPlayer.id ? hostPlayer : p));

    setGameState(GameState.CATEGORY_SELECTION);
    playSound('tap');
  };

  const handleCategorySelect = (category: Category) => {
    if (isSwappingCategory) {
        const updatedPlayer = { ...currentPlayer, category };
        updatePlayerInAllLists(updatedPlayer);
        setIsSwappingCategory(false);
        showNotification('Category swapped!');
    } else {
        const updatedPlayer = { ...currentPlayer, category };
        updatePlayerInAllLists(updatedPlayer);
        setGameState(GameState.CUSTOMIZATION);
    }
  };
  
  const handleCustomizationSave = (customization: PlayerCustomization) => {
    const updatedPlayer = { ...currentPlayer, customization };
    updatePlayerInAllLists(updatedPlayer);
    setGameState(GameState.LOBBY);
  };
  
  const generateNextChallenge = useCallback(() => {
    const availableCategories = [...new Set(players.map(p => p.category).filter(Boolean))] as Category[];
    if (availableCategories.length === 0) availableCategories.push('General');
    const challenge = getChallengeForRoom(availableCategories);
    setCurrentChallenge(challenge);
  }, [players]);
  
  const handleStartGame = useCallback(() => {
    playSound('gameStart');
    setCurrentRound(1);
    generateNextChallenge();
    setGameState(GameState.MINIGAME);
  }, [generateNextChallenge]);

  const handleEndOfGame = useCallback(() => {
    const winner = [...players].sort((a,b) => b.score - a.score)[0];
    
    // Create Game History
    const gameHistoryEntry: GameHistoryEntry = {
        gameId: `game_${Date.now()}`,
        date: Date.now(),
        players: players.map(p => ({ id: p.id, name: p.name, customization: p.customization })),
        winnerId: winner.id,
        dare: currentDare ? {
            dareId: currentDare.id,
            text: currentDare.text,
            assigneeName: players.find(p => p.id === currentDare.assigneeId)?.name || 'Unknown',
            completed: currentDare.status === 'completed',
            replayUrl: currentDare.replayUrl
        } : undefined
    };

    // Update stats for all players in the room
    setAllPlayers(prevAll => prevAll.map(p => {
        if (players.some(roomPlayer => roomPlayer.id === p.id)) {
            const newHistory = [...p.gameHistory, gameHistoryEntry];
            let newStats = { ...p.stats };
            if (p.id === winner.id) {
                newStats.wins += 1;
            }
            return { ...p, gameHistory: newHistory, stats: newStats };
        }
        return p;
    }));

    // Check for winner unlock
    if (winner && !winner.unlocks.includes('badge_winner')) {
        setNewUnlock(getBadgeById('badge_winner'));
        setAllPlayers(prev => prev.map(p => p.id === winner.id ? { ...p, unlocks: [...p.unlocks, 'badge_winner'] } : p));
    }

    playSound('winGame');
    setGameState(GameState.LEADERBOARD);
  }, [players, currentDare]);

  const handleNextRound = useCallback(() => {
    setNewUnlock(null);
    setExtraTime(0);

    const potentialRecipients = players.filter(p => p.id !== roundLoser?.id);
    if(potentialRecipients.length > 0) {
        const recipient = potentialRecipients[Math.floor(Math.random() * potentialRecipients.length)];
        const newPowerUp = getRandomPowerUp();
        
        setAllPlayers(prev => prev.map(p => p.id === recipient.id ? { ...p, powerUps: [...p.powerUps, newPowerUp.id] } : p));
        setPlayers(prev => prev.map(p => p.id === recipient.id ? { ...p, powerUps: [...p.powerUps, newPowerUp.id] } : p));
        
        if (recipient.id === currentPlayer.id) {
            setNewUnlock(newPowerUp);
        }
        showNotification(`${recipient.name} got a power-up!`, newPowerUp.emoji);
        showLocalNotification("You got a power-up!", { body: `You received: ${newPowerUp.name}` });
    }

    const nextRoundNumber = currentRound + 1;
    if (nextRoundNumber > maxRounds) {
        handleEndOfGame();
        return;
    }
    playSound('nextRound');
    setCurrentRound(nextRoundNumber);
    generateNextChallenge();
    setRoundLoser(null);
    setCurrentDare(null);
    setSuddenDeathPlayers([]);
    setGameState(GameState.MINIGAME);
  }, [currentRound, generateNextChallenge, handleEndOfGame, players, roundLoser, currentPlayer.id, showNotification, maxRounds]);

   const handleMiniGameEnd = useCallback((loserIds: string[]) => {
    if (loserIds.length === 0) {
      handleNextRound();
      return;
    }
    if (loserIds.length > 1) {
      const tiedPlayers = players.filter(p => loserIds.includes(p.id));
      setSuddenDeathPlayers(tiedPlayers);
      setGameState(GameState.SUDDEN_DEATH);
    } else {
      const loser = players.find(p => p.id === loserIds[0]);
      if (loser) {
        setRoundLoser(loser);
        generateAndShowDare(loser);
      } else {
        handleNextRound();
      }
    }
  }, [players, handleNextRound]);

  const generateAndShowDare = useCallback((loser: Player) => {
    setLoadingState({ active: true, message: 'Picking a legendary dare...' });
    const roomCategories = [...new Set(players.map(p => p.category).filter(Boolean))] as Category[];
    const dareText = generateDare(loser.name, roomCategories);
    const newDare: Dare = {
      id: `d_${Date.now()}`,
      text: dareText,
      assigneeId: loser.id,
      status: 'pending',
    };
    
    setTimeout(() => {
        setCurrentDare(newDare);
        setLoadingState({ active: false, message: '' });
        setGameState(GameState.DARE_SCREEN);
        if (loser.id === currentPlayer.id) {
            showLocalNotification("It's your turn!", { body: `Your dare is: ${newDare.text}` });
        }
    }, 1500);

  }, [players, currentPlayer.id]);
  
  const handleSuddenDeathEnd = (loserId: string) => {
      const loser = players.find(p => p.id === loserId);
      if (loser) {
          setRoundLoser(loser);
          generateAndShowDare(loser);
      } else {
          handleNextRound();
      }
  };

  const handleStartLiveDare = () => {
      setGameState(GameState.DARE_LIVE_STREAM);
  };

  const handleLiveDareVote = (passed: boolean, replayUrl?: string) => {
      if (roundLoser && currentDare) {
          const newStatus = passed ? 'completed' : 'failed';
          const completedDare: Dare = { ...currentDare, status: newStatus, replayUrl: replayUrl };
          setCurrentDare(completedDare);

          if(passed && replayUrl) {
              setDareArchive(prev => [completedDare, ...prev]);
          }

          playSound(passed ? 'dareComplete' : 'incorrect');
          
          setAllPlayers(prev => prev.map(p => {
              if (p.id === roundLoser.id) {
                  const newStats = { ...p.stats, daresCompleted: p.stats.daresCompleted + (passed ? 1 : 0), daresFailed: p.stats.daresFailed + (passed ? 0 : 1) };
                  return { ...p, stats: newStats };
              }
              return p;
          }));

          if (passed) {
              showLocalNotification("Dare Completed!", { body: `${roundLoser.name} completed their dare.` });
              const dareCompleter = players.find(p => p.id === roundLoser.id);
              if (dareCompleter && !dareCompleter.unlocks.includes('badge_dare_survivor')) {
                  setNewUnlock(getBadgeById('badge_dare_survivor'));
                  setAllPlayers(prev => prev.map(p => p.id === roundLoser.id ? { ...p, unlocks: [...p.unlocks, 'badge_dare_survivor'] } : p));
              }
              setPlayers(prevPlayers => prevPlayers.map(p => p.id !== roundLoser.id ? { ...p, score: p.score + 10 } : p));
          } else {
              setPlayers(prevPlayers => prevPlayers.map(p => p.id === roundLoser.id ? { ...p, score: p.score - 5 } : p));
          }
      }
      setGameState(GameState.LEADERBOARD);
      setTimeout(() => handleNextRound(), 5000);
  };

  const handleUsePowerUp = (powerUpId: PowerUpType) => {
    const playerWithPowerUp = players.find(p => p.id === currentPlayer.id);
    if (!playerWithPowerUp || !playerWithPowerUp.powerUps.includes(powerUpId)) return;

    const powerUpIndex = playerWithPowerUp.powerUps.indexOf(powerUpId);
    const updatedPowerUps = [...playerWithPowerUp.powerUps];
    updatedPowerUps.splice(powerUpIndex, 1);
    
    const updatedPlayer = { ...currentPlayer, powerUps: updatedPowerUps };
    updatePlayerInAllLists(updatedPlayer);
    
    const powerUp = getPowerUpById(powerUpId);
    showNotification(`${powerUp?.name} used!`, powerUp?.emoji);

    switch (powerUpId) {
        case 'SKIP_DARE':
            setGameState(GameState.LEADERBOARD);
            setTimeout(() => handleNextRound(), 4000);
            break;
        case 'EXTRA_TIME':
            setExtraTime(5);
            break;
        case 'SWAP_CATEGORY':
            setIsSwappingCategory(true);
            break;
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    toggleMute(newMutedState);
  };

  const handleEmojiReaction = (emoji: string) => {
    const newReaction = { id: `reaction_${Date.now()}`, playerId: currentPlayer.id, emoji };
    setActiveReactions(prev => [...prev, newReaction]);
    
    setTimeout(() => {
        const otherPlayer = players.find(p => p.id !== currentPlayer.id);
        if (otherPlayer) {
            setActiveReactions(prev => [...prev, { id: `reaction_${Date.now()}_bot`, playerId: otherPlayer.id, emoji: '😂' }]);
        }
    }, 800);

    setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  };

  const handleSendMessage = (text: string) => {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerCustomization: currentPlayer.customization,
        text,
        timestamp: Date.now(),
        reactions: {},
      };
      setChatMessages(prev => [...prev, newMessage]);
      playSound('tap');
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
      setChatMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === messageId) {
            const newReactions = { ...msg.reactions };
            const existingReactors = newReactions[emoji] || [];
            if (existingReactors.includes(currentPlayer.id)) {
              newReactions[emoji] = existingReactors.filter(id => id !== currentPlayer.id);
              if (newReactions[emoji].length === 0) delete newReactions[emoji];
            } else {
              newReactions[emoji] = [...existingReactors, currentPlayer.id];
            }
            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      );
  };

  const handleKickPlayer = (playerId: string) => {
      const kickedPlayer = players.find(p => p.id === playerId);
      if (kickedPlayer) {
          setPlayers(prev => prev.filter(p => p.id !== playerId));
          showNotification(`${kickedPlayer.name} was kicked from the lobby.`, '👋');
      }
  };

  const handleLeaveLobby = () => {
      // For the current user, reset their state
      setPlayers([initialPlayer]);
      setCurrentPlayer(initialPlayer);
      setGameState(GameState.MAIN_MENU);
      
      showNotification("You left the lobby.", "👋");
  };
  
  // --- SOCIAL HANDLERS ---
  const handleViewProfile = (playerId: string) => {
      const playerToShow = allPlayers.find(p => p.id === playerId);
      if (playerToShow) {
          setViewingProfile(playerToShow);
      }
  };

  const handleSendFriendRequest = (targetId: string) => {
      setAllPlayers(prev => prev.map(p => {
          if (p.id === targetId) {
              const newRequest: FriendRequest = {
                  fromId: currentPlayer.id,
                  fromName: currentPlayer.name,
                  fromCustomization: currentPlayer.customization,
                  status: 'pending'
              };
              return { ...p, friendRequests: [...p.friendRequests, newRequest] };
          }
          return p;
      }));
      showNotification(`Friend request sent!`);
  };

  const handleAcceptFriendRequest = (fromId: string) => {
      const fromPlayer = allPlayers.find(p => p.id === fromId);
      if (!fromPlayer) return;

      const updatedCurrentPlayer = {
          ...currentPlayer,
          friends: [...currentPlayer.friends, fromId],
          friendRequests: currentPlayer.friendRequests.filter(req => req.fromId !== fromId)
      };
      
      setAllPlayers(prev => prev.map(p => {
          if (p.id === fromId) return { ...p, friends: [...p.friends, currentPlayer.id] };
          if (p.id === currentPlayer.id) return updatedCurrentPlayer;
          return p;
      }));
      updatePlayerInAllLists(updatedCurrentPlayer);
      showNotification(`You are now friends with ${fromPlayer.name}!`);
  };

  const handleDeclineFriendRequest = (fromId: string) => {
      const updatedCurrentPlayer = {
          ...currentPlayer,
          friendRequests: currentPlayer.friendRequests.filter(req => req.fromId !== fromId)
      };
      updatePlayerInAllLists(updatedCurrentPlayer);
  };
  
  const handleOpenPrivateChat = (friendId: string) => {
      if (!privateChats[friendId]) {
          setPrivateChats(prev => ({...prev, [friendId]: []}));
      }
  };
  
  const handleClosePrivateChat = (friendId: string) => {
      setPrivateChats(prev => {
          const newChats = {...prev};
          delete newChats[friendId];
          return newChats;
      });
  };

  const handleSendPrivateMessage = (toId: string, text: string) => {
      const newMessage: PrivateChatMessage = {
          id: `priv_${Date.now()}`,
          fromId: currentPlayer.id,
          toId,
          text,
          timestamp: Date.now(),
          isRead: false
      };
      setPrivateChats(prev => ({
          ...prev,
          [toId]: [...(prev[toId] || []), newMessage]
      }));

      // Simulate receiving a reply
      setTimeout(() => {
          const replyMessage: PrivateChatMessage = {
              id: `priv_${Date.now()}_reply`,
              fromId: toId,
              toId: currentPlayer.id,
              text: "Haha nice!",
              timestamp: Date.now(),
              isRead: false
          };
          setPrivateChats(prev => ({
              ...prev,
              [toId]: [...(prev[toId] || []), replyMessage]
          }));
          playSound('correct');
      }, 2000);
  };

  const handleViewReplay = (dareId: string) => {
      const dareToPlay = dareArchive.find(d => d.id === dareId);
      if (dareToPlay) {
          setViewingReplay(dareToPlay);
      }
  };

  const handleSendGreeting = (content: string) => {
    const newGreeting: FloatingGreeting = {
      id: `greeting_${Date.now()}`,
      fromName: currentPlayer.name,
      fromColorClass: getColorById(currentPlayer.customization.colorId)?.secondaryClass || 'border-gray-300',
      content,
    };
    setGreetings(prev => [...prev, newGreeting]);
    playSound('tap');

    // Remove after 5 seconds
    setTimeout(() => {
      setGreetings(prev => prev.filter(g => g.id !== newGreeting.id));
    }, 5000);
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (isSwappingCategory) {
        return (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
                <div className="w-full max-w-4xl h-[85vh] bg-gray-800 rounded-2xl p-8">
                     <CategorySelectionScreen onSelectCategory={handleCategorySelect} />
                </div>
            </div>
        )
    }
    
    const contentKey = `${gameState}-${currentRound}`;

    return (
        <div key={contentKey} className="w-full h-full animate-slide-in">
        {(() => {
            switch (gameState) {
              case GameState.MAIN_MENU:
                return <MainMenuScreen onCreateLobby={handleCreateLobby} />;
              case GameState.CATEGORY_SELECTION:
                return <CategorySelectionScreen onSelectCategory={handleCategorySelect} />;
              case GameState.CUSTOMIZATION:
                return <CustomizationScreen player={currentPlayer} onSave={handleCustomizationSave} />;
              case GameState.LOBBY:
                return <Lobby 
                    players={players} 
                    currentPlayer={currentPlayer} 
                    onStartGame={handleStartGame} 
                    reactions={activeReactions} 
                    notificationPermission={notificationPermission} 
                    onRequestNotifications={handleRequestNotifications} 
                    onViewProfile={handleViewProfile} 
                    showNotification={showNotification}
                    onKickPlayer={handleKickPlayer}
                    onLeaveLobby={handleLeaveLobby}
                    maxRounds={maxRounds}
                    onMaxRoundsChange={setMaxRounds}
                />;
              case GameState.MINIGAME:
                return <GameScreen challenge={currentChallenge} players={players} currentPlayerId={currentPlayer.id} onMiniGameEnd={handleMiniGameEnd} round={currentRound} reactions={activeReactions} extraTime={extraTime} onViewProfile={handleViewProfile} />;
              case GameState.SUDDEN_DEATH:
                return <SuddenDeathScreen players={suddenDeathPlayers} onEnd={handleSuddenDeathEnd} onViewProfile={handleViewProfile}/>;
              case GameState.DARE_SCREEN:
                return <DareScreen loser={roundLoser} dare={currentDare} players={players} onStartLiveDare={handleStartLiveDare} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer} />;
              case GameState.DARE_LIVE_STREAM:
                 return <LiveDareView dare={currentDare} loser={roundLoser} onVote={handleLiveDareVote} currentPlayer={currentPlayer} reactions={activeReactions} greetings={greetings} onSendGreeting={handleSendGreeting} />;
              case GameState.LEADERBOARD:
                return <Leaderboard players={players} isEndOfGame={currentRound >= maxRounds} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer} onViewProfile={handleViewProfile} currentDare={currentDare} onViewReplay={handleViewReplay}/>;
              default:
                return <MainMenuScreen onCreateLobby={handleCreateLobby} />;
            }
        })()}
        </div>
    );
  };
  
  useEffect(() => {
      // Keep room players and global players in sync for currentPlayer
      const playerInAll = allPlayers.find(p => p.id === currentPlayer.id);
      if(playerInAll && playerInAll !== currentPlayer) {
          setCurrentPlayer(playerInAll);
      }
  }, [allPlayers, currentPlayer]);

  const showEmojiPanel = [GameState.MINIGAME, GameState.DARE_LIVE_STREAM, GameState.LOBBY].includes(gameState);
  const showPowerUpPanel = [GameState.MINIGAME, GameState.DARE_SCREEN, GameState.LEADERBOARD].includes(gameState);
  const showChatPanel = ![GameState.MAIN_MENU, GameState.CATEGORY_SELECTION, GameState.CUSTOMIZATION].includes(gameState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <div className="text-2xl font-bold text-white drop-shadow-lg">DareDown</div>
        {gameState !== GameState.MAIN_MENU && (
            <>
                <button onClick={() => setIsFriendsPanelOpen(true)} className="px-4 py-2 text-sm font-semibold rounded-full bg-purple-500/70 hover:bg-purple-500/90 transition-colors transform active:scale-95">
                    Social 💬
                </button>
                <button onClick={() => setIsArchiveOpen(true)} className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-500/70 hover:bg-blue-500/90 transition-colors transform active:scale-95">
                    Dare Archive 📼
                </button>
            </>
        )}
      </div>
      <button onClick={handleToggleMute} className="absolute top-4 right-4 text-2xl p-2 rounded-full bg-purple-500/50 hover:bg-purple-500/80 transition-colors z-20" aria-label={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row gap-4 items-start justify-center">
        <main className="relative w-full lg:max-w-4xl h-[90vh] lg:h-[85vh] bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-8 border border-purple-500/30 overflow-hidden">
          {loadingState.active ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-xl text-gray-300">{loadingState.message}</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
        
        <div className="hidden lg:block">
            {showChatPanel && (
                <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} onReactToMessage={handleReactToMessage} currentPlayerId={currentPlayer.id} />
            )}
        </div>
      </div>
      
      {showChatPanel && (
          <>
            <button onClick={() => setIsChatOpen(true)} className="lg:hidden fixed bottom-24 right-4 bg-purple-600 rounded-full p-3 shadow-lg z-30 animate-pulse" aria-label="Open Chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            {isChatOpen && (
                <div className="lg:hidden fixed inset-0 bg-gray-900/90 z-40 animate-fade-in p-4">
                    <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} onReactToMessage={handleReactToMessage} currentPlayerId={currentPlayer.id} onClose={() => setIsChatOpen(false)} />
                </div>
            )}
          </>
      )}

      {showEmojiPanel && <EmojiReactionPanel onReact={handleEmojiReaction} />}
      {showPowerUpPanel && <PowerUpPanel player={currentPlayer} onUsePowerUp={handleUsePowerUp} gameState={gameState} isLoser={currentPlayer.id === roundLoser?.id} />}

      {isFriendsPanelOpen && (
        <FriendsPanel
          isOpen={isFriendsPanelOpen}
          onClose={() => setIsFriendsPanelOpen(false)}
          currentPlayer={currentPlayer}
          allPlayers={allPlayers}
          onSendRequest={handleSendFriendRequest}
          onAcceptRequest={handleAcceptFriendRequest}
          onDeclineRequest={handleDeclineFriendRequest}
          onViewProfile={handleViewProfile}
          onOpenChat={handleOpenPrivateChat}
        />
      )}
      
      {viewingProfile && (
          <PlayerProfileModal player={viewingProfile} onClose={() => setViewingProfile(null)} onViewReplay={handleViewReplay} />
      )}
      
      {Object.entries(privateChats).map(([friendId, messages]) => {
          const friend = allPlayers.find(p => p.id === friendId);
          if(!friend) return null;
          return <PrivateChatWindow key={friendId} friend={friend} messages={messages} onSendMessage={(text) => handleSendPrivateMessage(friendId, text)} onClose={() => handleClosePrivateChat(friendId)} />
      })}

      {newUnlock && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className={`bg-gradient-to-br ${ 'unlockId' in newUnlock ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-purple-500' } p-1 rounded-xl shadow-2xl`}>
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{'unlockId' in newUnlock ? 'Item Unlocked!' : 'Power-Up Gained!'}</h2>
                    <p className="text-6xl mb-4">{newUnlock.emoji}</p>
                    <p className={`text-xl font-semibold ${ 'unlockId' in newUnlock ? 'text-yellow-300' : 'text-blue-300'}`}>{newUnlock.name}</p>
                    <p className="text-gray-400">{newUnlock.description}</p>
                </div>
            </div>
        </div>
      )}
      
      {notification && (
         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center gap-4 z-40 animate-slide-down">
            {notification.emoji && <span className="text-3xl">{notification.emoji}</span>}
            <p className="text-lg font-semibold">{notification.message}</p>
         </div>
      )}

      {isArchiveOpen && (
        <DareArchiveModal 
            isOpen={isArchiveOpen} 
            onClose={() => setIsArchiveOpen(false)} 
            archive={dareArchive}
            allPlayers={allPlayers}
            onPlay={handleViewReplay}
        />
      )}

      {viewingReplay && (
        <ReplayViewerModal
            dare={viewingReplay}
            player={allPlayers.find(p => p.id === viewingReplay.assigneeId)}
            onClose={() => setViewingReplay(null)}
        />
      )}
    </div>
  );
}