import React, { useState } from 'react';
import { Dare, Player } from '../types';

interface DareProofScreenProps {
  dare: Dare | null;
  loser: Player | null;
  onVote: (passed: boolean) => void;
  currentPlayerId: string;
}

const DareProofScreen: React.FC<DareProofScreenProps> = ({ dare, loser, onVote, currentPlayerId }) => {
  const [hasVoted, setHasVoted] = useState(false);

  if (!dare || !loser) {
    return <div>Loading proof...</div>;
  }
  
  const isLoser = loser.id === currentPlayerId;

  const handleVote = (passed: boolean) => {
    setHasVoted(true);
    // In a real game, this would emit an event. Here, we simulate the outcome after a delay.
    setTimeout(() => onVote(passed), 2000);
  }

  if (hasVoted) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-purple-400 mb-4">Vote Cast!</h1>
            <p className="text-xl text-gray-300">Waiting for other players to vote...</p>
        </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-2xl md:text-4xl font-bold text-yellow-400 mb-2">
        Did {loser.name} complete the dare?
      </h1>
      <p className="text-md text-gray-400 mb-4">"{dare.text}"</p>
      
      <div className="my-4 p-2 bg-black/30 rounded-lg">
        {dare.proof ? (
            <img src={dare.proof} alt="Dare proof" className="max-h-64 mx-auto rounded-lg shadow-lg" />
        ) : (
            <p className="text-gray-500">No proof was submitted.</p>
        )}
      </div>

      {isLoser ? (
          <p className="text-xl text-gray-300">Waiting for the votes...</p>
      ) : (
        <div className="flex gap-4">
            <button
                onClick={() => handleVote(true)}
                className="py-3 px-8 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg"
            >
                👍 Pass
            </button>
            <button
                onClick={() => handleVote(false)}
                className="py-3 px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-lg shadow-lg"
            >
                👎 Fail
            </button>
        </div>
      )}
    </div>
  );
};

export default DareProofScreen;