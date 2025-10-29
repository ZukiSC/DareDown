import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';

interface RhythmRushGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number; // Not used in this game, but kept for interface consistency
}

type GamePhase = 'WATCHING' | 'PLAYING' | 'FAILED' | 'SUCCESS';

const ARROWS = ['↑', '↓', '←', '→'];
const ARROW_CLASSES = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

const RhythmRushGame: React.FC<RhythmRushGameProps> = ({ onGameEnd, players, currentPlayerId }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<GamePhase>('WATCHING');
  const [activeArrow, setActiveArrow] = useState<number | null>(null);
  const playerLevel = useRef(0);

  const determineLosers = useCallback((playerFinalLevel: number) => {
    const scores = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, score: playerFinalLevel };
        }
        // Bots can reach between level 2 and 8
        return { id: p.id, score: Math.floor(Math.random() * 7) + 2 };
    });

    const minScore = Math.min(...scores.map(s => s.score));
    const losers = scores.filter(s => s.score === minScore);
    return losers.map(l => l.id);
  }, [players, currentPlayerId]);

  const nextRound = useCallback(() => {
    setPhase('WATCHING');
    setPlayerInput([]);
    const nextArrow = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, nextArrow];
    setSequence(newSequence);

    newSequence.forEach((arrowIndex, i) => {
      setTimeout(() => {
        playSound('numberClick');
        setActiveArrow(arrowIndex);
        setTimeout(() => setActiveArrow(null), 300);
      }, (i + 1) * 600);
    });

    setTimeout(() => {
      setPhase('PLAYING');
    }, (newSequence.length + 1) * 600);
  }, [sequence]);
  
  useEffect(() => {
      nextRound(); // Start the first round
  }, []);

  const handlePlayerPress = (arrowIndex: number) => {
    if (phase !== 'PLAYING') return;

    playSound('tap');
    const newPlayerInput = [...playerInput, arrowIndex];
    setPlayerInput(newPlayerInput);

    if (newPlayerInput[newPlayerInput.length - 1] !== sequence[newPlayerInput.length - 1]) {
      // Incorrect press
      setPhase('FAILED');
      playSound('incorrect');
      setTimeout(() => onGameEnd(determineLosers(playerLevel.current)), 1500);
      return;
    }

    if (newPlayerInput.length === sequence.length) {
      // Sequence completed
      setPhase('SUCCESS');
      playerLevel.current += 1;
      playSound('correct');
      setTimeout(() => nextRound(), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4">
            Level: <span className="text-purple-400">{playerLevel.current + 1}</span>
        </h2>
        <div className="w-64 h-64 grid grid-cols-2 gap-4 mb-4">
            {ARROWS.map((arrow, index) => (
                <button
                    key={index}
                    onClick={() => handlePlayerPress(index)}
                    disabled={phase !== 'PLAYING'}
                    className={`flex items-center justify-center text-5xl font-bold rounded-lg transition-all duration-200 transform
                        ${ARROW_CLASSES[index]}
                        ${activeArrow === index ? 'scale-110 brightness-150' : ''}
                        ${phase === 'PLAYING' ? 'hover:brightness-125 active:scale-95' : 'cursor-not-allowed opacity-70'}
                    `}
                >
                    {arrow}
                </button>
            ))}
        </div>
        <div className="h-10 text-xl font-semibold">
            {phase === 'WATCHING' && <p className="animate-pulse">Watch the sequence...</p>}
            {phase === 'PLAYING' && <p>Your turn!</p>}
            {phase === 'FAILED' && <p className="text-red-500">Wrong sequence!</p>}
            {phase === 'SUCCESS' && <p className="text-green-500">Correct!</p>}
        </div>
    </div>
  );
};

export default RhythmRushGame;