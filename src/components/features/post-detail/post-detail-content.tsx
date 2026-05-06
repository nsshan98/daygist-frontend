"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  UserPlus,
  UserMinus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { Skeleton } from "@/components/atoms/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EditPostDialog } from "@/components/features/home/components/edit-post-dialog";
import {
  useGetPostDetail,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useDeletePost,
  useSharePost,
} from "@/components/features/home/hooks/feed-query";
import { useGetComments, useCreateComment } from "@/components/features/home/hooks/comment-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import { useFollowUser, useUnfollowUser } from "@/components/features/follow";
import { FeedMedia, Comment } from "@/types";

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Comment Item Component
function CommentItem({
  comment,
  isHighlighted,
  onReply,
  replyToId,
  replyText,
  onReplyTextChange,
  onSendReply,
  isSendingReply,
}: {
  comment: Comment;
  isHighlighted?: boolean;
  onReply: (commentId: string) => void;
  replyToId: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: (parentId: string) => void;
  isSendingReply: boolean;
}) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(comment.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || comment.author.avatar?.url;
  const isReplying = replyToId === comment._id;
  const commentRef = useRef<HTMLDivElement>(null);
  const [showHighlight, setShowHighlight] = useState(isHighlighted);

  useEffect(() => {
    if (isHighlighted && commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  useEffect(() => {
    if (isHighlighted) {
      const timeout = setTimeout(() => {
        setShowHighlight(false);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [isHighlighted]);

  return (
    <div
      ref={commentRef}
      className={`flex gap-3 py-3 rounded-xl transition-all duration-300 ${
        showHighlight ? "bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-400" : ""
      }`}
    >
      <Link href={`/${comment.author.username}?id=${comment.author._id}`}>
        <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={finalAvatarUrl} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="bg-muted/50 rounded-2xl px-3 py-2">
              <Link
                href={`/${comment.author.username}?id=${comment.author._id}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.author.name}
              </Link>
              <p className="text-sm text-foreground/90 wrap-break-word">{comment.text}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 px-2">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => onReply(comment._id)}
              >
                Reply
              </button>
              {comment.likeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {comment.likeCount} likes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="flex gap-2 mt-2 ml-2">
            <Textarea
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder={`Reply to ${comment.author.name}...`}
              className="min-h-10 resize-none text-sm"
              rows={1}
            />
            <Button
              size="sm"
              className="shrink-0"
              disabled={!replyText.trim() || isSendingReply}
              onClick={() => onSendReply(comment._id)}
            >
              {isSendingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Media Item Component with Signed URL - defined outside to avoid closure issues
function MediaItem({ 
  media, 
  index,
  mutedByDefault,
  loop
}: { 
  media: FeedMedia; 
  index?: number;
  mutedByDefault?: boolean;
  loop?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { useSignedUrl } = useSignedMedia();
  const { data: signedUrl } = useSignedUrl(media.key || null);
  const { data: signedThumbnailUrl } = useSignedUrl(
    media.thumbnailUrl ? media.key + "_thumb" : null
  );
  const finalUrl = signedUrl || media.url;
  const finalThumbnailUrl = signedThumbnailUrl || media.thumbnailUrl;

  if (media.type === "video") {
    return (
      <video
        src={finalUrl}
        controls
        className="w-full max-h-[600px]"
        poster={finalThumbnailUrl || undefined}
        muted={mutedByDefault}
        loop={loop}
      />
    );
  }

  return (
    <>
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      <img
        src={finalUrl}
        alt={`Post media ${index !== undefined ? index + 1 : ""}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
}

export function PostDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.postId as string;
  const commentId = searchParams.get("commentId");
  const queryClient = useQueryClient();
  const { useSignedUrl } = useSignedMedia();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Queries and mutations
  const { postDetailQuery } = useGetPostDetail(postId);
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { deletePostMutation } = useDeletePost();
  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();
  const { sharePostMutation } = useSharePost();
  const { commentsQuery } = useGetComments(postId, true);
  const { createCommentMutation } = useCreateComment(postId);

  const { data, isLoading, isError, error } = postDetailQuery;
  const post = data?.post;

  // Flatten comments
  const comments = commentsQuery.data?.pages.flatMap((page) => page.items) || [];

  // Fetch signed URL for avatar
  const { data: signedAvatarUrl } = useSignedUrl(post?.author?.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || post?.author?.avatar?.url;

  // Handle like/unlike with optimistic updates
  const handleLikeToggle = () => {
    if (!post) return;
    if (post.isLiked) {
      unlikePostMutation.mutate(post._id);
    } else {
      likePostMutation.mutate(post._id);
    }
  };

  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!post) return;
    if (post.isSaved) {
      unsavePostMutation.mutate(post._id, {
        onSuccess: () => {
          toast.success("Post removed from saved");
          queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
        onError: () => {
          toast.error("Failed to unsave post");
        },
      });
    } else {
      savePostMutation.mutate(post._id, {
        onSuccess: () => {
          toast.success("Post saved");
          queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
        onError: () => {
          toast.error("Failed to save post");
        },
      });
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!post) return;
    const isFollowing = post.isFollowingAuthor || post.author.isFollowing;
    if (isFollowing) {
      unfollowUserMutation.mutate(post.author._id, {
        onSuccess: () => {
          toast.success(`Unfollowed ${post.author.name}`);
          queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
      });
    } else {
      followUserMutation.mutate(post.author._id, {
        onSuccess: () => {
          toast.success(`Following ${post.author.name}`);
          queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
      });
    }
  };

  // Handle delete
  const handleDeletePost = () => {
    if (!post) return;
    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        toast.success("Post deleted successfully");
        setIsDeleteDialogOpen(false);
        // Redirect to home
        window.location.href = "/";
      },
      onError: () => {
        toast.error("Failed to delete post");
      },
    });
  };

  // Handle share
  const handleShare = () => {
    if (!post) return;
    
    // Call the API to increment share count
    sharePostMutation.mutate(post._id, {
      onSuccess: () => {
        toast.success("Post shared successfully");
        
        // Also copy link to clipboard for convenience
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      },
      onError: () => {
        toast.error("Failed to share post");
      },
    });
  };

  // Handle create comment
  const handleSendComment = () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      {
        text: commentText.trim(),
        type: "post",
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
        onError: () => {
          toast.error("Failed to post comment");
        },
      }
    );
  };

  // Handle reply
  const handleSendReply = (parentId: string) => {
    if (!replyText.trim() || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      {
        text: replyText.trim(),
        type: "post",
        parentId,
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyToId(null);
        },
        onError: () => {
          toast.error("Failed to post reply");
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Back button skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-24" />
          </div>

          <Card className="border-none shadow-xl">
            {/* Header skeleton */}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>

            {/* Content skeleton */}
            <CardContent className="pb-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <Skeleton className="aspect-video w-full rounded-xl" />
            </CardContent>

            {/* Actions skeleton */}
            <CardFooter className="pt-3">
              <div className="flex w-full gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-none shadow-lg max-w-md mx-4">
          <CardContent className="py-12 px-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Post Not Found</h3>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error
                ? error.message
                : "The post you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild className="rounded-full px-6">
              <Link href="/">Go Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render text post with background
  const renderTextPost = () => {
    if (post.backgroundUrl && post.textStyle) {
      return (
        <div
          className="relative w-full overflow-hidden rounded-2xl shadow-inner min-h-[400px]"
          style={{
            backgroundImage: `url(${post.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
            <p
              className="text-center leading-relaxed"
              style={{
                color: post.textStyle.color,
                fontSize: `${post.textStyle.fontSize}px`,
                fontWeight: post.textStyle.fontWeight,
                textAlign: post.textStyle.align as any,
              }}
            >
              {post.text}
            </p>
          </div>
        </div>
      );
    }

    if (post.text) {
      return (
        <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {post.text}
        </p>
      );
    }

    return null;
  };

  // Render media
  const renderMedia = () => {
    if (!post.medias || post.medias.length === 0) return null;

    // Single media
    if (post.medias.length === 1) {
      const media = post.medias[0];
      return (
        <div className="mt-4 rounded-2xl overflow-hidden relative">
          <MediaItem 
            media={media} 
            mutedByDefault={post.mutedByDefault}
            loop={post.loop}
          />
        </div>
      );
    }

    // Multiple images - Grid layout
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        {post.medias.map((media, index) => (
          <div
            key={index}
            className={`relative overflow-hidden aspect-square ${
              index === 0 && post.medias.length === 3 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <MediaItem media={media} index={index} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Feed
            </Link>
          </Button>
        </div>

        {/* Main Post Card */}
        <Card className="border-none shadow-xl overflow-hidden">
          {/* Post Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Link
                href={`/${post.author.username}?id=${post.author._id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                  <AvatarImage src={finalAvatarUrl} alt={post.author.name} />
                  <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                    {post.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-base">{post.author.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>@{post.author.username}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                    {post.privacy !== "public" && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{post.privacy}</span>
                      </>
                    )}
                  </p>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {post.author.isMe ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete post
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={handleFollowToggle} className="cursor-pointer">
                      {post.isFollowingAuthor || post.author.isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {/* Post Content */}
          <CardContent className="pb-3">
            {renderTextPost()}
            {renderMedia()}
          </CardContent>

          {/* Post Stats */}
          <CardFooter className="pt-3 border-t">
            <div className="flex w-full flex-col gap-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <Heart className="w-3 h-3 fill-white text-white" />
                    </div>
                  </div>
                  <span>{post.likeCount.toLocaleString()} likes</span>
                </div>
                <div className="flex gap-4">
                  <span>{post.commentCount} comments</span>
                  <span>{post.shareCount} shares</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-1 flex-1">
                  <Button
                    variant="ghost"
                    onClick={handleLikeToggle}
                    disabled={likePostMutation.isPending || unlikePostMutation.isPending}
                    className={`flex-1 gap-2 rounded-xl transition-all duration-300 ${
                      post.isLiked
                        ? "text-red-500"
                        : "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        post.isLiked ? "fill-current scale-110" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {post.isLiked ? "Liked" : "Like"}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 gap-2 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Comment</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleShare}
                    disabled={sharePostMutation.isPending}
                    className="flex-1 gap-2 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Comments Section */}
        <Card className="border-none shadow-lg mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Comments</h3>
          </CardHeader>
          <CardContent>
            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20">Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[60px] resize-none flex-1"
                />
                <Button
                  size="icon"
                  className="rounded-full h-10 w-10"
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                  onClick={handleSendComment}
                >
                  {createCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {commentsQuery.isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  isHighlighted={commentId === comment._id}
                  onReply={setReplyToId}
                  replyToId={replyToId}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onSendReply={handleSendReply}
                  isSendingReply={createCommentMutation.isPending}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Post Dialog */}
      {post && (
        <EditPostDialog 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          post={post} 
        />
      )}

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={deletePostMutation.isPending}>
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
