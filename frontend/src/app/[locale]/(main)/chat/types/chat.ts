import { User as AppUser } from "@/types/user";

// Define User type for chat that uses the same number IDs as AppUser
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  cover: string;
  level: number;
  status: "online" | "offline" | "donotdisturb" | "invisible";
}

export interface Message {
  id: number;
  message: string;
  created_at: string;
  sender: User;
  seen: boolean;
  conversation: {
    id: number;
  };
}

export interface Conversation {
  id: number;
  other_participant: User;
  latest_message_text: string | null;
  latest_message_created_at: string;
  unseen_messages: number;
}

export interface ChatPreview {
  id: number;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export enum BlockState {
  BLOCKED_BY_ME = "blocked_by_me",
  BLOCKED_BY_OTHER = "blocked_by_other",
  UNBLOCKED = "unblocked",
  PENDING = "pending"
}
