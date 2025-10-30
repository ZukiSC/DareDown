import React, { useMemo } from 'react';
import { HallOfFameEntry } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface HallOfFameScreenProps {
  entries: HallOfFameEntry[];
  onVote: (dareId: string) => void;
  votedIds: string[];
  onViewReplay: (dareId: string) => void;
  onGoBack: () => void;
}

const HallOfFameScreen: React.FC<HallOfFameScreenProps> = ({ entries, onVote, votedIds, onViewReplay, onGoBack }) => {

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => b.votes - a.votes);
  }, [entries]);

  return (
    <div className="flex flex-col h-full w-full items-center p-2 sm:p-4 relative">
       <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow-lg">🏆 Dare Hall of Fame 🏆</h1>
        <p className="text-md text-gray-300">The best and bravest dares from the community!</p>
      </div>

      <div className="flex-grow w-full max-w-2xl overflow-y-auto pr-2 space-y-3">
        {sortedEntries.map((entry, index) => {
          const avatar = getAvatarById(entry.assignee.customization.avatarId);
          const color = getColorById(entry.assignee.customization.colorId);
          const hasVoted = votedIds.includes(entry.dare.id);

          return (
            <div 
              key={entry.dare.id}
              className="bg-gray-700/60 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-in-up opacity-0"
              style={{ animationDelay: `${100 + index * 75}ms`}}
            >
              <div className="flex-grow w-full">
                <div className="flex items-center gap-3 mb-2">
                   <div className={`flex-shrink-0 w-12 h-12 rounded-full ${color?.primaryClass} flex items-center justify-center text-3xl border-2 ${color?.secondaryClass}`}>
                    {avatar?.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{entry.assignee.name}</p>
                    <p className="text-xs text-gray-400">Performed the dare</p>
                  </div>
                </div>
                 <p className="italic text-gray-200">"{entry.dare.text}"</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto flex-shrink-0">
                <button 
                  onClick={() => onVote(entry.dare.id)}
                  disabled={hasVoted}
                  className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow-md transition-all transform active:scale-95 ${hasVoted ? 'bg-purple-800 text-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
                >
                  <span>👍</span>
                  <span>{entry.votes}</span>
                </button>
                <button
                  onClick={() => onViewReplay(entry.dare.id)}
                  className="px-4 py-2 font-bold rounded-lg shadow-md bg-green-500 hover:bg-green-600 transition-all transform active:scale-95"
                >
                  Replay ▶️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HallOfFameScreen;