import React from 'react';

interface MainMenuScreenProps {
  onCreateLobby: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onCreateLobby }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-4 animate-fade-in">
      <h1 className="text-6xl md:text-8xl font-bold text-purple-400 drop-shadow-lg mb-4">
        DareDown
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-12">The ultimate party game of dares and challenges.</p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onCreateLobby}
          className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100"
        >
          Create Lobby
        </button>
        <button
          disabled
          className="py-3 px-6 bg-gray-600 text-gray-400 font-bold text-xl rounded-lg shadow-lg cursor-not-allowed"
        >
          Join Lobby
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;