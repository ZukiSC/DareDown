import React from 'react';

const CONFETTI_COUNT = 100;
const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

const Confetti: React.FC = () => {
  const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      animation: `confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
      width: `${Math.random() * 8 + 4}px`,
      height: `${Math.random() * 10 + 6}px`,
    };
    return <div key={i} className="absolute top-0 rounded-sm" style={style} />;
  });

  return <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-50">{confetti}</div>;
};

export default Confetti;
