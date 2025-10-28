import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface MemoryMatchGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
const BASE_TIMEOUT = 45;

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BASE_TIMEOUT);
  const [isFinished, setIsFinished] = useState(false);
  const extraTimeApplied = useRef(false);
  
  const pairCount = challenge.content.pairCount || 6;

  useEffect(() => {
    const gameEmojis = EMOJIS.slice(0, pairCount);
    const gameCards = [...gameEmojis, ...gameEmojis]
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(gameCards);
  }, [pairCount]);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);
  
  const determineLosers = useCallback((playerMoves: number) => {
     const results = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, score: playerMoves };
        }
        // Bots take between pairCount * 2 and pairCount * 4 moves
        const botMoves = Math.floor(Math.random() * (pairCount * 2)) + (pairCount * 2);
        return { id: p.id, score: botMoves };
    });
    
    const maxScore = Math.max(...results.map(r => r.score));
    const losers = results.filter(r => r.score === maxScore);
    return losers.map(l => l.id);

  }, [players, currentPlayerId, pairCount]);

  useEffect(() => {
    if (isFinished) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isFinished]);

  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      playSound('timesUp');
      onGameEnd(determineLosers(moves + 10)); // Penalty for not finishing
      setIsFinished(true);
    }
  }, [timeLeft, isFinished, onGameEnd, determineLosers, moves]);


  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        playSound('correct');
        setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card)));
        const allMatched = cards.every(c => c.isMatched || c.id === cards[firstIndex].id || c.id === cards[secondIndex].id);
        if(allMatched) {
            setIsFinished(true);
            onGameEnd(determineLosers(moves));
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card)));
        }, 1000);
      }
      setTimeout(() => setFlippedIndices([]), 1000);
    }
  }, [flippedIndices, cards, onGameEnd, moves, determineLosers]);

  const handleCardClick = (index: number) => {
    if (isFinished || flippedIndices.length === 2 || cards[index].isFlipped) return;
    playSound('tap');
    setCards(prev => prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card)));
    setFlippedIndices(prev => [...prev, index]);
    if(flippedIndices.length === 0) setMoves(m => m + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <GameTimer duration={BASE_TIMEOUT + extraTime} timeLeft={timeLeft} />
      <p className="mb-4 text-xl">Moves: <span className="font-bold">{moves}</span></p>
      <div className={`grid ${pairCount > 6 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-6'} gap-2 sm:gap-4`}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isFlipped || isFinished}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-3xl transition-transform duration-300 transform-style-3d 
                ${card.isFlipped ? 'rotate-y-180' : ''}
                ${card.isMatched ? 'card-matched' : ''}`}
          >
            <div className={`absolute inset-0 flex items-center justify-center backface-hidden rounded-lg bg-purple-600`}>
              ?
            </div>
             <div className={`absolute inset-0 flex items-center justify-center backface-hidden rounded-lg rotate-y-180 ${card.isMatched ? 'bg-green-700' : 'bg-blue-600'}`}>
              {card.emoji}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatchGame;