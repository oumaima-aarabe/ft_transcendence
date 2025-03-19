"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChatList } from "./components/chat-list";
import { ChatMessages } from "./components/chat-messages";
import { ChatProfile } from "./components/chat-profile";
import { Message, Conversation } from "./types/chat";
import { initSocket, getSocket, sendWebSocketMessage } from "@/lib/websocket";
import { sendRequest } from "@/lib/axios";
import { UseUser } from "@/api/get-user";

// move this export to another file
export enum BlockState {
  BLOCKED_BY_ME = "blocked_by_me",
  BLOCKED_BY_OTHER = "blocked_by_other",
  UNBLOCKED = "unblocked",
  PENDING = "pending"
}

export default function ChatApp() {
  const [showProfile, setShowProfile] = useState(true);
  const [chats, setChats] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: myUserData } = UseUser()
  const selectedChatRef = useRef<Conversation | null>(null);

  const [blockState, setBlockState] = useState<BlockState>(BlockState.PENDING);

  const checkIfBlockedBySelectedUser = async (selectedUserId: string) => {
    try {
      // First check if we've blocked them
      const outgoingBlockResponse = await sendRequest("GET", "/friends/blocked/");
      const blockedByUs = outgoingBlockResponse.data.data.some(
        (blockedUser: any) => blockedUser.friend_id === selectedUserId
      );
      
      if (blockedByUs) {
        setBlockState(BlockState.BLOCKED_BY_ME);
        return;
      }
      
      // Then check if they've blocked us
      const incomingBlockResponse = await sendRequest("GET", `/friends/check-blocked-by/${selectedUserId}/`);
      const blockedByThem = incomingBlockResponse.data.is_blocked;
      
      setBlockState(blockedByThem ? BlockState.BLOCKED_BY_OTHER : BlockState.UNBLOCKED);
    } catch (error) {
      console.error("Error checking block status:", error);
      setBlockState(BlockState.UNBLOCKED); // Default to unblocked on error
    }
  };

  const loadConversations = async () => {
    try {
      const response = await sendRequest("GET", "/chat/conversations/");
      if (Array.isArray(response.data)) {
        setChats(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Failed to load conversations");
      return [];
    }
  };

  // Load initial conversations
  useEffect(() => {
    if (myUserData) {
      loadConversations();
    }
  }, [myUserData]);

  const setupSocketListeners = useCallback((socket: WebSocket) => {
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case "update_conversations":
          // Refresh conversations list and handle deleted chat
          loadConversations().then((updatedChats) => {
            if (selectedChatRef.current) {
              const chatStillExists = updatedChats.some(chat => chat.id === selectedChatRef.current?.id);
              if (!chatStillExists) {
                selectedChatRef.current = null;
                setMessages([]);
                setShowProfile(true);
              }
            }
          });
          break;

        case "block_status_update":
          const { blocker } = data;
          // If the blocker is the user we're currently chatting with, update the block state
          if (selectedChatRef.current && selectedChatRef.current.other_participant.id === blocker.id) {
            await checkIfBlockedBySelectedUser(blocker.id);
          }
                    
          loadConversations();
          break;

        case "chat_message":
          const newMessage: Message = {
            id: Date.now().toString(),
            message: data.message,
            created_at: new Date().toISOString(),
            sender: data.sender,
            seen: false,
            conversation: { id: data.conversation.conversation_id },
          };

          // Update messages only if the conversation is the selected one
          if (selectedChatRef.current && data.conversation.conversation_id === selectedChatRef.current.id) {
            setMessages(prev => [...prev, newMessage]);
            // if this is the active chat, mark the message as seen
            sendWebSocketMessage("mark_seen", {
              conversation_id: data.conversation.conversation_id,
            });
          }

          // Update conversation in the list
          if (data.conversation) {
            setChats(prev => {
              const updatedChats = prev.map(chat => {
                if (chat.id === data.conversation.conversation_id) {
                  return {
                    ...chat,
                    latest_message_text: data.message,
                    latest_message_created_at: new Date().toISOString(),
                    unseen_messages: selectedChatRef.current?.id === chat.id ? 
                      0 : // If this is the selected chat, mark as seen
                      data.sender !== myUserData?.username ? 
                        (chat.unseen_messages + 1) : chat.unseen_messages,
                  };
                }
                return chat;
              });
              return updatedChats;
            });
          }
          break;
      }
    };

    socket.onerror = (error) => {
      // console.error("WebSocket error:", error);
      setError("Connection error. Please try again.");
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        initSocket();
      }, 3000);
    };
  }, [myUserData]);

  useEffect(() => {
    if (!myUserData) return;

    const socket = initSocket();
    if (socket) {
      setupSocketListeners(socket);
    }

    return () => {
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.close();
      }
    };
  }, [myUserData, setupSocketListeners]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedChatRef.current || !myUserData) return;

    const messageData = {
      message: content,
      receiver: selectedChatRef.current.other_participant.username,
      conversation_id: selectedChatRef.current.id,
    };

    sendWebSocketMessage("message", messageData);

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now().toString(),
      message: content,
      created_at: new Date().toISOString(),
      sender: myUserData,
      seen: false,
      conversation: { id: selectedChatRef.current.id },
    };

    setMessages(prev => [...prev, tempMessage]);
  };

  const handleChatSelect = async (chatId: string) => {
    const selected = chats.find(c => c.id === chatId);
    if (!selected) return;

    selectedChatRef.current = selected;
    setMessages([]);

    try {
      await checkIfBlockedBySelectedUser(selected.other_participant.id);

      const response = await sendRequest("GET", `/chat/messages/?conversation_id=${chatId}`);
      setMessages(response.data.messages);
      
      sendWebSocketMessage("mark_seen", {
        conversation_id: chatId,
      });

      // Update local state to reflect seen status
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unseen_messages: 0
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to fetch messages");
    }
  };

  const handleConversationDeleted = () => {
    // Clear selected chat and messages
    selectedChatRef.current = null;
    setMessages([]);
    loadConversations();
  };

  if (!myUserData) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full max-w-[2000px] mx-auto">
      <div className="flex p-3 w-full h-full bg-black/40 backdrop-blur-sm rounded-[20px]">
        <ChatList
          currentUser={myUserData}
          conversations={chats}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatRef.current?.id}
          loadConversations={loadConversations}
        />

        {selectedChatRef.current ? (
          <>
            <ChatMessages
              messages={messages}
              currentUser={myUserData}
              selectedUser={selectedChatRef.current.other_participant}
              onSendMessage={handleSendMessage}
              onToggleProfile={() => setShowProfile(!showProfile)}
              showProfile={showProfile}
              blockState={blockState}
            />
            {showProfile && (
              <ChatProfile 
                user={selectedChatRef.current.other_participant} 
                conversationId={selectedChatRef.current.id}
                onConversationDeleted={handleConversationDeleted}
                blockState={blockState}
                setBlockState={setBlockState}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <img src="/assets/images/mega-creator.svg" alt="messages" className="w-[26rem]"/>
          </div>
        )}
      </div>
      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
