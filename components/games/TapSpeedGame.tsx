import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface TapSpeedGameProps {
  onGameEnd: (scores: Map<string, number>) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 5;

const TapSpeedGame: React.FC<TapSpeedGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const extraTimeApplied = useRef(false);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const handleTap = () => {
    if (timeLeft > 0) {
      playSound('tap');
      setTaps(prev => prev + 1);
    }
  };
  
  const finalizeScores = useCallback((playerScore: number) => {
    const scores = new Map<string, number>();
    players.forEach(p => {
        if (p.id === currentPlayerId) {
            scores.set(p.id, playerScore);
        } else {
            // Bots score between 5 and 25
            scores.set(p.id, Math.floor(Math.random() * 21) + 5);
        }
    });
    onGameEnd(scores);
  }, [players, currentPlayerId, onGameEnd]);

  useEffect(() => {
    if (isFinished) return;
    const timerId = setTimeout(() => {
        if (timeLeft > 1) {
            setTimeLeft(timeLeft - 1);
        } else {
            playSound('timesUp');
            setIsFinished(true);
            finalizeScores(taps);
        }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores, taps]);


  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <GameTimer duration={GAME_DURATION + extraTime} timeLeft={timeLeft} />
        <p className="text-6xl font-bold mb-8">
          <span key={taps} className="inline-block animate-boing-in">
            {taps}
          </span>
        </p>
        <button 
            onClick={handleTap}
            disabled={isFinished}
            className="w-48 h-48 bg-red-500 rounded-full text-2xl font-bold text-white shadow-2xl transition-transform transform active:scale-95 active:bg-red-600 active:shadow-inner disabled:bg-gray-600"
        >
            TAP!
        </button>
        {isFinished && <p className="mt-8 text-2xl animate-pulse">Time's up!</p>}
    </div>
  );
};

export default TapSpeedGame;