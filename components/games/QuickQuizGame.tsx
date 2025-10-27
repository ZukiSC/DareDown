import React, { useState, useEffect, useCallback } from 'react';
import { Player, Challenge, QuizQuestion } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface QuickQuizGameProps {
  onGameEnd: (loserId: string) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 10;

const QuickQuizGame: React.FC<QuickQuizGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [question] = useState<QuizQuestion>(challenge.content);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (extraTime > 0) {
      setTimeLeft(prev => prev + extraTime);
    }
  }, [extraTime]);

  const determineLoser = useCallback(() => {
    const otherPlayers = players.filter(p => p.id !== currentPlayerId);
    if (otherPlayers.length > 0) {
      return otherPlayers[Math.floor(Math.random() * otherPlayers.length)].id;
    }
    return players[0].id;
  }, [players, currentPlayerId]);

  useEffect(() => {
    if (isAnswered) return;

    if (timeLeft <= 0) {
      playSound('timesUp');
      onGameEnd(determineLoser());
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onGameEnd, determineLoser, isAnswered]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);

    setTimeout(() => {
      if (option === question?.correctAnswer) {
        playSound('correct');
        onGameEnd(determineLoser());
      } else {
        playSound('incorrect');
        onGameEnd(currentPlayerId);
      }
    }, 1500);
  };

  if (!question) return <div>Loading question...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <GameTimer duration={GAME_DURATION + extraTime} timeLeft={timeLeft} />
      <h2 className="text-2xl md:text-4xl font-semibold mb-8">{question.question}</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
        {question.options.map((option) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          
          let buttonClass = 'bg-purple-600 hover:bg-purple-700';
          if (isAnswered) {
              if (isCorrect) buttonClass = 'bg-green-600';
              else if (isSelected && !isCorrect) buttonClass = 'bg-red-600';
              else buttonClass = 'bg-gray-600 opacity-50';
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered}
              className={`p-4 rounded-lg text-lg font-semibold transition-all duration-300 ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {isAnswered && <p className="mt-6 text-xl">Waiting for other players...</p>}
    </div>
  );
};

// Fix: Removed local GameTimer component declaration which conflicted with the imported component.
// The GameTimer component is defined in its own file (`components/games/GameTimer.tsx`) and should be imported from there.

export default QuickQuizGame;