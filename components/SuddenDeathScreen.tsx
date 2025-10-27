import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { playSound } from '../services/audioService';

interface SuddenDeathScreenProps {
  players: Player[];
  onEnd: (loserId: string) => void;
}

const SuddenDeathScreen: React.FC<SuddenDeathScreenProps> = ({ players, onEnd }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            playSound('incorrect');
            // Randomly select a loser from the tied players
            const loser = players[Math.floor(Math.random() * players.length)];
            onEnd(loser.id);
        }
    }, [countdown, onEnd, players]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-red-500 mb-4 animate-pulse">SUDDEN DEATH!</h1>
            <p className="text-xl text-gray-300 mb-8">It's a tie! One of you is about to lose...</p>
            
            <div className="flex justify-center gap-4 my-8">
                {players.map(p => (
                    <PlayerAvatar key={p.id} player={p} isCurrentPlayer={true} />
                ))}
            </div>

            <p className="text-2xl text-yellow-400">Resolving tie in...</p>
            <div className="mt-4 text-6xl font-bold">{countdown}</div>
        </div>
    );
};

export default SuddenDeathScreen;
