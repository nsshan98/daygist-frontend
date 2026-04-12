// ===============================|| CENTRAL TYPES EXPORT ||============================== //
// This file provides a single import point for all types in the application
// Types are organized by domain (post, user, comment, follow, upload)

// Post Types (models, API requests, API responses)
export type {
  FeedAuthor,
  FeedMedia,
  TextStyle,
  FeedPostData,
  FeedItem,
  SavedPost,
  FeedResponse,
  MyPostsResponse,
  PhotosResponse,
  SavedPostsResponse,
  PostDetailResponse,
  LikeResponse,
  ShareResponse,
  CreateTextPostPayload,
  CreateImagePostPayload,
  CreateVideoPostPayload,
  CreatePostPayload,
  EditPostPayload,
} from "@/types/post.types";

// Comment Types
export type {
  CommentAuthor,
  Comment,
  CommentsResponse,
  RepliesResponse,
  CreateCommentPayload,
  CreateCommentResponse,
} from "@/types/comment.types";

// User Types
export type {
  UserProfile,
  SignedUrlResponse,
  UpdateProfilePayload,
} from "@/types/user.types";

// Follow Types
export type {
  FollowListItem,
  FollowListResponse,
} from "@/types/follow.types";

// Upload Types
export type {
  UploadResponse,
} from "@/types/upload.types";

// Component Types (from stores)
export type {
  PostType,
  PrivacyType,
  TextStyle as PostTextStyle,
  CreatePostState,
  CreatePostActions,
} from "@/components/features/home/stores/create-post-store";
