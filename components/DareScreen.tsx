import React, { useState } from 'react';
import { Player, Dare } from '../types';

interface DareScreenProps {
  loser: Player | null;
  dare: Dare | null;
  onStartLiveDare: () => void;
  currentPlayer: Player;
}

const DareScreen: React.FC<DareScreenProps> = ({ loser, dare, onStartLiveDare, currentPlayer }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!loser || !dare) {
    return <div>Loading dare...</div>;
  }

  const isLoser = loser.id === currentPlayer.id;

  const handleGoLiveClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmGoLive = async () => {
    try {
      // Check for camera/mic permissions before proceeding
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // We don't need to use the stream here, just request permission.
      // The stream will be properly handled in the LiveDareView component.
      stream.getTracks().forEach(track => track.stop());
      setShowConfirmation(false);
      onStartLiveDare();
    } catch (err) {
      console.error("Camera/Mic permission denied:", err);
      alert("You need to allow camera and microphone access to perform a live dare!");
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ background: 'radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.3), transparent 70%)' }}
        />
        <div className="z-10 flex flex-col items-center justify-around h-full w-full">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-4 animate-pulse">{loser.name}, you're up!</h1>
            <div className="bg-gray-900/70 p-4 sm:p-6 rounded-xl shadow-lg border border-red-500/50 max-w-2xl">
              <p className="text-md text-gray-400 mb-2">
                Your dare is...
              </p>
              <p className="text-xl md:text-3xl font-semibold text-yellow-300">{dare.text}</p>
            </div>
          </div>

          {isLoser ? (
            <div className="w-full max-w-md z-10">
              <button
                onClick={handleGoLiveClick}
                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-100 animate-pulse"
              >
                Go Live! 🔴
              </button>
              <p className="mt-2 text-sm text-gray-400">You will perform this dare live on camera.</p>
            </div>
          ) : (
            <p className="text-lg text-gray-300 z-10 animate-pulse">Waiting for {loser.name} to start...</p>
          )}
        </div>
      </div>

      {showConfirmation && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg text-center shadow-2xl border border-yellow-500/50">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Ready to Go Live?</h2>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              Your camera and microphone will be activated. Please be respectful and follow community guidelines.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowConfirmation(false)} className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transform transition-transform active:scale-95">
                Cancel
              </button>
              <button onClick={handleConfirmGoLive} className="py-2 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transform transition-transform active:scale-95">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DareScreen;