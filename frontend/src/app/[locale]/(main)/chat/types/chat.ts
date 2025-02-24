export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  cover: string;
  level: number;
  status: "online" | "offline" | "donotdisturb" | "invisible";
}

export interface Message {
  id: string;
  message: string;
  created_at: string;
  sender: User;
  seen: boolean;
  conversation: {
    id: string;
  };
}

export interface Conversation {
  id: string;
  other_participant: User;
  latest_message_text: string | null;
  latest_message_created_at: string;
  unseen_messages: number;
}

export interface ChatPreview {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}