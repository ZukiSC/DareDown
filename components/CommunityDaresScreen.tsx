import React, { useState, useMemo } from 'react';
// FIX: Import missing DarePack type.
import { DarePack } from '../types';
import CreateDarePackModal from './CreateDarePackModal';

interface CommunityDaresScreenProps {
  packs: DarePack[];
  subscribedIds: string[];
  votedIds: string[];
  currentPlayerId: string;
  onSubscribe: (packId: string) => void;
  onVote: (packId: string) => void;
  onCreate: (packData: Omit<DarePack, 'id' | 'votes' | 'creatorId' | 'creatorName'>) => void;
  onGoBack: () => void;
}

type ActiveTab = 'browse' | 'my-packs' | 'subscribed';

const CommunityDaresScreen: React.FC<CommunityDaresScreenProps> = ({
  packs, subscribedIds, votedIds, currentPlayerId, onSubscribe, onVote, onCreate, onGoBack,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const sortedPacks = useMemo(() => [...packs].sort((a, b) => b.votes - a.votes), [packs]);
  const myPacks = useMemo(() => packs.filter(p => p.creatorId === currentPlayerId), [packs, currentPlayerId]);
  const subscribedPacks = useMemo(() => packs.filter(p => subscribedIds.includes(p.id)), [packs, subscribedIds]);

  const renderPacks = (packList: DarePack[]) => {
    if (packList.length === 0) {
        return (
            <div className="text-center text-gray-400 mt-12">
                <p className="text-5xl mb-4">🗃️</p>
                <p className="text-xl">No packs here yet!</p>
            </div>
        )
    }

    return (
        packList.map((pack, index) => {
            const hasVoted = votedIds.includes(pack.id);
            const isSubscribed = subscribedIds.includes(pack.id);
            return (
                <div
                    key={pack.id}
                    className="bg-gray-700/60 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-in-up opacity-0"
                    style={{ animationDelay: `${100 + index * 75}ms`}}
                >
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                             {pack.isOfficial && <span className="text-xs font-bold bg-purple-500 px-2 py-0.5 rounded-full">Official</span>}
                            <h3 className="text-xl font-bold">{pack.name}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">by {pack.creatorName}</p>
                        <p className="text-sm text-gray-300">{pack.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{pack.dares.length} dares</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
                        <button
                            onClick={() => onVote(pack.id)}
                            disabled={hasVoted}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg shadow-md transition-all transform active:scale-95 ${hasVoted ? 'bg-purple-800 text-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
                        >
                            <span>👍</span>
                            <span>{pack.votes}</span>
                        </button>
                         <button
                            onClick={() => onSubscribe(pack.id)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-md transition-colors w-full ${isSubscribed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                    </div>
                </div>
            )
        })
    );
  }

  const renderContent = () => {
      switch (activeTab) {
          case 'my-packs': return renderPacks(myPacks);
          case 'subscribed': return renderPacks(subscribedPacks);
          case 'browse':
          default:
              return renderPacks(sortedPacks);
      }
  }

  return (
    <>
    <div className="flex flex-col h-full w-full items-center p-2 sm:p-4 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-400 drop-shadow-lg">Community Dares</h1>
        <p className="text-md text-gray-300">Create, share, and subscribe to custom dare packs!</p>
      </div>

      <div className="w-full max-w-2xl flex border-b border-gray-700 mb-4">
          <button onClick={() => setActiveTab('browse')} className={`flex-1 py-2 font-semibold transition-base ${activeTab === 'browse' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>Browse</button>
          <button onClick={() => setActiveTab('subscribed')} className={`flex-1 py-2 font-semibold transition-base ${activeTab === 'subscribed' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>Subscribed</button>
          <button onClick={() => setActiveTab('my-packs')} className={`flex-1 py-2 font-semibold transition-base ${activeTab === 'my-packs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>My Packs</button>
      </div>
      
      {activeTab === 'my-packs' && (
          <div className="w-full max-w-2xl mb-4">
              <button onClick={() => setIsCreateModalOpen(true)} className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg">
                  + Create New Dare Pack
              </button>
          </div>
      )}

      <div className="flex-grow w-full max-w-2xl overflow-y-auto pr-2 space-y-3">
        <div key={activeTab} className="animate-fade-in-fast">
            {renderContent()}
        </div>
      </div>
    </div>
    {isCreateModalOpen && (
        <CreateDarePackModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={onCreate}
        />
    )}
    </>
  );
};

export default CommunityDaresScreen;
