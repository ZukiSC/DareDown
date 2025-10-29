
import React from 'react';
import { GameState } from './types';
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
import DareSubmissionScreen from './components/DareSubmissionScreen';
import DareVotingScreen from './components/DareVotingScreen';
import DareProofScreen from './components/DareProofScreen';
import GameEndScreen from './components/GameEndScreen';
import { Toaster } from 'react-hot-toast';

import { SocialStoreProvider, useSocialStore } from './stores/SocialStore';
import { UIStoreProvider, useUIStore } from './stores/UIStore';
import { GameStoreProvider, useGameStore } from './stores/GameStore';


const AppContent = () => {
    // --- STATE FROM STORES ---
    const {
        gameState, currentRound, currentChallenge, roundLoser, suddenDeathPlayers,
        currentDare, extraTime, isSwappingCategory, maxRounds, players, dareArchive,
        dareMode, submittedDares
    } = useGameStore();

    const {
        currentPlayer, allPlayers, chatMessages, privateChats
    } = useSocialStore();

    const {
        loadingState, isMuted, activeReactions, newUnlock, notificationPermission, isChatOpen,
        isFriendsPanelOpen, viewingProfile, isArchiveOpen, viewingReplay, greetings
    } = useUIStore();

    // --- HANDLERS FROM STORES ---
    const {
        handleCreateLobby, handleCategorySelect, handleCustomizationSave, handleStartGame,
        handleMiniGameEnd, handleSuddenDeathEnd, handleStartLiveDare, handleStreamEnd,
        handleProofVote, handleUsePowerUp, handleKickPlayer, handleLeaveLobby, setMaxRounds,
        handleViewReplay, setDareMode, handleDareSubmit, handleDareVote, handlePlayAgain,
        handleReturnToMenu, handleGoBack
    } = useGameStore();

    const {
        handleSendFriendRequest, handleAcceptFriendRequest, handleDeclineFriendRequest,
        handleSendMessage, handleReactToMessage, handleSendPrivateMessage, handleOpenPrivateChat,
        handleClosePrivateChat
    } = useSocialStore();

    const {
        handleToggleMute, handleEmojiReaction, handleRequestNotifications, setIsFriendsPanelOpen,
        handleViewProfile, setViewingProfile, setIsArchiveOpen, setViewingReplay, handleSendGreeting,
        showNotification
    } = useUIStore();
    
    // --- AUGMENTED HANDLERS to connect stores ---
    const augmentedSendFriendRequest = (targetId: string) => {
        const success = handleSendFriendRequest(targetId);
        if (success) {
            showNotification(`Friend request sent!`);
        }
    };

    const augmentedAcceptFriendRequest = (fromId: string) => {
        const friendName = handleAcceptFriendRequest(fromId);
        if (friendName) {
            showNotification(`You are now friends with ${friendName}!`);
        }
    };

    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (isSwappingCategory) {
            return (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
                    <div className="w-full max-w-4xl h-[85vh] bg-gray-800 rounded-2xl p-8">
                         <CategorySelectionScreen onSelectCategory={handleCategorySelect} onGoBack={() => {}} />
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
                    return <CategorySelectionScreen onSelectCategory={handleCategorySelect} onGoBack={handleGoBack} />;
                case GameState.CUSTOMIZATION:
                    return <CustomizationScreen player={currentPlayer} onSave={handleCustomizationSave} onGoBack={handleGoBack} />;
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
                        dareMode={dareMode}
                        onDareModeChange={setDareMode}
                    />;
                case GameState.MINIGAME:
                    return <GameScreen challenge={currentChallenge} players={players} currentPlayerId={currentPlayer.id} onMiniGameEnd={handleMiniGameEnd} round={currentRound} reactions={activeReactions} extraTime={extraTime} onViewProfile={handleViewProfile} />;
                case GameState.SUDDEN_DEATH:
                    return <SuddenDeathScreen players={suddenDeathPlayers} onEnd={handleSuddenDeathEnd} onViewProfile={handleViewProfile}/>;
                case GameState.DARE_SUBMISSION:
                    return <DareSubmissionScreen loser={roundLoser} currentPlayer={currentPlayer} players={players} onSubmit={handleDareSubmit} />;
                case GameState.DARE_VOTING:
                    return <DareVotingScreen dares={submittedDares} players={players} onVote={handleDareVote} />;
                case GameState.DARE_SCREEN:
                    return <DareScreen loser={roundLoser} dare={currentDare} onStartLiveDare={handleStartLiveDare} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer} />;
                case GameState.DARE_LIVE_STREAM:
                    return <LiveDareView dare={currentDare} loser={roundLoser} onStreamEnd={handleStreamEnd} currentPlayer={currentPlayer} reactions={activeReactions} greetings={greetings} onSendGreeting={handleSendGreeting} />;
                case GameState.DARE_PROOF:
                    return <DareProofScreen dare={currentDare} loser={roundLoser} onVote={handleProofVote} currentPlayerId={currentPlayer.id} />;
                case GameState.LEADERBOARD:
                    return <Leaderboard players={players} onUsePowerUp={handleUsePowerUp} currentPlayer={currentPlayer} onViewProfile={handleViewProfile} currentDare={currentDare} onViewReplay={handleViewReplay}/>;
                case GameState.GAME_END:
                    return <GameEndScreen players={players} onPlayAgain={handlePlayAgain} onReturnToMenu={handleReturnToMenu} />;
                default:
                    return <MainMenuScreen onCreateLobby={handleCreateLobby} />;
                }
            })()}
            </div>
        );
    };
  
    const showEmojiPanel = [GameState.MINIGAME, GameState.DARE_LIVE_STREAM, GameState.LOBBY].includes(gameState);
    const showPowerUpPanel = [GameState.MINIGAME, GameState.DARE_SCREEN, GameState.LEADERBOARD].includes(gameState);
    const showChatPanel = ![GameState.MAIN_MENU, GameState.CATEGORY_SELECTION, GameState.CUSTOMIZATION, GameState.GAME_END].includes(gameState);

    if (!currentPlayer) {
        return (
             <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-xl text-gray-300">Initializing Player...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        <Toaster
            position="top-right"
            toastOptions={{
                className: '',
                style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: '0px',
                    margin: '0px',
                },
            }}
        />
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
                <button onClick={() => useUIStore.getState().setIsChatOpen(true)} className="lg:hidden fixed bottom-24 right-4 bg-purple-600 rounded-full p-3 shadow-lg z-30 animate-pulse" aria-label="Open Chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
                {isChatOpen && (
                    <div className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => useUIStore.getState().setIsChatOpen(false)}>
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gray-900/90 backdrop-blur-md z-40 animate-slide-in-up p-4 rounded-t-2xl border-t-2 border-purple-500/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} onReactToMessage={handleReactToMessage} currentPlayerId={currentPlayer.id} onClose={() => useUIStore.getState().setIsChatOpen(false)} />
                        </div>
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
            onSendRequest={augmentedSendFriendRequest}
            onAcceptRequest={augmentedAcceptFriendRequest}
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
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
                <div className="bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in-up border border-purple-500/50">
                    <span className="text-5xl">{newUnlock.emoji}</span>
                    <div>
                        <h3 className={`text-xl font-bold ${ 'unlockId' in newUnlock ? 'text-yellow-300' : 'text-blue-300'}`}>{ 'unlockId' in newUnlock ? 'Item Unlocked!' : 'Power-Up Gained!'}</h3>
                        <p className="font-semibold">{newUnlock.name}</p>
                        <p className="text-sm text-gray-400">{newUnlock.description}</p>
                    </div>
                </div>
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


export default function App() {
    return (
        <SocialStoreProvider>
            <UIStoreProvider>
                <GameStoreProvider>
                    <AppContent />
                </GameStoreProvider>
            </UIStoreProvider>
        </SocialStoreProvider>
    );
}