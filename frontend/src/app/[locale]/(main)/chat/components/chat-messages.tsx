"use client";

import { Send, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Message, User } from "../types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { StatusAvatar } from "./status-avatar";
import { BlockState } from "../page";
import { useTranslations } from "next-intl";
interface ChatMessagesProps {
  messages: Message[];
  currentUser: User;
  selectedUser: User;
  onSendMessage: (content: string) => void;
  onToggleProfile: () => void;
  showProfile: boolean;
  blockState: BlockState;
}

export function ChatMessages({
  messages,
  currentUser,
  selectedUser,
  onSendMessage,
  onToggleProfile,
  showProfile,
  blockState
}: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const t = useTranslations('chat.messages');
  const th = useTranslations('header');

  return (
    <div className={`flex-1 flex flex-col h-full bg-black/10 backdrop-blur-sm overflow-hidden ml-3 ${showProfile ? "mr-3" : "rounded-r-[20px]"}`}>
      <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusAvatar user={selectedUser} />
          <div>
            <h2 className="font-semibold text-white">{selectedUser.username}</h2>
            <p className="text-sm text-[#808080]">
              {th(`status.${selectedUser.status}`)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleProfile}
          className="text-[#808080] rounded-full hover:text-white hover:bg-white/10"
        >
          {showProfile ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {(blockState === BlockState.BLOCKED_BY_ME || blockState === BlockState.BLOCKED_BY_OTHER) && (
          <div className="flex justify-center my-4">
            <div className="bg-red-900/30 text-white px-4 py-2 rounded-full text-sm">
              {blockState === BlockState.BLOCKED_BY_OTHER ? 
                t('blocked_by_other') : 
                t('blocked_by_me')}
            </div>
          </div>
        )}
        
        {messages.map((message) => {
          const isCurrentUser = message.sender.id === currentUser.id;
          return (
            <div key={message.id} className="space-y-1">
              <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] p-4 overflow-x-auto text-sm shadow-md transition-transform duration-200 ease-in-out ${
                    isCurrentUser
                      ? "bg-[#4CB5AB] text-white rounded-b-[20px] rounded-tl-[20px] rounded-tr-[3px] transform translate-x-1"
                      : "bg-stone-800 text-white rounded-b-[20px] rounded-tr-[20px] rounded-tl-[3px] transform translate-x-0"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <span className="text-xs text-[#808080]">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isCurrentUser && (
                  <div className="flex">
                    <Check className={`h-3 w-3 ${message.seen ? "text-[#4CB5AB]" : "text-[#808080]"}`} />
                    <Check className={`h-3 w-3 -ml-1 ${message.seen ? "text-[#4CB5AB]" : "text-[#808080]"}`} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-none">
        <div className="absolute left-0 right-0 bottom-0 border-t border-zinc-700 bg-stone-900 rounded-t-xl p-1">
          {blockState === BlockState.BLOCKED_BY_ME || blockState === BlockState.BLOCKED_BY_OTHER ? (
            <div className="flex items-center justify-center h-10 text-sm text-red-400">
              {blockState === BlockState.BLOCKED_BY_OTHER ? 
                t('blocked_by_other') : 
                t('blocked_by_me')}
            </div>
          ) : (
            <>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('placeholder')}
                className="bg-transparent border-none text-white placeholder:text-[#808080] focus:outline-none focus:ring-0 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="absolute right-2 top-2 bg-white/20 hover:bg-[#4CB5AB] hover:text-white text-gray rounded-full h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}