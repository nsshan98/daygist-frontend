// ===============================|| COMMENT TYPES ||============================== //
// All comment-related types: models, API requests, and responses

export interface CommentAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: {
    url: string;
    key: string | null;
    provider: string;
  };
}

export interface Comment {
  _id: string;
  targetType: "post" | "groupPost";
  postId: string;
  author: CommentAuthor;
  parentId: string | null;
  text: string;
  isDeleted: boolean;
  likeCount: number;
  isLiked?: boolean;
  reaction?: string | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CommentsResponse {
  ok: boolean;
  items: Comment[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  };
}

export interface RepliesResponse {
  ok: boolean;
  items: Comment[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  };
}

export interface CreateCommentPayload {
  text: string;
  type: "post" | "groupPost";
  parentId?: string;
}

export interface CreateCommentResponse {
  ok: boolean;
  comment: Comment;
}

