// ===============================|| GROUP POST TYPES ||============================== //
// All group post-related types: models, API requests, and responses

// ===============================|| GROUP POST MODEL ||============================== //

export interface GroupPostAuthor {
  _id: string;
  name: string;
  avatar: {
    url: string;
    key: string | null;
    provider: string;
  };
}

export interface GroupPostGroup {
  _id: string;
  name: string;
  privacy: "public" | "private";
  coverUrl: {
    url: string;
    key: string;
    provider: string;
  };
  counts: {
    members: number;
    posts: number;
  };
}

export interface GroupPostTextStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  align: string;
}

export interface GroupPostMedia {
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

export interface GroupPostCounts {
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface GroupPostData {
  _id: string;
  groupId: GroupPostGroup;
  authorId: GroupPostAuthor;
  type: "text" | "image" | "video";
  text: string;
  backgroundUrl: string | null;
  textStyle: GroupPostTextStyle | null;
  layout: string | null;
  mutedByDefault: boolean;
  loop: boolean;
  category: string;
  postType: "groupPost";
  isDeleted: boolean;
  counts: GroupPostCounts;
  images: GroupPostMedia[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  __v: number;
  // Expanded fields (from API response)
  isLiked?: boolean;
  reaction?: string | null;
  author?: GroupPostAuthor;
  group?: GroupPostGroup;
}

// ===============================|| GROUP POST API RESPONSES ||============================== //

export interface GroupPostsResponse {
  success: boolean;
  items: GroupPostData[];
  nextCursor: {
    createdAt: string;
    _id: string;
  } | null;
}

export interface GroupPostDetailResponse {
  success: boolean;
  item: GroupPostData;
}

export interface GroupPostLikeResponse {
  success: boolean;
  message: string;
  data: {
    postId: string;
    isLiked: boolean;
    reaction: string | null;
    likeCount: number;
  };
}

export interface GroupPostShareResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    isShared: boolean;
    shareCount: number;
  };
}

// ===============================|| GROUP POST API PAYLOADS ||============================== //

export interface CreateGroupTextPostPayload {
  type: "text";
  text: string;
  backgroundUrl?: string;
  textStyle?: GroupPostTextStyle;
}

export interface CreateGroupImagePostPayload {
  type: "image";
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

export interface CreateGroupVideoPostPayload {
  type: "video";
  caption: string;
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

export type CreateGroupPostPayload = 
  | CreateGroupTextPostPayload 
  | CreateGroupImagePostPayload 
  | CreateGroupVideoPostPayload;

export interface EditGroupPostPayload {
  text?: string;
  caption?: string;
  backgroundUrl?: string;
  textStyle?: GroupPostTextStyle;
  images?: {
    url: string;
    provider: string;
    key: string;
    width?: number;
    height?: number;
  }[];
  layout?: string;
  video?: {
    url: string;
    thumbnailUrl?: string;
    provider: string;
    key: string;
    durationSec?: number;
    width?: number;
    height?: number;
  };
  mutedByDefault?: boolean;
  loop?: boolean;
  category?: string;
  subCategory?: string;
}

