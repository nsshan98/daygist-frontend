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
  ReelsResponse,
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

// Group Types
export type {
  Group,
  ForYouGroup,
  MyGroupMembership,
  GroupDetails,
  GroupDetailsResponse,
  ForYouGroupsResponse,
  MyGroupsResponse,
  CreateGroupPayload,
  CreateGroupResponse,
  JoinGroupResponse,
  GroupMemberUser,
  GroupMember,
  GroupJoinRequest,
  GroupMembersResponse,
  GroupJoinRequestsResponse,
  UpdateMemberStatusPayload,
  UpdateMemberStatusResponse,
  DeleteGroupResponse,
} from "@/types/group.types";

// Group Post Types
export type {
  GroupPostAuthor,
  GroupPostGroup,
  GroupPostTextStyle,
  GroupPostMedia,
  GroupPostCounts,
  GroupPostData,
  GroupPostsResponse,
  GroupPostDetailResponse,
  GroupPostLikeResponse,
  GroupPostShareResponse,
  CreateGroupTextPostPayload,
  CreateGroupImagePostPayload,
  CreateGroupVideoPostPayload,
  CreateGroupPostPayload,
  EditGroupPostPayload,
} from "@/types/group-post.types";

// Monetization Types
export type {
  MonetizationUser,
  MonetizationWallet,
  MonetizationApp,
  MonetizationData,
  MonetizationResponse,
  ApplyMonetizationPayload,
  ApplyMonetizationResponse,
  TransactionType,
  WithdrawMethod,
  ManageTransactionPayload,
  ManageTransactionResponse,
} from "@/types/monetization.types";

// Video Types
export type {
  MediaReference,
  UploadLongVideoPayload,
  UploadLongVideoResponse,
  UserVideoAuthor,
  UserVideoMedia,
  UserVideo,
  UserVideosResponse,
  VideoSearchResponse,
} from "@/types/video.types";

// Story Types
export type {
  StoryMedia,
  StoryTextStyle,
  Story,
  StoryFeedItemOwner,
  StoryFeedItemLastStory,
  StoryFeedItem,
  CreateStoryResponse,
  StoryFeedResponse,
  UserStoriesResponse,
  DeleteStoryResponse,
  MarkStorySeenResponse,
  CreateTextStoryPayload,
  CreateImageStoryPayload,
  CreateVideoStoryPayload,
  CreateStoryPayload,
} from "@/types/story.types";

// Notification Types
export type {
  Notification,
  NotificationData,
  NotificationsResponse,
  MarkAllSeenResponse,
} from "@/types/notification.types";

// Chat Types
export type {
  ChatParticipant,
  Conversation,
  ChatPagination,
  ConversationsResponse,
  MessageReaction,
  ChatMessage,
  MessagesResponse,
} from "@/types/chat.types";

// Seller Types
export type {
  SellerStatus,
  BusinessType,
  SellerImage,
  SellerProfile,
  SellerStats,
  SellerMeResponse,
  SellerApplicationPayload,
  SellerApplicationResponse,
} from "@/types/seller.types";

// Component Types (from stores)
export type {
  PostType,
  PrivacyType,
  TextStyle as PostTextStyle,
  CreatePostState,
  CreatePostActions,
} from "@/features/home/stores/create-post-store";
