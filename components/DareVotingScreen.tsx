

import React, { useState } from 'react';
import { Player, Dare } from '../types';

interface DareVotingScreenProps {
  dares: Dare[];
  players: Player[];
  onVote: (dareId: string) => void;
}

const DareVotingScreen: React.FC<DareVotingScreenProps> = ({ dares, players, onVote }) => {
    const [votedId, setVotedId] = useState<string | null>(null);

    const handleVote = (dareId: string) => {
        if (!votedId) {
            setVotedId(dareId);
            onVote(dareId);
        }
    };

    const getSubmitterName = (submitterId: string) => {
        return players.find(p => p.id === submitterId)?.name || 'Unknown';
    }

    if (dares.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-purple-400 mb-4">Waiting for Dares...</h1>
                <p className="text-xl text-gray-300">Players are submitting their best ideas.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center h-full p-2">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                {votedId ? 'Vote Cast!' : 'Vote for a Dare!'}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
                {votedId ? 'Waiting for other players...' : 'Choose the most devious dare.'}
            </p>

            <div className="w-full max-w-2xl space-y-3 overflow-y-auto pr-2">
                {dares.map((dare, index) => {
                    const isVotedFor = dare.id === votedId;
                    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex justify-between items-center";
                    let stateClasses = '';

                    if (votedId) {
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
                            disabled={!!votedId}
                            className={`${baseClasses} ${stateClasses} animate-slide-in-up opacity-0`}
                            style={{ animationDelay: `${index * 75}ms`}}
                        >
                            <div>
                                <p className="text-xl font-semibold text-white">{dare.text}</p>
                                {dare.submitterId && <p className="text-sm text-gray-400">from: {getSubmitterName(dare.submitterId)}</p>}
                            </div>
                            {isVotedFor && (
                                <span className="text-3xl animate-boing-in">✔️</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DareVotingScreen;