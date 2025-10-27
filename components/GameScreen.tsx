import React, { useState, useEffect } from 'react';
import { Challenge, Player, QuizQuestion } from '../types';
import QuickQuizGame from './games/QuickQuizGame';
import TapSpeedGame from './games/TapSpeedGame';
import NumberRaceGame from './games/NumberRaceGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import PlayerAvatar from './PlayerAvatar';

interface GameScreenProps {
  challenge: Challenge | null;
  players: Player[];
  currentPlayerId: string;
  onMiniGameEnd: (loserIds: string[]) => void;
  round: number;
  reactions: { playerId: string, emoji: string }[];
  extraTime: number;
  onViewProfile: (playerId: string) => void;
}

const gameComponents = {
  QUICK_QUIZ: QuickQuizGame,
  TAP_SPEED: TapSpeedGame,
  NUMBER_RACE: NumberRaceGame,
  MEMORY_MATCH: MemoryMatchGame,
};

const gameTitles = {
    QUICK_QUIZ: 'Quick Quiz!',
    TAP_SPEED: 'Tap Speed Test!',
    NUMBER_RACE: 'Number Race!',
    MEMORY_MATCH: 'Memory Match!',
}

const GameScreen: React.FC<GameScreenProps> = ({ challenge, players, currentPlayerId, onMiniGameEnd, round, reactions, extraTime, onViewProfile }) => {
  const [isBriefing, setIsBriefing] = useState(true);
  const [countdown, setCountdown] = useState(3);

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
            <div className="mt-8 text-6xl font-bold animate-ping">{countdown}</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-yellow-400">{title}</h1>
        <div className="text-xl font-semibold bg-purple-600 px-4 py-1 rounded-lg">Round {round}</div>
      </div>
      <div className="flex-grow bg-black/30 rounded-lg p-4 relative">
        <GameComponent 
            onGameEnd={onMiniGameEnd} 
            players={players} 
            currentPlayerId={currentPlayerId} 
            challenge={challenge}
            extraTime={extraTime}
        />
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {players.map(p => {
            const reaction = reactions.find(r => r.playerId === p.id)?.emoji;
            return <PlayerAvatar key={p.id} player={p} isCurrentPlayer={p.id === currentPlayerId} reaction={reaction} onClick={onViewProfile} />
        })}
      </div>
    </div>
  );
};

export default GameScreen;