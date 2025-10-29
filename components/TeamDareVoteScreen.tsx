import React from 'react';
import { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';

interface TeamDareVoteScreenProps {
  players: Player[];
  currentPlayer: Player;
  losingTeamId: 'blue' | 'orange' | null;
  teamVotes: { [voterId: string]: string };
  onVote: (targetId: string) => void;
}

const TeamDareVoteScreen: React.FC<TeamDareVoteScreenProps> = ({ players, currentPlayer, losingTeamId, teamVotes, onVote }) => {
  if (!losingTeamId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold">Calculating results...</h1>
      </div>
    );
  }

  const losingTeamName = losingTeamId === 'blue' ? 'Team Blue' : 'Team Orange';
  const losingTeamColor = losingTeamId === 'blue' ? 'text-blue-400' : 'text-orange-400';
  const losingTeamPlayers = players.filter(p => p.teamId === losingTeamId);
  const isLoser = currentPlayer.teamId === losingTeamId;
  const hasVoted = !!teamVotes[currentPlayer.id];
  const allVotesIn = losingTeamPlayers.length === Object.keys(teamVotes).length;

  const getVoteCount = (playerId: string) => {
      return Object.values(teamVotes).filter(votedId => votedId === playerId).length;
  }
  
  const renderContent = () => {
      if (allVotesIn) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-4xl font-bold text-purple-400 mb-4">Votes are in!</h1>
                <p className="text-xl text-gray-300">Determining the loser...</p>
            </div>
        )
      }

      if (isLoser) {
          if (hasVoted) {
              return (
                <>
                    <h2 className="text-2xl font-semibold mb-6">You have voted! Waiting for your teammates...</h2>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {losingTeamPlayers.map(p => <PlayerAvatar key={p.id} player={p} isCurrentPlayer={false}/>)}
                    </div>
                </>
              );
          }
          return (
             <>
                <h2 className="text-2xl font-semibold mb-6">Your team lost! Vote for one teammate to take the dare.</h2>
                <div className="flex justify-center gap-4 flex-wrap">
                    {losingTeamPlayers.map(p => (
                        <button key={p.id} onClick={() => onVote(p.id)} className="transform transition-transform hover:scale-105">
                            <PlayerAvatar player={p} isCurrentPlayer={p.id === currentPlayer.id} />
                        </button>
                    ))}
                </div>
            </>
          );
      }
      
      // Winning team's view
      return (
         <>
            <h2 className="text-2xl font-semibold mb-6">The losing team is choosing their scapegoat... 😈</h2>
            <div className="flex justify-center gap-4 flex-wrap opacity-70">
                {losingTeamPlayers.map(p => <PlayerAvatar key={p.id} player={p} isCurrentPlayer={false}/>)}
            </div>
         </>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className={`text-4xl md:text-5xl font-bold mb-4 animate-pulse ${losingTeamColor}`}>
        {losingTeamName} LOST THE ROUND!
      </h1>
      {renderContent()}
    </div>
  );
};

export default TeamDareVoteScreen;