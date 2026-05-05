// ===============================|| NOTIFICATION TYPES ||============================== //
// All notification-related types: models, API requests, and responses

export interface NotificationData {
  postId?: string;
  commentId?: string;
  [key: string]: any;
}

export interface Notification {
  _id: string;
  toUserId: string;
  fromUserId: string;
  type: string;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface NotificationsResponse {
  ok: boolean;
  items: Notification[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  } | null;
}

export interface MarkAllSeenResponse {
  success: boolean;
  message?: string;
}
