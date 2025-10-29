import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Challenge } from '../../types';
import { playSound } from '../../services/audioService';
import GameTimer from './GameTimer';

interface DoodleDownGameProps {
  onGameEnd: (loserIds: string[]) => void;
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  extraTime: number;
}

const GAME_DURATION = 20;
const COLORS = ['#FFFFFF', '#EF4444', '#3B82F6', '#22C55E', '#FBBF24', '#000000'];

const DoodleDownGame: React.FC<DoodleDownGameProps> = ({ onGameEnd, players, currentPlayerId, challenge, extraTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const extraTimeApplied = useRef(false);
  const pixelChangeCount = useRef(0);

  useEffect(() => {
    if (extraTime > 0 && !extraTimeApplied.current) {
      setTimeLeft(prev => prev + extraTime);
      extraTimeApplied.current = true;
    }
  }, [extraTime]);

  const getCanvasContext = useCallback(() => {
     return canvasRef.current?.getContext('2d');
  }, []);

  const getRelativeCoords = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const draw = useCallback((x0: number, y0: number, x1: number, y1: number, drawColor: string) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
    pixelChangeCount.current += Math.hypot(x1 - x0, y1 - y0); // Approximation
  }, [getCanvasContext]);

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getRelativeCoords(event.nativeEvent);
    const ctx = getCanvasContext();
    if (ctx) {
        ctx.moveTo(x, y);
    }
    setIsDrawing(true);
  }, [getCanvasContext]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const ctx = getCanvasContext();
     if (ctx) {
        ctx.beginPath();
    }
  }, [getCanvasContext]);
  
  const handleDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const { x, y } = getRelativeCoords(event.nativeEvent);
      const ctx = getCanvasContext();
      if(ctx) {
         draw(ctx.canvas.width / 2, ctx.canvas.height / 2, x, y, color);
         ctx.moveTo(x,y); // This seems to be missing in many tutorials but is important
      }
  }, [isDrawing, draw, color, getCanvasContext]);

  const handleMouseMove = (event: React.MouseEvent) => handleDrawing(event);
  const handleTouchMove = (event: React.TouchEvent) => handleDrawing(event);

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        pixelChangeCount.current = 0;
    }
  };
  
  const determineLosers = useCallback((playerDrawScore: number) => {
    const scores = players.map(p => {
        if (p.id === currentPlayerId) {
            return { id: p.id, score: playerDrawScore };
        }
        // Bots have a score between 1000 and 15000
        return { id: p.id, score: Math.random() * 14000 + 1000 };
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
      onGameEnd(determineLosers(pixelChangeCount.current));
    }
  }, [timeLeft, onGameEnd, determineLosers]);

  return (
    <div className="flex flex-col items-center justify-between h-full text-center">
        <GameTimer duration={GAME_DURATION + extraTime} timeLeft={timeLeft} />
        <h2 className="text-xl md:text-3xl font-semibold mb-2">
            Your word is: <span className="text-yellow-400">{challenge.content.word}</span>
        </h2>
        <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="bg-gray-900 rounded-lg cursor-crosshair touch-none w-full max-w-lg aspect-[5/3]"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={handleMouseMove}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={handleTouchMove}
        />
        <div className="flex items-center gap-2 sm:gap-4 mt-2">
            <div className="flex gap-1 sm:gap-2 bg-gray-900 p-1 rounded-full">
                {COLORS.map(c => (
                    <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-transform transform ${c === color ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Color ${c}`}
                    />
                ))}
            </div>
            <button onClick={clearCanvas} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm sm:text-base">Clear</button>
        </div>
    </div>
  );
};

export default DoodleDownGame;