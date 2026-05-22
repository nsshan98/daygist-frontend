export interface ChatParticipant {
  _id: string;
  email?: string;
  name: string;
  avatar: {
    url: string | null;
    key: string | null;
    provider: string;
  };
  cover?: {
    url: string | null;
    key: string | null;
    provider: string;
  };
  username: string;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage: string;
  type: 'general' | 'group' | 'community';
  status: 'requested' | 'accepted' | 'rejected' | 'archived';
  requestedBy: string;
  lastMessageType: 'text' | 'image' | 'video' | 'file' | 'voice';
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  myUnreadCount: number;
}

export interface ChatPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: Conversation[];
  pagination: ChatPagination;
}

export interface MessageReaction {
  user: string;
  emoji: string;
  createdAt: string;
  _id: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: ChatParticipant;
  receiver: ChatParticipant;
  text: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'voice';
  media: {
    key: string;
    url: string;
    provider: string;
  };
  mediaMeta: {
    duration: number;
    size: number;
    mimeType: string;
  };
  seen: boolean;
  delivered: boolean;
  seenAt: string | null;
  deliveredAt: string | null;
  isDeleted: boolean;
  reactions: MessageReaction[];
  replyTo: {
    message: string;
    text: string;
    sender: string;
  } | string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: ChatMessage[];
  pagination: ChatPagination;
}
