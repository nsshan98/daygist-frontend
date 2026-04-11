// ===============================|| FOLLOW TYPES ||============================== //
// All follow-related types: models, API requests, and responses

export interface FollowListItem {
  _id: string;
  name: string;
  username: string;
  provider: string;
  createdAt: string;
  isFollowing: boolean;
}

export interface FollowListResponse {
  success: boolean;
  items: FollowListItem[];
  nextCursor: {
    createdAt: string;
    _id: string;
  } | null;
}
