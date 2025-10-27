import React, { useState, useMemo } from 'react';
import { Player, FriendRequest } from '../types';
import { getAvatarById, getColorById } from '../services/customizationService';

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  allPlayers: Player[];
  onSendRequest: (targetId: string) => void;
  onAcceptRequest: (fromId: string) => void;
  onDeclineRequest: (fromId: string) => void;
  onViewProfile: (playerId: string) => void;
  onOpenChat: (friendId: string) => void;
}

type ActiveTab = 'friends' | 'requests' | 'add';

const FriendsPanel: React.FC<FriendsPanelProps> = ({ isOpen, onClose, currentPlayer, allPlayers, onSendRequest, onAcceptRequest, onDeclineRequest, onViewProfile, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('friends');
  const [searchTerm, setSearchTerm] = useState('');

  const friends = useMemo(() => {
    return allPlayers.filter(p => currentPlayer.friends.includes(p.id));
  }, [allPlayers, currentPlayer.friends]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allPlayers.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      p.id !== currentPlayer.id &&
      !currentPlayer.friends.includes(p.id)
    );
  }, [searchTerm, allPlayers, currentPlayer]);
  
  const FriendRow: React.FC<{player: Player}> = ({ player }) => (
     <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 rounded-full ${getColorById(player.customization.colorId)?.primaryClass} flex items-center justify-center text-2xl`}>
                {getAvatarById(player.customization.avatarId)?.emoji}
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${player.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></span>
            </div>
            <span className="font-semibold">{player.name}</span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { onOpenChat(player.id); onClose(); }} className="p-2 text-xl rounded-full bg-blue-500/50 hover:bg-blue-500/80 transform transition-transform active:scale-95" title="Chat">💬</button>
            <button onClick={() => onViewProfile(player.id)} className="p-2 text-xl rounded-full bg-purple-500/50 hover:bg-purple-500/80 transform transition-transform active:scale-95" title="View Profile">👤</button>
        </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-md h-[90vh] bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col p-4 animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-purple-400">Social</h2>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-white">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button onClick={() => setActiveTab('friends')} className={`flex-1 py-2 font-semibold transition-base transform active:scale-95 ${activeTab === 'friends' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 border-b-2 border-transparent'}`}>
            Friends ({friends.length})
          </button>
          <button onClick={() => setActiveTab('requests')} className={`relative flex-1 py-2 font-semibold transition-base transform active:scale-95 ${activeTab === 'requests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 border-b-2 border-transparent'}`}>
            Requests 
            {currentPlayer.friendRequests.length > 0 && <span className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{currentPlayer.friendRequests.length}</span>}
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2 font-semibold transition-base transform active:scale-95 ${activeTab === 'add' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 border-b-2 border-transparent'}`}>
            Add Friend
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto pr-2">
            <div key={activeTab} className="animate-fade-in-fast">
              {activeTab === 'friends' && (
                <div className="space-y-2">
                  {friends.length > 0 ? friends.map(friend => <FriendRow key={friend.id} player={friend} />) : <p className="text-center text-gray-400 mt-8">No friends yet. Add some!</p>}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-2">
                  {currentPlayer.friendRequests.map(req => (
                     <div key={req.fromId} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getColorById(req.fromCustomization.colorId)?.primaryClass} flex items-center justify-center text-2xl`}>
                                {getAvatarById(req.fromCustomization.avatarId)?.emoji}
                            </div>
                            <span className="font-semibold">{req.fromName}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onAcceptRequest(req.fromId)} className="p-2 text-xl rounded-full bg-green-500/80 hover:bg-green-500 transform transition-transform active:scale-95" title="Accept">✔️</button>
                            <button onClick={() => onDeclineRequest(req.fromId)} className="p-2 text-xl rounded-full bg-red-500/80 hover:bg-red-500 transform transition-transform active:scale-95" title="Decline">❌</button>
                        </div>
                    </div>
                  ))}
                   {currentPlayer.friendRequests.length === 0 && <p className="text-center text-gray-400 mt-8">No new friend requests.</p>}
                </div>
              )}

              {activeTab === 'add' && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Search for players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="space-y-2">
                    {searchResults.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full ${getColorById(player.customization.colorId)?.primaryClass} flex items-center justify-center text-2xl`}>
                                    {getAvatarById(player.customization.avatarId)?.emoji}
                                </div>
                                <span className="font-semibold">{player.name}</span>
                            </div>
                            <button onClick={() => onSendRequest(player.id)} className="p-2 text-xl rounded-full bg-blue-500/80 hover:bg-blue-500 transform transition-transform active:scale-95" title="Send Request">➕</button>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPanel;