import React from 'react';
import { Player } from '../types';
import { STARS_PER_TIER, CURRENT_SEASON_REWARDS, TOTAL_TIERS } from '../services/darePassService';
import DarePassRewardNode from './DarePassRewardNode';

interface DarePassScreenProps {
  player: Player;
  onGoBack: () => void;
  onClaimReward: (challengeId: string) => void;
  onPurchasePremium: () => void;
}

const DarePassScreen: React.FC<DarePassScreenProps> = ({ player, onGoBack, onClaimReward, onPurchasePremium }) => {
  const { darePassTier, darePassStars, hasPremiumPass, darePassChallenges } = player;

  const starProgress = (darePassStars / STARS_PER_TIER) * 100;

  return (
    <div className="flex flex-col h-full w-full items-center p-2 sm:p-4 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-300 drop-shadow-lg">✨ Dare Pass: Season 1 ✨</h1>
        <p className="text-md text-gray-300">Complete challenges, earn stars, and unlock exclusive rewards!</p>
      </div>

      <div className="w-full max-w-4xl bg-gray-900/50 p-4 rounded-xl mb-4 border border-teal-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow w-full">
                 <div className="flex justify-between items-center text-sm font-semibold mb-1">
                    <span className="text-teal-300">Tier {darePassTier}</span>
                    <span className="text-gray-400">⭐ {darePassStars} / {STARS_PER_TIER}</span>
                </div>
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out animate-shimmer" style={{ width: `${starProgress}%` }} />
                </div>
            </div>
            {!hasPremiumPass && (
                <button onClick={onPurchasePremium} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-lg animate-glow">
                    Get Premium
                </button>
            )}
        </div>
      </div>
      
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-4 flex-grow overflow-hidden">
        {/* Challenges */}
        <div className="lg:w-1/3 flex-shrink-0 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-center mb-2">Challenges</h2>
            <div className="space-y-2 overflow-y-auto h-full max-h-40 lg:max-h-full pr-1">
                {darePassChallenges.map(c => {
                    const isComplete = c.progress >= c.goal;
                    return (
                        <div key={c.id} className="bg-gray-700/70 p-2 rounded-lg text-sm">
                            <p className="font-semibold">{c.description}</p>
                            <div className="flex justify-between items-center mt-1">
                                <div className="w-2/3 bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(c.progress / c.goal) * 100}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-300">{c.progress}/{c.goal}</span>
                            </div>
                             {isComplete && !c.isClaimed && (
                                <button onClick={() => onClaimReward(c.id)} className="w-full mt-2 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs">
                                    Claim ⭐ {c.stars}
                                </button>
                            )}
                             {c.isClaimed && (
                                <p className="text-center mt-2 text-xs text-green-400 font-semibold">Claimed ✔️</p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Reward Track */}
        <div className="flex-grow bg-gray-900/50 p-3 rounded-lg border border-gray-700 overflow-hidden">
            <h2 className="text-xl font-bold text-center mb-2">Reward Track</h2>
            <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
                <div className="inline-flex items-start gap-2 h-full">
                    {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map(tier => {
                        const freeReward = CURRENT_SEASON_REWARDS.find(r => r.tier === tier && !r.isPremium);
                        const premiumReward = CURRENT_SEASON_REWARDS.find(r => r.tier === tier && r.isPremium);
                        const isCurrentTier = tier === darePassTier;

                        return (
                            <div key={tier} className={`relative flex flex-col items-center justify-between h-full p-2 rounded-lg w-28 flex-shrink-0
                                ${isCurrentTier ? 'bg-teal-500/20 border-2 border-teal-400' : 'bg-gray-800/60 border-2 border-gray-700'}`}>
                                <span className={`absolute -top-3 bg-gray-900 px-2 rounded-full text-xs font-bold ${isCurrentTier ? 'text-teal-300' : 'text-gray-400'}`}>
                                    Tier {tier}
                                </span>
                                
                                <div className="w-full h-full flex flex-col justify-around items-center pt-2">
                                  <DarePassRewardNode reward={freeReward} player={player} />
                                  <div className="w-full h-px bg-gray-600 my-1"></div>
                                  <DarePassRewardNode reward={premiumReward} player={player} isPremiumTrack={true} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DarePassScreen;
