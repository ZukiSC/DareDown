import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface NumberRaceGameProps {
  onGameEnd: (scores: Map<string, number>) => void;
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
  const [timeLeft, setTimeLeft] = useState(BASE_TIMEOUT);
  const [isFinished, setIsFinished] = useState(false);
  const extraTimeApplied = useRef(false);

  useEffect(() => {
      if(extraTime > 0 && !extraTimeApplied.current) {
          setTimeLeft(prev => prev + extraTime);
          extraTimeApplied.current = true;
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

  const finalizeScores = useCallback((playerFinished: boolean) => {
    const scores = new Map<string, number>();
    players.forEach(p => {
        if (p.id === currentPlayerId) {
            scores.set(p.id, playerFinished ? 1 : 0);
        } else {
            // 80% chance for a bot to finish
            scores.set(p.id, Math.random() < 0.8 ? 1 : 0);
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
            setIsFinished(true);
            playSound('timesUp');
            finalizeScores(false);
        }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores]);


  const handleNumberClick = (num: number) => {
    if (isFinished) return;
    if (num === currentNumber) {
      playSound('numberClick');
      if (num === MAX_NUMBER) {
        playSound('correct');
        setIsFinished(true);
        finalizeScores(true);
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else if (num > currentNumber) {
        playSound('incorrect');
    }
  };

  return (
    <div className="relative w-full h-full">
      <GameTimer duration={BASE_TIMEOUT + extraTime} timeLeft={timeLeft} />
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