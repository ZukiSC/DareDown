import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface MemoryMatchGameProps {
  onGameEnd: (scores: Map<string, number>) => void;
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
  
  const finalizeScores = useCallback((playerMoves: number) => {
    const scores = new Map<string, number>();
     players.forEach(p => {
        if (p.id === currentPlayerId) {
            scores.set(p.id, playerMoves);
        } else {
            // Bots take between pairCount * 2 and pairCount * 4 moves
            const botMoves = Math.floor(Math.random() * (pairCount * 2)) + (pairCount * 2);
            scores.set(p.id, botMoves);
        }
    });
    onGameEnd(scores);
  }, [players, currentPlayerId, onGameEnd, pairCount]);

  useEffect(() => {
    if (isFinished) return;
    const timerId = setTimeout(() => {
        if (timeLeft > 1) {
            setTimeLeft(timeLeft - 1);
        } else {
            setIsFinished(true);
            playSound('timesUp');
            finalizeScores(moves + 10); // Penalty for not finishing
        }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores, moves]);


  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        playSound('correct');
        const newCards = cards.map((card, index) => (index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card));
        setCards(newCards);

        const allMatched = newCards.every(c => c.isMatched);
        if(allMatched) {
            setIsFinished(true);
            finalizeScores(moves);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card)));
        }, 1000);
      }
      setTimeout(() => setFlippedIndices([]), 1000);
    }
  }, [flippedIndices, cards, finalizeScores, moves]);

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