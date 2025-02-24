"use client";

import { Search, Loader2 } from "lucide-react";
import { Conversation, User } from "../types/chat";
import { Input } from "@/components/ui/input";
import { StatusAvatar } from "./status-avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { sendRequest } from "@/lib/axios";
import endpoints from "@/constants/endpoints";
import { debounce } from "lodash";
import { sendWebSocketMessage } from "@/lib/websocket";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';

interface ChatListProps {
  currentUser: User;
  conversations: Conversation[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  loadConversations: () => Promise<Conversation[]>;
}

interface SearchUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  status: "online" | "offline" | "donotdisturb" | "invisible";
}

export function ChatList({
  currentUser,
  conversations = [],
  onChatSelect,
  selectedChatId,
  loadConversations,
}: ChatListProps) {
  const t = useTranslations('chat.list');
  const statusT = useTranslations('header.status');
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations || []);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilteredConversations(conversations || []);
  }, [conversations]);

  // useEffect(() => {
  //   if (!searchQuery.trim()) {
  //     setFilteredConversations(conversations || []);
  //     setSearchedUsers([]);
  //     setIsSearching(false);
  //     return;
  //   }

  //   const query = searchQuery.toLowerCase();
  //   const filtered = conversations.filter(conv => 
  //     conv.other_participant.username.toLowerCase().includes(query)
  //   );
  //   setFilteredConversations(filtered);

  //   // Search for users if no conversations match
  //   if (filtered.length === 0) {
  //     searchUsers(query);
  //   } else {
  //     setSearchedUsers([]);
  //   }
  // }, [searchQuery, conversations]);

  // const searchUsers = async (query: string) => {
  //   setIsSearching(true);
  //   try {
  //     const response = await sendRequest("GET", `${endpoints.searchUsers}/${query}`);
  //     setSearchedUsers(response.data);
  //   } catch (error) {
  //     console.error("Error searching users:", error);
  //     setSearchedUsers([]);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await sendRequest("GET", `/chat/search/users/?query=${query}`);
      setSearchResults(results.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const handleStartConversation = async (userId: string) => {
    try {
      setIsSearching(true);
      const response = await sendRequest("POST", "/chat/conversations/create/", {
        participant_id: userId,
      });
      
      if (response.data.id) {
        setSearchQuery("");
        setSearchResults([]);
        await loadConversations();
        onChatSelect(response.data.id);
      }
    } catch (error) {
      setError("Failed to start conversation. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'donotdisturb':
        return 'bg-red-500';
      case 'invisible':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-80 bg-black/10 backdrop-blur-sm rounded-l-[20px] flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <StatusAvatar user={currentUser} />
          <div>
            <h2 className="font-semibold text-white">{currentUser.username}</h2>
            <p className="text-sm text-[#808080]">{statusT(currentUser.status)}</p>
          </div>
        </motion.div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080] h-4 w-4" />
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!focus:outline-none !outline-none pl-9 bg-white/10 backdrop-blur-sm border-white/10 text-white placeholder:text-[#808080] rounded-full transition-all duration-200 hover:bg-white/20 focus:bg-white/20"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#808080]" />
          )}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-500/20 text-red-200 px-4 py-2 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="flex-1 overflow-auto px-4 py-2 space-y-2">
        <AnimatePresence mode="wait">
          {searchQuery && searchResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-xs text-[#808080] px-2 py-1">{t('search_results')}</p>
              {searchResults.map((user, index) => (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user.id}
                  onClick={() => handleStartConversation(user.id)}
                  disabled={isSearching}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-200 rounded-[20px] relative",
                    "hover:bg-[#f28b55]/20 hover:border-[#f28b55]/30",
                    "active:scale-98",
                    isSearching && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <StatusAvatar user={user} />
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-medium text-white">{user.username}</h3>
                    <p className="text-xs text-[#808080]">{t('click_to_start')}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredConversations.map((conv, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                  key={conv.id}
                >
                  {selectedChatId === conv.id && (
                    <motion.span
                      layoutId="activeChat"
                      className="absolute -left-4 top-[20%] h-[60%] w-1 bg-[#fc4503] rounded-r-md"
                    />
                  )}
                  <button
                    onClick={() => onChatSelect(conv.id)}
                    className={cn(
                      "w-full p-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-200 rounded-[20px] relative",
                      "hover:bg-[#f28b55]/20 hover:border-[#f28b55]/30",
                      "active:scale-98",
                      selectedChatId === conv.id && "bg-[#f28b55]/20 border-[#f28b55]/30"
                    )}
                  >
                    <StatusAvatar user={conv.other_participant} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <h3 className="text-sm font-medium text-white truncate">
                          {conv.other_participant.username}
                        </h3>
                        <span className="text-xs text-[#808080] whitespace-nowrap flex-shrink-0">
                          {statusT(conv.other_participant.status)}
                        </span>
                      </div>
                      {conv.unseen_messages > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 bg-[#4CB5AB] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {conv.unseen_messages}
                        </motion.div>
                      )}
                      <p className="text-xs text-[#808080] truncate max-w-[180px]">
                        {conv.latest_message_text}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))}
              
              {!isSearching && filteredConversations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[#808080] mt-8 py-4"
                >
                  {searchQuery ? (
                    <p>No users or conversations found</p>
                  ) : (
                    <p>No conversations yet</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
