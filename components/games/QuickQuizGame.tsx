import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge, QuizQuestion } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface QuickQuizGameProps {
  onGameEnd: (loserIds: string[]) => void;
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
  const extraTimeApplied = useRef(false);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const determineLosers = useCallback((isPlayerCorrect?: boolean) => {
    // Simulate other players' answers
    const playerResults = players.map(player => {
        if (player.id === currentPlayerId) {
            return { id: player.id, correct: isPlayerCorrect === true };
        }
        // Bots have a 75% chance of getting it right
        return { id: player.id, correct: Math.random() < 0.75 };
    });

    const losers = playerResults.filter(p => !p.correct);
    if (losers.length > 0) {
        return losers.map(l => l.id);
    }
    // If everyone is correct, pick one random "loser" to keep game moving
    const randomLoser = players[Math.floor(Math.random() * players.length)];
    return [randomLoser.id];
  }, [players, currentPlayerId]);

  useEffect(() => {
    if (isAnswered) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isAnswered]);

  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      playSound('timesUp');
      onGameEnd(determineLosers(false));
    }
  }, [timeLeft, isAnswered, onGameEnd, determineLosers]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    const isCorrect = option === question?.correctAnswer;

    setTimeout(() => {
      if (isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }
      onGameEnd(determineLosers(isCorrect));
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
              else if (isSelected && !isCorrect) buttonClass = 'bg-red-600 animate-shake';
              else buttonClass = 'bg-gray-600 opacity-50';
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered}
              className={`p-4 rounded-lg text-lg font-semibold transition-all duration-300 transform active:scale-95 ${buttonClass}`}
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

export default QuickQuizGame;
