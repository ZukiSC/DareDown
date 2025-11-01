
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Challenge, Player, QuizQuestion, MiniGameType } from '../types';
import QuickQuizGame from './games/QuickQuizGame';
import TapSpeedGame from './games/TapSpeedGame';
import NumberRaceGame from './games/NumberRaceGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import DoodleDownGame from './games/DoodleDownGame';
import RhythmRushGame from './games/RhythmRushGame';
import SpotTheDifferenceGame from './games/SpotTheDifferenceGame';
import PlayerAvatar from './PlayerAvatar';
import { useUIStore } from '../stores/UIStore';
import GameTimer from './games/GameTimer';
import { playSound } from '../services/audioService';

// --- NEW MINI-GAME COMPONENTS ---

const WordScrambleGame: React.FC<any> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [answer, setAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const extraTimeApplied = useRef(false);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const finalizeScores = useCallback((playerScore: number) => {
    const scores = new Map<string, number>();
    players.forEach(p => {
      if (p.id === currentPlayerId) {
        scores.set(p.id, playerScore);
      } else {
        // Bots have a 60% chance of getting it right
        scores.set(p.id, Math.random() < 0.6 ? 1 : 0);
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
        finalizeScores(0);
      }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinished) return;
    setIsFinished(true);
    const isCorrect = answer.trim().toLowerCase() === challenge.content.original.toLowerCase();
    playSound(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => finalizeScores(isCorrect ? 1 : 0), 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <GameTimer duration={15 + extraTime} timeLeft={timeLeft} />
      <h2 className="text-4xl md:text-6xl font-bold tracking-widest mb-8">{challenge.content.scrambled}</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          disabled={isFinished}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
        />
        <button type="submit" disabled={isFinished} className="p-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:bg-gray-600">
          Submit
        </button>
      </form>
      {isFinished && <p className="mt-6 text-xl">Waiting for other players...</p>}
    </div>
  );
};

const EmojiPuzzleGame: React.FC<any> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [answer, setAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const extraTimeApplied = useRef(false);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const finalizeScores = useCallback((playerScore: number) => {
    const scores = new Map<string, number>();
    players.forEach(p => {
      if (p.id === currentPlayerId) {
        scores.set(p.id, playerScore);
      } else {
        // Bots have a 50% chance of getting it right
        scores.set(p.id, Math.random() < 0.5 ? 1 : 0);
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
        finalizeScores(0);
      }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinished) return;
    setIsFinished(true);
    const isCorrect = answer.trim().toLowerCase() === challenge.content.answer.toLowerCase();
    playSound(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => finalizeScores(isCorrect ? 1 : 0), 1500);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <GameTimer duration={20 + extraTime} timeLeft={timeLeft} />
      <p className="text-gray-400 mb-2">Hint: {challenge.content.hint}</p>
      <h2 className="text-5xl md:text-7xl mb-8">{challenge.content.emojis}</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          disabled={isFinished}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
        />
        <button type="submit" disabled={isFinished} className="p-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:bg-gray-600">
          Submit
        </button>
      </form>
       {isFinished && <p className="mt-6 text-xl">The answer was: <span className="font-bold text-yellow-300">{challenge.content.answer}</span></p>}
    </div>
  );
};


// --- MAIN COMPONENT ---

interface GameScreenProps {
  challenge: Challenge | null;
  players: Player[];
  currentPlayerId: string;
  onMiniGameEnd: (scores: Map<string, number>, challengeType: MiniGameType) => void;
  round: number;
  extraTime: number;
  onViewProfile: (playerId: string) => void;
  speakingPlayerId: string | null;
}

const gameComponents = {
  QUICK_QUIZ: QuickQuizGame,
  TAP_SPEED: TapSpeedGame,
  NUMBER_RACE: NumberRaceGame,
  MEMORY_MATCH: MemoryMatchGame,
  DOODLE_DOWN: DoodleDownGame,
  RHYTHM_RUSH: RhythmRushGame,
  SPOT_THE_DIFFERENCE: SpotTheDifferenceGame,
  WORD_SCRAMBLE: WordScrambleGame,
  EMOJI_PUZZLE: EmojiPuzzleGame,
};

const gameTitles = {
    QUICK_QUIZ: 'Quick Quiz!',
    TAP_SPEED: 'Tap Speed Test!',
    NUMBER_RACE: 'Number Race!',
    MEMORY_MATCH: 'Memory Match!',
    DOODLE_DOWN: 'Doodle Down!',
    RHYTHM_RUSH: 'Rhythm Rush!',
    SPOT_THE_DIFFERENCE: 'Spot The Difference!',
    WORD_SCRAMBLE: 'Word Scramble!',
    EMOJI_PUZZLE: 'Emoji Puzzle!',
}

const GameScreen: React.FC<GameScreenProps> = ({ challenge, players, currentPlayerId, onMiniGameEnd, round, extraTime, onViewProfile, speakingPlayerId }) => {
  const [isBriefing, setIsBriefing] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const { activeReactions } = useUIStore();

  useEffect(() => {
    setIsBriefing(true);
    setCountdown(3);
  }, [challenge]);

  useEffect(() => {
    if (isBriefing && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (isBriefing && countdown === 0) {
      setIsBriefing(false);
    }
  }, [isBriefing, countdown]);

  if (!challenge) {
    return <div>Loading game...</div>;
  }

  const GameComponent = gameComponents[challenge.type];
  const title = gameTitles[challenge.type];

  if (isBriefing) {
    const question = challenge.content as QuizQuestion;
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">{title}</h1>
            <p className="text-xl text-gray-300 mb-8">Get Ready!</p>
            {challenge.type === 'QUICK_QUIZ' && (
                <p className="text-2xl md:text-4xl font-semibold">{question.question}</p>
            )}
             {challenge.type === 'TAP_SPEED' && (
                <p className="text-2xl md:text-4xl font-semibold">Tap the button as fast as you can!</p>
            )}
             {challenge.type === 'NUMBER_RACE' && (
                <p className="text-2xl md:text-4xl font-semibold">Click the numbers 1 to 10 in order!</p>
            )}
            {challenge.type === 'MEMORY_MATCH' && (
                <p className="text-2xl md:text-4xl font-semibold">Find all the matching pairs!</p>
            )}
             {challenge.type === 'DOODLE_DOWN' && (
                <p className="text-2xl md:text-4xl font-semibold">Draw the prompt on your screen!</p>
            )}
            {challenge.type === 'RHYTHM_RUSH' && (
                <p className="text-2xl md:text-4xl font-semibold">Repeat the sequence correctly!</p>
            )}
             {challenge.type === 'SPOT_THE_DIFFERENCE' && (
                <p className="text-2xl md:text-4xl font-semibold">Find the 5 differences between the images!</p>
            )}
            {challenge.type === 'WORD_SCRAMBLE' && (
                <p className="text-2xl md:text-4xl font-semibold">Unscramble this word: <span className="font-bold tracking-widest">{challenge.content.scrambled}</span></p>
            )}
            {challenge.type === 'EMOJI_PUZZLE' && (
                <p className="text-2xl md:text-4xl font-semibold">Guess the phrase from the emojis!</p>
            )}
            <div className="mt-8 text-6xl font-bold animate-ping">{countdown}</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-yellow-400">{title}</h1>
        <div className="text-lg font-semibold bg-purple-600 px-3 py-1 rounded-lg">Round {round}</div>
      </div>
      <div className="flex-grow bg-black/30 rounded-lg p-2 sm:p-4 relative">
        <GameComponent 
            onGameEnd={(scores) => onMiniGameEnd(scores, challenge.type)}
            players={players} 
            currentPlayerId={currentPlayerId} 
            challenge={challenge}
            extraTime={extraTime}
        />
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {players.map(p => {
            const reaction = activeReactions.find(r => r.playerId === p.id)?.emoji;
            return <PlayerAvatar 
                      key={p.id} 
                      player={p} 
                      isCurrentPlayer={p.id === currentPlayerId} 
                      reaction={reaction} 
                      onClick={onViewProfile}
                      isMuted={p.isMuted}
                      isSpeaking={speakingPlayerId === p.id}
                    />
        })}
      </div>
    </div>
  );
};

export default GameScreen;