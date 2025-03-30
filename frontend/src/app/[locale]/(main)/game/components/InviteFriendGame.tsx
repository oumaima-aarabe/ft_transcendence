"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchUsers } from "@/api/get-user";
import { UseUser } from "@/api/get-user";
import { UseFriend } from "@/api/get-friends";
import GameInviteButton from "./GameInviteButton";
import { Search, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FriendGameInvitesProps {
  onBack: () => void;
}

const FriendGameInvites: React.FC<FriendGameInvitesProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchQuery);
  const { data: currentUser } = UseUser();
  const { data: friends, isLoading: friendsLoading } = UseFriend();
  const router = useRouter();
  const t = useTranslations('Game');

  // Filter search results to include only friends
  const filterFriendResults = () => {
    if (!searchResults || !friends) return [];
    
    // Get list of friend usernames
    const friendUsernames = friends.map(friend => friend.username);
    
    // Filter search results to only include users who are friends
    return searchResults.filter(user => 
      friendUsernames.includes(user.username)
    );
  };

  const filteredResults = searchQuery ? filterFriendResults() : friends || [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6 bg-black bg-opacity-70 border border-gray-800 shadow-xl rounded-xl">
        <div className="flex items-center mb-6">
          <Button 
            onClick={onBack} 
            className="mr-4 p-2 rounded-full bg-transparent hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <h2 className="text-2xl font-bold text-white">{t('inviteFriend')}</h2>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder={t('searchFriends')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white pl-10 py-5"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        
        {/* Friends List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {friendsLoading ? (
            <div className="text-center py-5">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <p className="text-gray-400 mt-2">{t('loadingFriends')}</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchQuery ? t('noMatchingFriends') : t('noFriendsYet')}
              </p>
            </div>
          ) : (
            filteredResults.map((friend) => (
              <div 
                key={friend.username} 
                className="flex items-center justify-between bg-gray-800 bg-opacity-50 p-3 rounded-lg border border-gray-700"
              >
                <div className="flex items-center">
                  <img 
                    src={friend.avatar || "https://iili.io/2D8ByIj.png"} 
                    alt={friend.username} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">{friend.username}</p>
                    <p className="text-gray-400 text-sm">
                      {friend.first_name} {friend.last_name}
                    </p>
                  </div>
                </div>
                
                <GameInviteButton
                  username={friend.username}
                  avatarUrl={friend.avatar}
                  size="sm"
                />
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <Button
            onClick={onBack}
            className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {t('backToGameOptions')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FriendGameInvites;