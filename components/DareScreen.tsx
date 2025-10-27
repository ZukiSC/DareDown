import React, { useState } from 'react';
import { Player, Dare, PowerUpType } from '../types';
import PlayerAvatar from './PlayerAvatar';

interface DareScreenProps {
  loser: Player | null;
  dare: Dare | null;
  players: Player[];
  onComplete: (proof: string) => void;
  reactions: { playerId: string, emoji: string }[];
  onUsePowerUp: (powerUpId: PowerUpType) => void;
  currentPlayer: Player;
}

const DareScreen: React.FC<DareScreenProps> = ({ loser, dare, players, onComplete, reactions, onUsePowerUp, currentPlayer }) => {
  const [proof, setProof] = useState('');

  if (!loser || !dare) {
    return <div>Loading dare...</div>;
  }

  const submitter = players.find(p => p.id === dare.submitterId);
  const isLoser = loser.id === currentPlayer.id;
  const hasSkipDare = currentPlayer.powerUps.includes('SKIP_DARE');

  return (
    <div className="flex flex-col items-center justify-around h-full text-center p-4">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-4">{loser.name}, you're up!</h1>
        <div className="bg-gray-900/70 p-8 rounded-xl shadow-lg border border-red-500/50 max-w-2xl">
          <p className="text-lg text-gray-400 mb-4">
            Your dare is... (from {submitter?.name || 'Anonymous'})
          </p>
          <p className="text-2xl md:text-4xl font-semibold text-yellow-300">{dare.text}</p>
        </div>
      </div>

       <div className="flex justify-center gap-4 mt-4">
        {players.map(p => {
            const reaction = reactions.find(r => r.playerId === p.id)?.emoji;
            return <PlayerAvatar key={p.id} player={p} isCurrentPlayer={false} reaction={reaction} />
        })}
      </div>

      {isLoser ? (
         <div className="w-full max-w-md">
            <p className="mb-2 text-gray-300">Submit proof of completion (text or image link):</p>
            <input 
            type="text"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="I did it! / https://image.link"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
            onClick={() => onComplete(proof || "Completed!")}
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
            Dare Completed!
            </button>
            {hasSkipDare && (
                <button
                    onClick={() => onUsePowerUp('SKIP_DARE')}
                    className="w-full mt-2 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-md rounded-lg shadow-lg"
                >
                    Use Power-Up: Skip Dare 🏃‍♂️
                </button>
            )}
        </div>
      ) : (
        <p className="text-xl text-gray-300">Waiting for {loser.name} to complete their dare...</p>
      )}

    </div>
  );
};

export default DareScreen;
