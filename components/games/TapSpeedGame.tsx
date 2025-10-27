import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface TapSpeedGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 5;

const TapSpeedGame: React.FC<TapSpeedGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const extraTimeApplied = useRef(false);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const handleTap = () => {
    if (timeLeft > 0 && gameStarted) {
      playSound('tap');
      setTaps(prev => prev + 1);
    }
  };
  
  const determineLosers = useCallback((playerScore: number) => {
    // Simulate scores for bot players
    const scores = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, score: playerScore };
        }
        // Bots score between 5 and 25
        return { id: p.id, score: Math.floor(Math.random() * 21) + 5 };
    });

    if (scores.length === 0) return [];
    
    // Find the minimum score
    const minScore = Math.min(...scores.map(s => s.score));
    
    // Find all players with that minimum score
    const losers = scores.filter(s => s.score === minScore);

    return losers.map(l => l.id);

  }, [players, currentPlayerId]);

  useEffect(() => {
    if (!gameStarted || isFinished) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameStarted, isFinished]);
  
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      playSound('timesUp');
      onGameEnd(determineLosers(taps));
    }
  }, [timeLeft, isFinished, onGameEnd, determineLosers, taps, gameStarted]);


  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <GameTimer duration={GAME_DURATION + extraTime} timeLeft={timeLeft} />
        <p className="text-6xl font-bold mb-8">{taps}</p>
        <button 
            onClick={handleTap}
            disabled={timeLeft <= 0}
            className="w-48 h-48 bg-red-500 rounded-full text-2xl font-bold text-white shadow-2xl transition-transform transform active:scale-95 disabled:bg-gray-600"
        >
            TAP!
        </button>
        {timeLeft <= 0 && <p className="mt-8 text-2xl animate-pulse">Time's up!</p>}
    </div>
  );
};

export default TapSpeedGame;
