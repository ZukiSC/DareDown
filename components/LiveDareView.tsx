import React, { useState, useEffect, useRef } from 'react';
import { Player, Dare } from '../types';
import { rtcService } from '../services/rtcService';

interface LiveDareViewProps {
  dare: Dare | null;
  loser: Player | null;
  onVote: (passed: boolean) => void;
  currentPlayer: Player;
  reactions: { id: string, emoji: string }[];
}

const LiveDareView: React.FC<LiveDareViewProps> = ({ dare, loser, onVote, currentPlayer, reactions }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoser = loser?.id === currentPlayer.id;

  useEffect(() => {
    const setupStream = async () => {
      try {
        if (isLoser) {
          const localStream = await rtcService.startStream();
          setStream(localStream);
          setIsStreaming(true);
        } else {
          // Viewers will get the stream from the loser
          const remoteStream = await rtcService.viewStream();
          setStream(remoteStream);
        }
      } catch (err) {
        console.error("Error setting up stream:", err);
        setError("Could not access camera or microphone. Please check permissions and try again.");
      }
    };

    setupStream();

    return () => {
      rtcService.closeConnection();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoser]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleVote = (passed: boolean) => {
    if (hasVoted) return;
    setHasVoted(true);
    // In a real game, this vote would be sent to the server.
    // The server would determine when the vote is over.
    // Here, we simulate an immediate outcome for demo purposes.
    setTimeout(() => onVote(passed), 2000);
  };
  
  const handleEndStream = () => {
      setIsStreaming(false);
      // Simulate loser failing the dare by ending early
      onVote(false);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
        <h2 className="text-2xl font-bold">Streaming Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!stream && !isLoser) {
      return (
           <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold animate-pulse">Connecting to stream...</h2>
           </div>
      )
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <video ref={videoRef} autoPlay playsInline muted={isLoser} className={`w-full h-full object-cover ${isLoser ? 'transform scale-x-[-1]' : ''}`}></video>

      {/* Floating Reactions */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {reactions.map(reaction => (
          <div key={reaction.id} className="absolute bottom-4 animate-float-up" style={{ left: `${Math.random() * 80 + 10}%` }}>
            <span className="text-4xl">{reaction.emoji}</span>
          </div>
        ))}
      </div>

      {/* Top Overlay: Dare Info */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-center">
        <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-red-500">LIVE</span>
        </div>
        <p className="text-lg md:text-xl font-semibold text-white mt-1">"{dare?.text}"</p>
      </div>
      
      {/* Bottom Overlay: Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        {isLoser ? (
          <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleEndStream}
                className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg"
            >
              End Stream
            </button>
            <p className="text-sm text-gray-300">You are live!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-2">Did {loser?.name} do it?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleVote(true)}
                disabled={hasVoted}
                className="py-3 px-8 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg disabled:bg-gray-600 disabled:opacity-70"
              >
                👍 Pass
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={hasVoted}
                className="py-3 px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-lg shadow-lg disabled:bg-gray-600 disabled:opacity-70"
              >
                👎 Fail
              </button>
            </div>
             {hasVoted && <p className="mt-2 text-sm text-yellow-400">Vote cast! Waiting for others...</p>}
          </div>
        )}
         {/* Placeholder for safety/extra features */}
         <div className="absolute bottom-2 right-2 flex gap-2">
             <button title="Report Stream (Placeholder)" className="text-xs p-1 bg-gray-700/50 rounded hover:bg-gray-600">Report</button>
             <button title="Toggle Background Blur (Placeholder)" className="text-xs p-1 bg-gray-700/50 rounded hover:bg-gray-600">Blur BG</button>
         </div>
      </div>
    </div>
  );
};

export default LiveDareView;