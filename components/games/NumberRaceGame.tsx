import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface NumberRaceGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const MAX_NUMBER = 10;
const BASE_TIMEOUT = 15;

const NumberRaceGame: React.FC<NumberRaceGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);
  const [gameTimeout, setGameTimeout] = useState(BASE_TIMEOUT);
  const [timeLeft, setTimeLeft] = useState(BASE_TIMEOUT);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
      if(extraTime > 0) {
          const newTimeout = BASE_TIMEOUT + extraTime;
          setGameTimeout(newTimeout);
          setTimeLeft(prev => prev + extraTime);
      }
  }, [extraTime]);

  const positions = useMemo(() => {
    const pos = [];
    for(let i = 0; i < MAX_NUMBER; i++) {
        pos.push({
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
        });
    }
    return pos;
  }, []);

  useEffect(() => {
    const numbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setShuffledNumbers(numbers);
  }, []);

  const determineLosers = useCallback((playerFinished: boolean) => {
    // Simulate bot players' performance
    const results = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, finished: playerFinished };
        }
        // 80% chance for a bot to finish
        return { id: p.id, finished: Math.random() < 0.8 };
    });
    const losers = results.filter(r => !r.finished);
    if (losers.length > 0) {
        return losers.map(l => l.id);
    }
    // If everyone finishes, pick a random "loser"
    return [players[Math.floor(Math.random() * players.length)].id];

  }, [players, currentPlayerId]);

  useEffect(() => {
      if (isFinished) return;

      if (timeLeft <= 0) {
          playSound('timesUp');
          onGameEnd(determineLosers(false));
          setIsFinished(true);
          return;
      }

      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
  }, [timeLeft, isFinished, onGameEnd, determineLosers]);


  const handleNumberClick = (num: number) => {
    if (isFinished) return;
    if (num === currentNumber) {
      playSound('numberClick');
      if (num === MAX_NUMBER) {
        playSound('correct');
        setIsFinished(true);
        onGameEnd(determineLosers(true));
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else if (num > currentNumber) {
        playSound('incorrect');
    }
  };

  return (
    <div className="relative w-full h-full">
      <GameTimer duration={gameTimeout} timeLeft={timeLeft} />
      <h2 className="text-center text-2xl font-bold mb-4">Click the numbers in order: <span className="text-yellow-400">{currentNumber}</span></h2>
      {shuffledNumbers.map((num, index) => (
        <button
          key={num}
          onClick={() => handleNumberClick(num)}
          style={{ top: positions[index].top, left: positions[index].left }}
          className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full text-xl font-bold transition-all duration-300 transform 
            ${currentNumber > num ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
            ${currentNumber === num ? 'bg-green-500 animate-bounce' : 'bg-purple-600 hover:bg-purple-500 hover:scale-110'}
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumberRaceGame;