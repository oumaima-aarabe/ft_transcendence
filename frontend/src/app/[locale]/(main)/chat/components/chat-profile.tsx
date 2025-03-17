"use client";

import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  Swords,
  UserMinus,
  Trash2,
} from "lucide-react";
import { User } from "../types/chat";
import { Button } from "@/components/ui/button";
import { sendRequest } from "@/lib/axios";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";
import { BlockState } from '../page';
import { sendWebSocketMessage } from "@/lib/websocket";

interface ChatProfileProps {
  user: User;
  conversationId: string;
  onConversationDeleted: () => void;
  blockState: BlockState;
  setBlockState: (state: BlockState) => void;
}

export function ChatProfile({ user, conversationId, onConversationDeleted, blockState, setBlockState }: ChatProfileProps) {
  const t = useTranslations('chat.profile');
  const [isDeleting, setIsDeleting] = useState(false);
  

  useEffect(() => {

    const checkBlockStatus = async () => {
      try {
        // Check if we've blocked them
        const outgoingBlockResponse = await sendRequest("GET", "/friends/blocked/");
        const blockedByUs = outgoingBlockResponse.data.some(
          (blockedUser: any) => blockedUser.username === user.username
        );
        
        if (blockedByUs) {
          setBlockState(BlockState.BLOCKED_BY_ME);
          return;
        }
        
        // Check if they've blocked us
        const incomingBlockResponse = await sendRequest("GET", `/friends/check-blocked-by/${user.id}/`);
        const blockedByThem = incomingBlockResponse.data.is_blocked;
        
        setBlockState(blockedByThem ? BlockState.BLOCKED_BY_OTHER : BlockState.UNBLOCKED);
      } catch (error) {
        console.error("Error checking block status:", error);
      }
    };
    checkBlockStatus();
  }, [user.id, setBlockState]);

  const handleBlockToggle = async () => {
    try {
      setBlockState(BlockState.PENDING);
      if (blockState === BlockState.BLOCKED_BY_ME) {
        await sendRequest("POST", "/friends/unblock/", {
          username: user.username
        });
        
        sendWebSocketMessage("update_conversations", {});
        
        setBlockState(BlockState.UNBLOCKED);
      } else {
        await sendRequest("POST", "/friends/block/", {
          username: user.username
        });
        
        sendWebSocketMessage("update_conversations", {});
        
        setBlockState(BlockState.BLOCKED_BY_ME);
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error("Failed to update block status");

      setBlockState(blockState);
    }
  };

  const handleDeleteChat = async () => {
    try {
      setIsDeleting(true);
      await sendRequest("DELETE", `/chat/conversations/${conversationId}/`);
      onConversationDeleted();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="md:w-[32%] lg:w-[20%] bg-black/10 backdrop-blur-sm rounded-r-[20px] overflow-hidden">
      <div className="relative h-[45%]">
        <div className="h-full w-full overflow-hidden">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-center text-xl font-semibold text-white">{user.username}</h2>
          <p className="text-center text-xs text-[#808080]">
            {t('friend_status')}
          </p>
        </div>
      </div>
      <div className="p-2 mt-5 w-full">
        <h3 className="text-xs font-medium mb-7 text-white">{t('options')}</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="relative w-full text-sm text-white bg-transparent border border-white/20 hover:border-white/30 hover:text-white hover:bg-white/10 rounded-full h-11"
          >
            <div className="absolute top-3 left-3">
              <UserCircle className="h-4 w-4" />
            </div>
            <span className="flex justify-center text-xs items-center h-full">
              {t('view_profile')}
            </span>
          </Button>
          <Button
            variant="outline"
            disabled={blockState === BlockState.BLOCKED_BY_ME || blockState === BlockState.BLOCKED_BY_OTHER}
            className="relative w-full text-sm text-white bg-transparent border border-white/20 hover:border-white/30 hover:bg-white/10 hover:text-white rounded-full h-11"
          >
            <div className="absolute top-3 left-3">
              <Swords className="h-4 w-4" />
            </div>
            <span className="flex justify-center text-xs items-center h-full">
              {t('challenge')}
            </span>
          </Button>
          <Button
            variant="outline"
            className={`relative w-full text-sm bg-transparent border border-white/20 rounded-full h-11
              ${blockState === BlockState.UNBLOCKED ?
                  "text-[#CC0202] hover:text-[#CC0202] hover:bg-[#6e2626]/10 hover:border-[#CC0202]/30" :
                  blockState === BlockState.BLOCKED_BY_ME ?
                  "text-white hover:text-white hover:bg-white/10 hover:border-white/30" :
                  "text-[#CC0202] hover:text-[#CC0202] hover:bg-[#6e2626]/10 hover:border-[#CC0202]/30 opacity-50 cursor-not-allowed"
                }
              `}

            disabled={blockState === BlockState.PENDING || blockState === BlockState.BLOCKED_BY_OTHER}
            onClick={handleBlockToggle}
          >
            <div className="absolute top-3 left-3">
              <UserMinus className="h-4 w-4" />
            </div>
            <span className="flex justify-center text-xs items-center h-full">
              {blockState === BlockState.BLOCKED_BY_ME ? t('unblock') : 
               blockState === BlockState.BLOCKED_BY_OTHER ? t('blocked_by_other') : 
               blockState === BlockState.PENDING ? t('loading') : t('block')}
            </span>
          </Button>
          <Button
            variant="outline"
            disabled={isDeleting}
            className="relative w-full text-sm text-[#CC0202] bg-transparent border border-white/20 hover:border-[#CC0202]/30 hover:text-[#CC0202] hover:bg-[#6e2626]/10 rounded-full h-11"
            onClick={handleDeleteChat}
          >
            <div className="absolute top-3 left-3">
              <Trash2 className="h-4 w-4" />
            </div>
            <span className="flex justify-center text-xs items-center h-full">
              {isDeleting ? t('deleting') : t('delete_chat')}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
