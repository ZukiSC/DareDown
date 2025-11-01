import React from 'react';

interface VoiceMuteButtonProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isConnected: boolean;
}

const VoiceMuteButton: React.FC<VoiceMuteButtonProps> = ({ isMuted, onToggleMute, isConnected }) => {
  if (!isConnected) {
    return (
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="flex items-center gap-2 bg-gray-900/80 p-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-yellow-400">Connecting Voice...</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onToggleMute}
      className={`fixed bottom-4 left-4 rounded-full p-3 shadow-lg z-30 transition-colors transform active:scale-95 ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`}
      aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
    >
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5l14 14" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
};

export default VoiceMuteButton;
