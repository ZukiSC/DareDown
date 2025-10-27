import React, { useState, useEffect, useCallback } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface TapSpeedGameProps {
  onGameEnd: (loserId: string) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 5;

const TapSpeedGame: React.FC<TapSpeedGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(true); // Auto-start after briefing

  useEffect(() => {
    if (extraTime > 0) {
      setTimeLeft(prev => prev + extraTime);
    }
  }, [extraTime]);

  const handleTap = () => {
    if (timeLeft > 0 && gameStarted) {
      playSound('tap');
      setTaps(prev => prev + 1);
    }
  };
  
  const determineLoser = useCallback((playerScore: number) => {
    let loserId = currentPlayerId;
    let minScore = playerScore;

    players.forEach(player => {
      if (player.id !== currentPlayerId) {
        const botScore = Math.floor(Math.random() * 25) + 5;
        if (botScore < minScore) {
          minScore = botScore;
          loserId = player.id;
        }
      }
    });
    return loserId;
  }, [players, currentPlayerId]);

  useEffect(() => {
    if (!gameStarted) return;

    if (timeLeft <= 0) {
      playSound('timesUp');
      onGameEnd(determineLoser(taps));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted, onGameEnd, determineLoser, taps]);


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
