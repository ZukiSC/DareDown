import React, { useState } from 'react';

interface JoinLobbyScreenProps {
  onJoin: (code: string) => void;
  onGoBack: () => void;
}

const JoinLobbyScreen: React.FC<JoinLobbyScreenProps> = ({ onJoin, onGoBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (newCode.length <= 6) {
      setCode(newCode);
    }
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onJoin(code);
    } else {
      setError('Code must be 6 characters long.');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-4 relative animate-fade-in">
       <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-400 drop-shadow-lg mb-4">Join a Lobby</h1>
        <p className="text-lg text-gray-300 mb-8">Enter the 6-character code from your friend.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="XXXXXX"
            className="w-full p-4 text-center bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
           {error && (
            <p className="text-red-500 text-sm mt-2 animate-shake" role="alert">
                {error}
            </p>
        )}
          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full mt-6 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinLobbyScreen;