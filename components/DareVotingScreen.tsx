

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

    if (votedId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-purple-400 mb-4">Vote Cast!</h1>
                <p className="text-xl text-gray-300">Waiting for other players to vote...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center h-full p-2">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-6">Vote for a Dare!</h1>
            <div className="w-full max-w-2xl space-y-3 overflow-y-auto">
                {dares.map(dare => (
                    <button 
                        key={dare.id}
                        onClick={() => handleVote(dare.id)}
                        disabled={!!votedId}
                        className="w-full text-left p-4 bg-gray-700/80 rounded-lg border-2 border-transparent hover:border-purple-500 transition-all duration-300 disabled:opacity-50 disabled:hover:border-transparent"
                    >
                        <p className="text-xl font-semibold text-white">{dare.text}</p>
                        {/* Fix: Check if submitterId exists on the dare object before attempting to render the submitter's name. */}
                        {dare.submitterId && <p className="text-sm text-gray-400">from: {getSubmitterName(dare.submitterId)}</p>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default DareVotingScreen;
