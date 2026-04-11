// ===============================|| POST TYPES ||============================== //
// All post-related types: models, API requests, and responses

// ===============================|| POST MODEL ||============================== //

export interface FeedAuthor {
  _id: string;
  name: string;
  username: string;
  avatar: {
    url: string;
    key: string;
    provider: string;
  };
  isMe: boolean;
  isFollowing?: boolean;
}

export interface FeedMedia {
  url: string;
  type: "image" | "video";
  provider: string;
  publicId: string | null;
  key: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface TextStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  align: string;
}

export interface FeedPostData {
  _id: string;
  author: FeedAuthor;
  type: "image" | "video" | "text";
  privacy: string;
  text: string;
  feeling: string | null;
  backgroundUrl: string | null;
  textStyle: TextStyle | null;
  medias: FeedMedia[];
  layout: string | null;
  mutedByDefault: boolean;
  loop: boolean;
  videoMode: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  feedType: "post";
  isFollowingAuthor: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
}

export interface FeedItem {
  feedType: "post";
  data: FeedPostData;
}

export interface SavedPost {
  _id: string;
  author: FeedAuthor;
  type: "image" | "video" | "text";
  privacy: string;
  text: string;
  feeling: string | null;
  description: string;
  backgroundUrl: string | null;
  textStyle: TextStyle | null;
  medias: FeedMedia[];
  layout: string | null;
  mutedByDefault: boolean;
  loop: boolean;
  videoMode: string;
  category: string;
  subCategory: string;
  isDeleted: boolean;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

// ===============================|| POST API RESPONSES ||============================== //

export interface FeedResponse {
  success: boolean;
  items: FeedItem[];
  nextCursor?: string | { createdAt: string; _id: string };
  hasMore?: boolean;
}

export interface MyPostsResponse {
  success: boolean;
  items: FeedPostData[];
  nextCursor?: { createdAt: string; _id: string };
}

export interface SavedPostsResponse {
  success: boolean;
  page: number;
  limit: number;
  posts: SavedPost[];
}

export interface PostDetailResponse {
  success: boolean;
  post: FeedPostData & {
    description: string;
    category: string;
    subCategory: string;
    isDeleted: boolean;
    viewCount: number;
  };
  shareLink: string;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    isLiked: boolean;
    likeCount: number;
  };
}

export interface ShareResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    isShared: boolean;
    shareCount: number;
  };
}

// ===============================|| POST API PAYLOADS ||============================== //

export interface CreateTextPostPayload {
  type: "text";
  privacy: string;
  text: string;
  feeling?: string | null;
  backgroundUrl?: string;
  textStyle?: TextStyle;
}

export interface CreateImagePostPayload {
  type: "image";
  privacy: string;
  caption: string;
  layout: string;
  images: {
    url: string;
    provider: string;
    key: string;
    width?: number;
    height?: number;
  }[];
  subCategory?: string;
}

export interface CreateVideoPostPayload {
  type: "video";
  privacy: string;
  caption: string;
  videoMode: string;
  category: string;
  subCategory?: string;
  mutedByDefault: boolean;
  loop: boolean;
  video: {
    url: string;
    thumbnailUrl?: string;
    provider: string;
    key: string;
    durationSec?: number;
    width?: number;
    height?: number;
  };
}

export type CreatePostPayload = CreateTextPostPayload | CreateImagePostPayload | CreateVideoPostPayload;

export interface EditPostPayload {
  text?: string;
  privacy?: string;
  feeling?: string | null;
  backgroundUrl?: string;
  textStyle?: TextStyle;
  layout?: string;
}

