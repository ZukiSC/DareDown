import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Dare, Category, Challenge, PlayerCustomization, Badge, PowerUp, PowerUpType, ChatMessage } from './types';
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
import { preloadSounds, playSound, toggleMute } from './services/audioService';
import { getChallengeForRoom } from './services/challengeService';
import { getBadgeById } from './services/customizationService';
import { getRandomPowerUp, getPowerUpById } from './services/powerUpService';
import { requestNotificationPermission, showLocalNotification } from './services/notificationService';
import { generateDare } from './services/geminiService';

// --- MOCK DATA & SIMULATION ---
const MOCK_PLAYERS: Player[] = [
  { 
    id: 'p1', name: 'Player 1', score: 0, isHost: true, 
    customization: { avatarId: 'avatar_1', colorId: 'color_1', badgeId: null },
    unlocks: [], powerUps: ['SKIP_DARE'],
  },
];
const MAX_ROUNDS = 5;
type ActiveReaction = { id: string; playerId: string; emoji: string };
type Notification = { message: string, emoji?: string };
type LoadingState = { active: boolean; message: string };
// --- END MOCK DATA ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.CATEGORY_SELECTION);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(MOCK_PLAYERS[0]);
  const [currentRound, setCurrentRound] = useState(0);
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
      if (gameState !== GameState.MINIGAME && gameState !== GameState.DARE_SCREEN && players.length < 8) {
        const newPlayerId = `p${players.length + 1}`;
        const categories: Category[] = ['General', 'Trivia', 'Programming', 'Speed/Reflex'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const newPlayer: Player = {
          id: newPlayerId, name: `Player ${players.length + 1}`, score: 0, isHost: false,
          category: randomCategory,
          customization: { avatarId: `avatar_${(players.length % 4) + 2}`, colorId: `color_${(players.length % 5) + 2}`, badgeId: null },
          unlocks: [],
          powerUps: [],
        };
        setPlayers(prev => [...prev, newPlayer]);
      }
    }, 5000);
    return () => clearInterval(playerJoinInterval);
  }, [gameState, players.length]);
  
    // Simulate bot chat messages
    useEffect(() => {
      const chatInterval = setInterval(() => {
        const bots = players.filter(p => p.id !== currentPlayer.id);
        if (bots.length > 0 && Math.random() < 0.25) { // 25% chance to chat every 6 seconds
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


  const handleCategorySelect = (category: Category) => {
    if (isSwappingCategory) {
        const updatedPlayer = { ...currentPlayer, category };
        setCurrentPlayer(updatedPlayer);
        setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));
        setIsSwappingCategory(false);
        showNotification('Category swapped!');
    } else {
        const updatedPlayer = { ...currentPlayer, category };
        setCurrentPlayer(updatedPlayer);
        setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));
        setGameState(GameState.CUSTOMIZATION);
    }
  };
  
  const handleCustomizationSave = (customization: PlayerCustomization) => {
    const updatedPlayer = { ...currentPlayer, customization };
    setCurrentPlayer(updatedPlayer);
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));
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
    // Check for winner unlock
    const winner = [...players].sort((a,b) => b.score - a.score)[0];
    if (winner && !winner.unlocks.includes('badge_winner')) {
        const badge = getBadgeById('badge_winner');
        setNewUnlock(badge);
        setPlayers(prev => prev.map(p => p.id === winner.id ? { ...p, unlocks: [...p.unlocks, 'badge_winner'] } : p));
    }
    playSound('winGame');
    setGameState(GameState.LEADERBOARD);
  }, [players]);

  const handleNextRound = useCallback(() => {
    setNewUnlock(null);
    setExtraTime(0);

    // Award a power-up to a random non-loser player
    const potentialRecipients = players.filter(p => p.id !== roundLoser?.id);
    if(potentialRecipients.length > 0) {
        const recipient = potentialRecipients[Math.floor(Math.random() * potentialRecipients.length)];
        const newPowerUp = getRandomPowerUp();
        setPlayers(prev => prev.map(p => p.id === recipient.id ? { ...p, powerUps: [...p.powerUps, newPowerUp.id] } : p));
        if (recipient.id === currentPlayer.id) {
            setNewUnlock(newPowerUp);
        }
        showNotification(`${recipient.name} got a power-up!`, newPowerUp.emoji);
        showLocalNotification("You got a power-up!", { body: `You received: ${newPowerUp.name}` });
    }

    const nextRoundNumber = currentRound + 1;
    if (nextRoundNumber > MAX_ROUNDS) {
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
  }, [currentRound, generateNextChallenge, handleEndOfGame, players, roundLoser, currentPlayer.id, showNotification]);

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
    }, 1500); // Simulate a short delay for dramatic effect

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

  const handleLiveDareVote = (passed: boolean) => {
      if (roundLoser && currentDare) {
          const newStatus = passed ? 'completed' : 'failed';
          setCurrentDare({ ...currentDare, status: newStatus });
          playSound(passed ? 'dareComplete' : 'incorrect');

          if (passed) {
              showLocalNotification("Dare Completed!", { body: `${roundLoser.name} completed their dare.` });
              const dareCompleter = players.find(p => p.id === roundLoser.id);
              if (dareCompleter && !dareCompleter.unlocks.includes('badge_dare_survivor')) {
                  const badge = getBadgeById('badge_dare_survivor');
                  setNewUnlock(badge);
                  setPlayers(prev => prev.map(p => p.id === roundLoser.id ? { ...p, unlocks: [...p.unlocks, 'badge_dare_survivor'] } : p));
              }
              setPlayers(prevPlayers => prevPlayers.map(p => p.id !== roundLoser.id ? { ...p, score: p.score + 10 } : p));
          } else {
              // Penalty for failing
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
    setCurrentPlayer(updatedPlayer);
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));
    
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
    
    // Simulate a bot reaction
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
    
    // Using a key on the container div forces a remount on gameState change, which allows for clean animations.
    const contentKey = `${gameState}-${currentRound}`;

    return (
        <div key={contentKey} className="w-full h-full animate-slide-in">
        {(() => {
            switch (gameState) {
              case GameState.CATEGORY_SELECTION:
                return <CategorySelectionScreen onSelectCategory={handleCategorySelect} />;
              case GameState.CUSTOMIZATION:
                return <CustomizationScreen player={currentPlayer} onSave={handleCustomizationSave} />;
              case GameState.LOBBY:
                return <Lobby players={players} currentPlayer={currentPlayer} onStartGame={handleStartGame} reactions={activeReactions} notificationPermission={notificationPermission} onRequestNotifications={handleRequestNotifications} />;
              case GameState.MINIGAME:
                return <GameScreen challenge={currentChallenge} players={players} currentPlayerId={currentPlayer.id} onMiniGameEnd={handleMiniGameEnd} round={currentRound} reactions={activeReactions} extraTime={extraTime} />;
              case GameState.SUDDEN_DEATH:
                return <SuddenDeathScreen players={suddenDeathPlayers} onEnd={handleSuddenDeathEnd} />;
              case GameState.DARE_SCREEN:
                return <DareScreen loser={roundLoser} dare={currentDare} players={players} onStartLiveDare={handleStartLiveDare} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer} />;
              case GameState.DARE_LIVE_STREAM:
                 return <LiveDareView dare={currentDare} loser={roundLoser} onVote={handleLiveDareVote} currentPlayer={currentPlayer} reactions={activeReactions} />;
              case GameState.LEADERBOARD:
                return <Leaderboard players={players} isEndOfGame={currentRound >= MAX_ROUNDS} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer}/>;
              default:
                return <CategorySelectionScreen onSelectCategory={handleCategorySelect} />;
            }
        })()}
        </div>
    );
  };

  const showEmojiPanel = [GameState.MINIGAME, GameState.DARE_LIVE_STREAM, GameState.LOBBY].includes(gameState);
  const showPowerUpPanel = [GameState.MINIGAME, GameState.DARE_SCREEN, GameState.LEADERBOARD].includes(gameState);
  const showChatPanel = ![GameState.CATEGORY_SELECTION, GameState.CUSTOMIZATION].includes(gameState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="absolute top-4 left-4 text-2xl font-bold text-white drop-shadow-lg">DareDown</div>
      <button onClick={handleToggleMute} className="absolute top-4 right-4 text-2xl p-2 rounded-full bg-purple-500/50 hover:bg-purple-500/80 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
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
        
        {/* Desktop Chat */}
        <div className="hidden lg:block">
            {showChatPanel && (
                <ChatPanel
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onReactToMessage={handleReactToMessage}
                    currentPlayerId={currentPlayer.id}
                />
            )}
        </div>
      </div>
      
      {/* Mobile Chat */}
      {showChatPanel && (
          <>
            <button
                onClick={() => setIsChatOpen(true)}
                className="lg:hidden fixed bottom-24 right-4 bg-purple-600 rounded-full p-3 shadow-lg z-30 animate-pulse"
                aria-label="Open Chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            {isChatOpen && (
                <div className="lg:hidden fixed inset-0 bg-gray-900/90 z-40 animate-fade-in p-4">
                    <ChatPanel
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        onReactToMessage={handleReactToMessage}
                        currentPlayerId={currentPlayer.id}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            )}
          </>
      )}


      {showEmojiPanel && <EmojiReactionPanel onReact={handleEmojiReaction} />}
      {showPowerUpPanel && <PowerUpPanel player={currentPlayer} onUsePowerUp={handleUsePowerUp} gameState={gameState} isLoser={currentPlayer.id === roundLoser?.id} />}

      {/* Unlock Notification */}
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
      
      {/* General Notification */}
      {notification && (
         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center gap-4 z-40 animate-fade-in">
            {notification.emoji && <span className="text-3xl">{notification.emoji}</span>}
            <p className="text-lg font-semibold">{notification.message}</p>
         </div>
      )}
    </div>
  );
}
