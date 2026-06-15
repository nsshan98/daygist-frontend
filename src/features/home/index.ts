export { FeedPost } from "./components/feed-post";
export { CreatePost } from "./components/create-post";
export { CreatePostDialog } from "./components/create-post-dialog";
export { Suggestions } from "./components/suggestions";
export { Sidebar } from "./components/sidebar";
export { MediaViewer } from "./components/media-viewer";
export { CommentDialog } from "./components/comment-dialog";

export { PostModal } from "@/components/organisms/post-modal";
export type {
  PostModalProps,
  CurrentUserLite,
} from "@/components/organisms/post-modal";

// Store exports
export {
  useCreatePostStore,
  TEXT_BACKGROUNDS,
  type PostType,
  type PrivacyType,
  type TextStyle,
  type CreatePostState,
  type CreatePostActions,
} from "./stores/create-post-store";

// Hook exports
export {
  useUploadImage,
  useUploadVideo,
  useUploadMultipleImages,
} from "./hooks/upload-query";
export {
  useGetFeed,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useSharePost,
  useCreatePost,
  useEditPost,
  useDeletePost,
  useGetMyPosts,
  useGetUserPostsById,
  useGetMyPhotos,
  useGetUserPhotosById,
} from "./hooks/feed-query";

export {
  useGetComments,
  useCreateComment,
  useGetReplies,
} from "./hooks/comment-query";

// Type re-exports for convenience
export type {
  FeedAuthor,
  FeedMedia,
  FeedPostData,
  FeedItem,
  FeedResponse,
  MyPostsResponse,
  PhotosResponse,
  CreateTextPostPayload,
  CreateImagePostPayload,
  CreateVideoPostPayload,
  CreatePostPayload,
  EditPostPayload,
  Comment,
  CommentAuthor,
  CommentsResponse,
  CreateCommentPayload,
  CreateCommentResponse,
  UploadResponse,
} from "@/types";
