import React from 'react';

interface GameTimerProps {
    duration: number;
    timeLeft: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ duration, timeLeft }) => {
    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;
    let bgColor = 'bg-green-500';
    if (progress < 50) bgColor = 'bg-yellow-500';
    if (progress < 25) bgColor = 'bg-red-500';

    return (
        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-700/50 rounded-t-lg overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ease-linear ${bgColor}`}
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

export default GameTimer;
