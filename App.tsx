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
import TeamDareVoteScreen from './components/TeamDareVoteScreen';
import PublicLobbiesScreen from './components/PublicLobbiesScreen';
import HallOfFameScreen from './components/HallOfFameScreen';
import { Toaster } from 'react-hot-toast';

import { SocialStoreProvider, useSocialStore } from './stores/SocialStore';
import { UIStoreProvider, useUIStore } from './stores/UIStore';
import { GameStoreProvider, useGameStore } from './stores/GameStore';


const AppContent = () => {
    // --- STATE FROM STORES ---
    const {
        gameState, currentRound, currentChallenge, roundLoser, suddenDeathPlayers,
        currentDare, extraTime, isSwappingCategory, maxRounds, players, dareArchive,
        dareMode, submittedDares, winningDareId, losingTeamId, teamVotes, publicLobbies,
        hallOfFame, hallOfFameVotes
    } = useGameStore();

    const {
        currentPlayer, allPlayers, chatMessages, privateChats
    } = useSocialStore();

    // FIX: Destructure `newUnlock` from the UI store to display the unlock notification.
    const {
        loadingState, isMuted, isChatOpen, isFriendsPanelOpen, viewingProfile, 
        isArchiveOpen, viewingReplay, greetings, newUnlock
    } = useUIStore();

    // --- HANDLERS FROM STORES ---
    const {
        handleCreateLobby, handleCategorySelect, handleCustomizationSave, handleStartGame,
        handleMiniGameEnd, handleSuddenDeathEnd, handleStartLiveDare, handleStreamEnd,
        handleProofVote, handleUsePowerUp, handleKickPlayer, handleLeaveLobby, setMaxRounds,
        handleViewReplay, setDareMode, handleDareSubmit, handleDareVote, handlePlayAgain,
        handleReturnToMenu, handleGoBack, handleJoinTeam, handleTeamMateVote,
        handleViewPublicLobbies, handleJoinPublicLobby, handleQuickJoin, handleRefreshLobbies,
        handleViewHallOfFame, handleVoteHallOfFame
    } = useGameStore();

    const {
        handleSendFriendRequest, handleAcceptFriendRequest, handleDeclineFriendRequest,
        handleSendMessage, handleReactToMessage, handleSendPrivateMessage, handleOpenPrivateChat,
        handleClosePrivateChat
    } = useSocialStore();

    const {
        handleToggleMute, handleEmojiReaction, setIsChatOpen, setIsFriendsPanelOpen,
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
                    <div className="w-full h-full bg-gray-800 p-8">
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
                    return <MainMenuScreen onCreateLobby={handleCreateLobby} onJoinLobby={handleViewPublicLobbies} onViewHallOfFame={handleViewHallOfFame} />;
                case GameState.PUBLIC_LOBBIES:
                    return <PublicLobbiesScreen lobbies={publicLobbies} onJoin={handleJoinPublicLobby} onQuickJoin={handleQuickJoin} onRefresh={handleRefreshLobbies} onGoBack={handleGoBack} />;
                case GameState.HALL_OF_FAME:
                    return <HallOfFameScreen entries={hallOfFame} onVote={handleVoteHallOfFame} votedIds={hallOfFameVotes} onViewReplay={handleViewReplay} onGoBack={handleGoBack} />;
                case GameState.CATEGORY_SELECTION:
                    return <CategorySelectionScreen onSelectCategory={handleCategorySelect} onGoBack={handleGoBack} />;
                case GameState.CUSTOMIZATION:
                    return <CustomizationScreen player={currentPlayer} onSave={handleCustomizationSave} onGoBack={handleGoBack} />;
                case GameState.LOBBY:
                    return <Lobby 
                        players={players} 
                        currentPlayer={currentPlayer} 
                        onStartGame={handleStartGame} 
                        onViewProfile={handleViewProfile} 
                        showNotification={showNotification}
                        onKickPlayer={handleKickPlayer}
                        onLeaveLobby={handleLeaveLobby}
                        maxRounds={maxRounds}
                        onMaxRoundsChange={setMaxRounds}
                        dareMode={dareMode}
                        onDareModeChange={setDareMode}
                        onJoinTeam={handleJoinTeam}
                    />;
                case GameState.MINIGAME:
                    return <GameScreen challenge={currentChallenge} players={players} currentPlayerId={currentPlayer.id} onMiniGameEnd={handleMiniGameEnd} round={currentRound} extraTime={extraTime} onViewProfile={handleViewProfile} />;
                case GameState.SUDDEN_DEATH:
                    return <SuddenDeathScreen players={suddenDeathPlayers} onEnd={handleSuddenDeathEnd} onViewProfile={handleViewProfile}/>;
                case GameState.TEAM_DARE_VOTE:
                    return <TeamDareVoteScreen players={players} currentPlayer={currentPlayer} losingTeamId={losingTeamId} teamVotes={teamVotes} onVote={handleTeamMateVote} />
                case GameState.DARE_SUBMISSION:
                    return <DareSubmissionScreen loser={roundLoser} currentPlayer={currentPlayer} players={players} onSubmit={handleDareSubmit} />;
                case GameState.DARE_VOTING:
                    return <DareVotingScreen dares={submittedDares} players={players} onVote={handleDareVote} winningDareId={winningDareId} />;
                case GameState.DARE_SCREEN:
                    return <DareScreen loser={roundLoser} dare={currentDare} onStartLiveDare={handleStartLiveDare} currentPlayer={currentPlayer} />;
                case GameState.DARE_LIVE_STREAM:
                    return <LiveDareView dare={currentDare} loser={roundLoser} onStreamEnd={handleStreamEnd} currentPlayer={currentPlayer} greetings={greetings} onSendGreeting={handleSendGreeting} />;
                case GameState.DARE_PROOF:
                    return <DareProofScreen dare={currentDare} loser={roundLoser} onVote={handleProofVote} currentPlayerId={currentPlayer.id} />;
                case GameState.LEADERBOARD:
                    return <Leaderboard players={players} currentPlayer={currentPlayer} onViewProfile={handleViewProfile} currentDare={currentDare} onViewReplay={handleViewReplay}/>;
                case GameState.GAME_END:
                    return <GameEndScreen players={players} onPlayAgain={handlePlayAgain} onReturnToMenu={handleReturnToMenu} />;
                default:
                    return <MainMenuScreen onCreateLobby={handleCreateLobby} onJoinLobby={handleViewPublicLobbies} onViewHallOfFame={handleViewHallOfFame} />;
                }
            })()}
            </div>
        );
    };
  
    const showBottomBar = [GameState.MINIGAME, GameState.DARE_LIVE_STREAM, GameState.LOBBY, GameState.DARE_SCREEN, GameState.LEADERBOARD].includes(gameState);
    const showChatButton = ![GameState.MAIN_MENU, GameState.PUBLIC_LOBBIES, GameState.HALL_OF_FAME, GameState.CATEGORY_SELECTION, GameState.CUSTOMIZATION, GameState.GAME_END].includes(gameState);

    if (!currentPlayer) {
        return (
             <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-xl text-gray-300">Initializing Player...</p>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center p-2 sm:p-4">
        <Toaster
            position="top-center"
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
            {gameState !== GameState.MAIN_MENU && (
                <>
                    <button onClick={() => setIsFriendsPanelOpen(true)} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-500/70 hover:bg-purple-500/90 transition-colors transform active:scale-95">
                        Social
                    </button>
                    <button onClick={() => setIsArchiveOpen(true)} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-500/70 hover:bg-blue-500/90 transition-colors transform active:scale-95">
                        Archive
                    </button>
                </>
            )}
        </div>
         <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">DareDown</h1>
            <button onClick={handleToggleMute} className="text-xl p-2 rounded-full bg-purple-500/50 hover:bg-purple-500/80 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
        
        <main className="relative w-full flex-1 max-w-7xl flex flex-col items-center justify-start bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-8 border border-purple-500/30 mt-16 mb-4 overflow-y-auto">
        {loadingState.active ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-xl text-gray-300">{loadingState.message}</p>
            </div>
        ) : (
            renderContent()
        )}
        </main>
        
        {showBottomBar && (
            <div className="sticky bottom-4 w-full max-w-sm flex justify-center items-center z-30 mt-2">
                <PowerUpPanel player={currentPlayer} onUsePowerUp={handleUsePowerUp} gameState={gameState} isLoser={currentPlayer.id === roundLoser?.id} />
                <EmojiReactionPanel onReact={handleEmojiReaction} />
            </div>
        )}

        {showChatButton && (
            <>
                <button onClick={() => setIsChatOpen(true)} className="fixed bottom-4 right-4 bg-purple-600 rounded-full p-3 shadow-lg z-30 animate-pulse" aria-label="Open Chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
                {isChatOpen && (
                    <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setIsChatOpen(false)}>
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-[75vh] bg-gray-900/90 backdrop-blur-md z-40 animate-slide-in-up p-4 rounded-t-2xl border-t-2 border-purple-500/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} onReactToMessage={handleReactToMessage} currentPlayerId={currentPlayer.id} onClose={() => setIsChatOpen(false)} />
                        </div>
                    </div>
                )}
            </>
        )}

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
                player={allPlayers.find(p => p.id === viewingReplay.assigneeId) || hallOfFame.find(e => e.dare.id === viewingReplay.id)?.assignee}
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