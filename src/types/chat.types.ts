export interface ChatParticipant {
  _id: string;
  email: string;
  name: string;
  avatar: {
    url: string | null;
    key: string | null;
    provider: string;
  };
  cover: {
    url: string | null;
    key: string | null;
    provider: string;
  };
  username: string;
  isOnline: boolean;
  lastSeen: string | null;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage: string;
  type: 'general' | 'group' | 'community';
  status: 'requested' | 'accepted' | 'rejected' | 'archived';
  requestedBy: string;
  lastMessageType: 'text' | 'image' | 'video' | 'file';
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
