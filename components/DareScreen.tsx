import React, { useState, useRef } from 'react';
import { Player, Dare, PowerUpType } from '../types';
import PlayerAvatar from './PlayerAvatar';

interface DareScreenProps {
  loser: Player | null;
  dare: Dare | null;
  players: Player[];
  onProofSubmit: (proofDataUrl: string) => void;
  reactions: { playerId: string, emoji: string }[];
  onUsePowerUp: (powerUpId: PowerUpType) => void;
  currentPlayer: Player;
}

const DareScreen: React.FC<DareScreenProps> = ({ loser, dare, players, onProofSubmit, reactions, onUsePowerUp, currentPlayer }) => {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!loser || !dare) {
    return <div>Loading dare...</div>;
  }

  const isLoser = loser.id === currentPlayer.id;
  const hasSkipDare = currentPlayer.powerUps.includes('SKIP_DARE');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File is too large! Please choose an image under 2MB.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (proofImage) {
      onProofSubmit(proofImage);
    } else {
      setError('Please upload an image as proof!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-around h-full text-center p-4 relative overflow-hidden">
       <div 
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.3), transparent 70%)' }}
       />
      <div className="z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-4 animate-pulse">{loser.name}, you're up!</h1>
        <div className="bg-gray-900/70 p-8 rounded-xl shadow-lg border border-red-500/50 max-w-2xl">
          <p className="text-lg text-gray-400 mb-4">
            Your AI-Generated dare is...
          </p>
          <p className="text-2xl md:text-4xl font-semibold text-yellow-300">{dare.text}</p>
        </div>
      </div>

       <div className="flex justify-center gap-4 mt-4 z-10">
        {players.map(p => {
            const reaction = reactions.find(r => r.playerId === p.id)?.emoji;
            return <PlayerAvatar key={p.id} player={p} isCurrentPlayer={false} reaction={reaction} />
        })}
      </div>

      {isLoser ? (
         <div className="w-full max-w-md z-10">
            {proofImage ? (
                <div className="mb-4">
                    <img src={proofImage} alt="Proof preview" className="max-h-40 mx-auto rounded-lg shadow-lg" />
                    <button onClick={() => { setProofImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-400 mt-2">Clear</button>
                </div>
            ) : (
                <p className="mb-2 text-gray-300">Submit an image as proof of completion:</p>
            )}
            <input 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="proof-upload"
            />
            <label htmlFor="proof-upload" className="w-full cursor-pointer inline-block p-3 bg-gray-700 border border-gray-600 rounded-lg mb-2 text-white hover:bg-gray-600">
                {proofImage ? 'Change Image' : 'Select Image'}
            </label>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!proofImage}
              className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
            Submit Proof!
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
        <p className="text-xl text-gray-300 z-10">Waiting for {loser.name} to complete their dare...</p>
      )}
    </div>
  );
};

export default DareScreen;
