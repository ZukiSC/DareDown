

import React, { useState } from 'react';
import { Player, Dare } from '../types';

interface DareVotingScreenProps {
  dares: Dare[];
  players: Player[];
  onVote: (dareId: string) => void;
  winningDareId: string | null;
}

const DareVotingScreen: React.FC<DareVotingScreenProps> = ({ dares, players, onVote, winningDareId }) => {
    const [votedId, setVotedId] = useState<string | null>(null);

    const handleVote = (dareId: string) => {
        if (!votedId && !winningDareId) {
            setVotedId(dareId);
            onVote(dareId);
        }
    };

    const getSubmitterName = (submitterId: string) => {
        return players.find(p => p.id === submitterId)?.name || 'Unknown';
    }

    if (dares.length === 0 && !winningDareId) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-purple-400 mb-4">Waiting for Dares...</h1>
                <p className="text-xl text-gray-300">Players are submitting their best ideas.</p>
            </div>
        )
    }
    
    const sortedDares = winningDareId ? [...dares].sort((a,b) => (b.votes || 0) - (a.votes || 0)) : dares;

    return (
        <div className="flex flex-col items-center w-full p-2">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 animate-pop-in">
                {winningDareId ? 'The Dare is Chosen!' : (votedId ? 'Vote Cast!' : 'Vote for a Dare!')}
            </h1>
            <p className="text-lg text-gray-300 mb-6 animate-pop-in" style={{ animationDelay: '100ms' }}>
                {winningDareId ? 'Get ready...' : (votedId ? 'Waiting for other players...' : 'Choose the most devious dare.')}
            </p>

            <div className="w-full max-w-2xl space-y-3 pr-2">
                {sortedDares.map((dare, index) => {
                    const isVotedFor = dare.id === votedId;
                    const isWinning = dare.id === winningDareId;
                    
                    let stateClasses = '';

                    if (winningDareId) {
                        if (isWinning) {
                            stateClasses = 'border-yellow-400 bg-yellow-900/50 shadow-lg animate-glow';
                        } else {
                            stateClasses = 'border-transparent opacity-40 scale-95';
                        }
                    } else if (votedId) {
                        if (isVotedFor) {
                            stateClasses = 'border-purple-500 bg-purple-900/50 shadow-lg';
                        } else {
                            stateClasses = 'border-transparent opacity-50 cursor-not-allowed';
                        }
                    } else {
                        stateClasses = 'bg-gray-700/80 border-transparent hover:border-purple-500';
                    }

                    return (
                        <button 
                            key={dare.id}
                            onClick={() => handleVote(dare.id)}
                            disabled={!!votedId || !!winningDareId}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-500 flex justify-between items-center ${stateClasses} animate-slide-in-up opacity-0`}
                            style={{ animationDelay: `${200 + index * 75}ms`}}
                        >
                            <div>
                                <p className="text-xl font-semibold text-white">{dare.text}</p>
                                {dare.submitterId && <p className="text-sm text-gray-400">from: {getSubmitterName(dare.submitterId)}</p>}
                            </div>
                            <div className="flex items-center gap-4">
                                {isVotedFor && !winningDareId && (
                                    <span className="text-3xl animate-boing-in">✔️</span>
                                )}
                                {winningDareId && (
                                    <span className={`text-2xl font-bold ${isWinning ? 'text-yellow-300' : 'text-gray-400'}`}>
                                        {isWinning && '🏆'} {dare.votes || 0} votes
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DareVotingScreen;