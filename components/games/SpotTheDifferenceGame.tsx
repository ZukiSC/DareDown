import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface Difference {
  x: number;
  y: number;
  radius: number;
}

interface SpotTheDifferenceGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 30;

const SpotTheDifferenceGame: React.FC<SpotTheDifferenceGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const extraTimeApplied = useRef(false);
  
  const { imageA, imageB, differences } = challenge.content as { imageA: string; imageB: string; differences: Difference[] };
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const determineLosers = useCallback((playerFoundCount: number) => {
    const scores = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, score: playerFoundCount };
        }
        // Bots find between 1 and 4 differences
        return { id: p.id, score: Math.floor(Math.random() * 4) + 1 };
    });

    const minScore = Math.min(...scores.map(s => s.score));
    const losers = scores.filter(s => s.score === minScore);
    return losers.map(l => l.id);
  }, [players, currentPlayerId]);
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      playSound('timesUp');
      onGameEnd(determineLosers(foundIndices.length));
    }
  }, [timeLeft, onGameEnd, determineLosers, foundIndices.length]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const imageNaturalWidth = 1200; // Original image width
    const imageNaturalHeight = 800; // Original image height

    const scaleX = imageNaturalWidth / rect.width;
    const scaleY = imageNaturalHeight / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    differences.forEach((diff, index) => {
      if (foundIndices.includes(index)) return;
      const distance = Math.hypot(clickX - diff.x, clickY - diff.y);
      if (distance < diff.radius) {
        playSound('correct');
        const newFound = [...foundIndices, index];
        setFoundIndices(newFound);
        if(newFound.length === differences.length) {
            onGameEnd(determineLosers(newFound.length));
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <GameTimer duration={GAME_DURATION + extraTime} timeLeft={timeLeft} />
        <h2 className="text-xl font-bold mb-2">
            Found: <span className="text-yellow-400">{foundIndices.length} / {differences.length}</span>
        </h2>
        <div className="grid grid-cols-2 gap-2 w-full max-w-3xl relative">
            <div ref={imageContainerRef} className="relative" onClick={handleImageClick}>
                <img src={imageA} alt="Spot the difference puzzle part 1" className="w-full h-auto rounded-lg" />
                {foundIndices.map(index => {
                    const diff = differences[index];
                    return <div key={`a-${index}`} className="absolute rounded-full border-4 border-red-500 animate-pop-in" style={{
                        left: `${(diff.x / 1200) * 100}%`,
                        top: `${(diff.y / 800) * 100}%`,
                        width: `${(diff.radius * 2 / 1200) * 100}%`,
                        height: `${(diff.radius * 2 / 800) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        paddingBottom: `${(diff.radius * 2 / 1200) * 100}%` // Maintain aspect ratio for height
                    }} />;
                })}
            </div>
            <div className="relative" onClick={handleImageClick}>
                <img src={imageB} alt="Spot the difference puzzle part 2" className="w-full h-auto rounded-lg" />
                 {foundIndices.map(index => {
                    const diff = differences[index];
                     return <div key={`b-${index}`} className="absolute rounded-full border-4 border-red-500 animate-pop-in" style={{
                        left: `${(diff.x / 1200) * 100}%`,
                        top: `${(diff.y / 800) * 100}%`,
                        width: `${(diff.radius * 2 / 1200) * 100}%`,
                        height: `${(diff.radius * 2 / 800) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        paddingBottom: `${(diff.radius * 2 / 1200) * 100}%`
                    }} />;
                })}
            </div>
        </div>
    </div>
  );
};

export default SpotTheDifferenceGame;