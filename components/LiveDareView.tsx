
import React, { useState, useEffect, useRef } from 'react';
import { Player, Dare, FloatingGreeting } from '../types';
import { rtcService } from '../services/rtcService';
import { useUIStore } from '../stores/UIStore';

interface LiveDareViewProps {
  dare: Dare | null;
  loser: Player | null;
  onStreamEnd: (replayUrl?: string) => void;
  currentPlayer: Player;
  greetings: FloatingGreeting[];
  onSendGreeting: (content: string) => void;
}

const GreetingSender: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [customGreeting, setCustomGreeting] = useState('');
  const presets = ["You Got This! 💪", "OMG 😂", "Good Luck! 🍀"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGreeting.trim()) {
      onSend(customGreeting.trim());
      setCustomGreeting('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {presets.map(p => (
          <button key={p} onClick={() => onSend(p)} className="px-3 py-1.5 bg-gray-700/80 hover:bg-gray-600/80 text-white text-sm font-semibold rounded-full transform transition-transform active:scale-95">
            {p}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input 
          type="text"
          value={customGreeting}
          onChange={e => setCustomGreeting(e.target.value)}
          placeholder="Send a custom greeting..."
          maxLength={40}
          className="flex-grow bg-gray-900/70 border border-gray-600 rounded-full px-4 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-full transform transition-transform active:scale-95">
          Send
        </button>
      </form>
    </div>
  );
};

const LiveDareView: React.FC<LiveDareViewProps> = ({ dare, loser, onStreamEnd, currentPlayer, greetings, onSendGreeting }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeReactions } = useUIStore();

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
  
  // Automatically end the stream after a duration
  useEffect(() => {
    if(!isStreaming && !isLoser) return; // Only streamer's timer matters

    const timer = setTimeout(() => {
        handleEndStream();
    }, 15000); // 15 second dare

    return () => clearTimeout(timer);
  }, [isStreaming, isLoser]);


  const handleEndStream = () => {
      if (!isStreaming && !isLoser) return; // Prevent viewers from ending stream
      setIsStreaming(false);
      onStreamEnd(`mock-replay-${dare?.id}.mp4`);
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

      {/* Floating Reactions & Greetings */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {activeReactions.map(reaction => (
          <div key={reaction.id} className="absolute bottom-4 animate-float-up" style={{ left: `${Math.random() * 80 + 10}%`, animationDuration: '3s' }}>
            <span className="text-5xl drop-shadow-lg">{reaction.emoji}</span>
          </div>
        ))}
        {greetings.map(greeting => (
          <div key={greeting.id} className="absolute bottom-4 animate-float-up" style={{ left: `${Math.random() * 70 + 15}%`, animationDuration: '4s' }}>
            <div className={`greeting-bubble border-2 ${greeting.fromColorClass}`}>
              <span className="text-xs text-gray-300 block" style={{opacity: 0.8}}>{greeting.fromName} says:</span>
              <span className="text-lg">{greeting.content}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Overlay: Dare Info */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-center">
        <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-red-500">LIVE</span>
        </div>
        <p className="text-lg md:text-xl font-semibold text-white mt-1 drop-shadow-md">"{dare?.text}"</p>
      </div>
      
      {/* Bottom Overlay: Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {isLoser ? (
          <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleEndStream}
                className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95"
            >
              End Stream
            </button>
            <p className="text-sm text-gray-300">You are live!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-white font-semibold animate-pulse">Watching {loser?.name}...</p>
              <GreetingSender onSend={onSendGreeting} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDareView;