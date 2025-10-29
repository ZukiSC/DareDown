import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge, QuizQuestion } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface QuickQuizGameProps {
  onGameEnd: (scores: Map<string, number>) => void;
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

  const finalizeScores = useCallback((playerScore: number) => {
    const scores = new Map<string, number>();
    players.forEach(player => {
        if (player.id === currentPlayerId) {
            scores.set(player.id, playerScore);
        } else {
            // Bots have a 75% chance of getting it right
            scores.set(player.id, Math.random() < 0.75 ? 1 : 0);
        }
    });
    onGameEnd(scores);
  }, [players, currentPlayerId, onGameEnd]);

  useEffect(() => {
    if (isAnswered) return;
    const timer = setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else {
        playSound('timesUp');
        setIsAnswered(true);
        finalizeScores(0);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, finalizeScores]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    const isCorrect = option === question?.correctAnswer;
    const score = isCorrect ? 1 : 0;

    if (isCorrect) {
        playSound('correct');
    } else {
        playSound('incorrect');
    }
    
    setTimeout(() => {
        finalizeScores(score);
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