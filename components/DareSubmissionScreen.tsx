
import React, { useState } from 'react';
import { Player } from '../types';

interface DareSubmissionScreenProps {
  loser: Player | null;
  currentPlayer: Player;
  players: Player[];
  onSubmit: (dareText: string) => void;
}

const MIN_DARE_LENGTH = 10;
const MAX_DARE_LENGTH = 100;

const DareSubmissionScreen: React.FC<DareSubmissionScreenProps> = ({ loser, currentPlayer, players, onSubmit }) => {
  const [dareText, setDareText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const isLoser = currentPlayer.id === loser?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDare = dareText.trim();
    if (trimmedDare.length === 0) {
      setError('Dare cannot be empty.');
      return;
    }
    if (trimmedDare.length < MIN_DARE_LENGTH) {
      setError(`Dare must be at least ${MIN_DARE_LENGTH} characters long.`);
      return;
    }
    // The maxLength attribute on the input already prevents this, but it's good practice for validation.
    if (trimmedDare.length > MAX_DARE_LENGTH) {
      setError(`Dare must not exceed ${MAX_DARE_LENGTH} characters.`);
      return;
    }

    setError('');
    onSubmit(trimmedDare);
    setIsSubmitted(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDareText(e.target.value);
      if (error) {
          setError('');
      }
  }

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
        <div className="relative w-full">
            <input
              type="text"
              value={dareText}
              onChange={handleInputChange}
              placeholder="e.g., Sing the alphabet backwards"
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'}`}
              maxLength={MAX_DARE_LENGTH}
              aria-invalid={!!error}
              aria-describedby="dare-error"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                {dareText.length}/{MAX_DARE_LENGTH}
            </span>
        </div>

        {error && (
            <p id="dare-error" className="text-red-500 text-sm mt-2 animate-shake" role="alert">
                {error}
            </p>
        )}
        
        <button
          type="submit"
          disabled={!dareText.trim()}
          className="w-full mt-4 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Submit Dare
        </button>
      </form>
      
    </div>
  );
};

export default DareSubmissionScreen;
