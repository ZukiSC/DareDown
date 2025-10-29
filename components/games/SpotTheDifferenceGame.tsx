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
  onGameEnd: (scores: Map<string, number>) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 30;

const SpotTheDifferenceGame: React.FC<SpotTheDifferenceGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const extraTimeApplied = useRef(false);
  
  const { imageA, imageB, differences } = challenge.content as { imageA: string; imageB: string; differences: Difference[] };
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const finalizeScores = useCallback((playerFoundCount: number) => {
    const scores = new Map<string, number>();
    players.forEach(p => {
        if (p.id === currentPlayerId) {
            scores.set(p.id, playerFoundCount);
        } else {
            // Bots find between 1 and 4 differences
            scores.set(p.id, Math.floor(Math.random() * 4) + 1);
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
            finalizeScores(foundIndices.length);
        }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isFinished, finalizeScores, foundIndices.length]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if(isFinished) return;
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
            setIsFinished(true);
            finalizeScores(newFound.length);
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