// ===============================|| VIDEO TYPES ||============================== //
// All video-related types: models, API requests, and API responses

// ===============================|| VIDEO API PAYLOADS ||============================== //

export interface MediaReference {
  url: string;
  key: string;
  provider: string;
}

export interface UploadLongVideoPayload {
  video: MediaReference;
  thumbnail?: MediaReference;
  title?: string;
  description?: string;
  subCategory?: string;
}

// ===============================|| VIDEO API RESPONSES ||============================== //

export interface UploadLongVideoResponse {
  ok: boolean;
  message: string;
  data?: unknown;
}

// ===============================|| USER VIDEOS ||============================== //

export interface UserVideoAuthor {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  coverPhoto: string;
  isMe: boolean;
}

export interface UserVideoMedia {
  type: "video";
  url: string;
  key: string;
  provider: string;
  thumbnailUrl: string;
  thumbnailKey: string;
}

export interface UserVideo {
  _id: string;
  type: "video";
  privacy: string;
  text: string;
  description: string;
  medias: UserVideoMedia[];
  mutedByDefault: boolean;
  loop: boolean;
  videoMode: string;
  category: string;
  subCategory: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  viewCount: number;
  earn: number;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  author: UserVideoAuthor;
}

export interface UserVideosResponse {
  success: boolean;
  items: UserVideo[];
  nextCursor: { createdAt: string; _id: string } | null;
}

// ===============================|| VIDEO SEARCH ||============================== //

export interface VideoSearchResponse {
  success: boolean;
  items: UserVideo[];
}
