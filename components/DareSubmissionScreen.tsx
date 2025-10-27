
import React, { useState } from 'react';
import { Player } from '../types';

interface DareSubmissionScreenProps {
  loser: Player | null;
  currentPlayer: Player;
  players: Player[];
  onSubmit: (dareText: string) => void;
}

const DareSubmissionScreen: React.FC<DareSubmissionScreenProps> = ({ loser, currentPlayer, players, onSubmit }) => {
  const [dareText, setDareText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isLoser = currentPlayer.id === loser?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dareText.trim()) {
      onSubmit(dareText.trim());
      setIsSubmitted(true);
    }
  };

  if (isLoser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-4 animate-pulse">You are the loser!</h1>
        <p className="text-xl text-gray-300">The other players are deciding your fate...</p>
        <div className="mt-8 text-6xl">😈</div>
      </div>
    );
  }

  if (isSubmitted) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-purple-400 mb-4">Dare Submitted!</h1>
            <p className="text-xl text-gray-300">Waiting for other players to submit their dares...</p>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2">
        {loser?.name} is the loser!
      </h1>
      <p className="text-xl text-gray-300 mb-8">What should their dare be?</p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={dareText}
          onChange={(e) => setDareText(e.target.value)}
          placeholder="e.g., Sing the alphabet backwards"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={100}
        />
        <button
          type="submit"
          disabled={!dareText.trim()}
          className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Submit Dare
        </button>
      </form>
      
    </div>
  );
};

export default DareSubmissionScreen;