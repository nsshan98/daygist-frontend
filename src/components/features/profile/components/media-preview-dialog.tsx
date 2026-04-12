"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { Skeleton } from "@/components/atoms/skeleton";
import { toast } from "sonner";
import {
  useGetComments,
  useCreateComment,
} from "@/components/features/home/hooks/comment-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import { FeedPostData, Comment, FeedMedia } from "@/types";
import {
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useSharePost,
  useGetPostDetail,
} from "@/components/features/home/hooks/feed-query";

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

// Media Carousel Component
function MediaCarousel({ 
  medias, 
  currentIndex, 
  onIndexChange 
}: { 
  medias: FeedMedia[]; 
  currentIndex: number; 
  onIndexChange: (index: number) => void;
}) {
  const { useSignedUrl } = useSignedMedia();
  const currentMedia = medias[currentIndex];
  const { data: signedUrl, isLoading: isUrlLoading } = useSignedUrl(currentMedia?.key || null);
  const finalUrl = signedUrl || currentMedia?.url;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const goToPrevious = () => {
    onIndexChange(currentIndex === 0 ? medias.length - 1 : currentIndex - 1);
    setImageLoaded(false);
  };

  const goToNext = () => {
    onIndexChange(currentIndex === medias.length - 1 ? 0 : currentIndex + 1);
    setImageLoaded(false);
  };

  if (!currentMedia) return null;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Media Display */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {isUrlLoading || !finalUrl ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        ) : currentMedia.type === "image" ? (
          <img
            src={finalUrl}
            alt="Post media"
            className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load:', finalUrl);
              setImageLoaded(true);
            }}
          />
        ) : (
          <video
            src={finalUrl}
            controls
            className="w-full h-full object-contain"
            onLoadedData={() => setImageLoaded(true)}
          />
        )}
      </div>

      {/* Navigation Arrows - Only show if multiple media */}
      {medias.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Media Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {medias.length}
          </div>
        </>
      )}
    </div>
  );
}

// Comment Item Component
function CommentItemComponent({ comment }: { comment: Comment }) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(comment.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || comment.author.avatar?.url;

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/${comment.author.username}?id=${comment.author._id}`}>
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={finalAvatarUrl} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
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
          {comment.likeCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {comment.likeCount} likes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface MediaPreviewDialogProps {
  post: FeedPostData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMediaIndex?: number;
  currentUser?: {
    name: string;
    avatar?: {
      url: string;
      key: string | null;
    } | null;
  } | null;
}

export function MediaPreviewDialog({
  post,
  open,
  onOpenChange,
  initialMediaIndex = 0,
  currentUser,
}: MediaPreviewDialogProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [commentText, setCommentText] = useState("");

  console.log(currentUser);
  

  // Reset media index when dialog opens with a new post
  useEffect(() => {
    if (open) {
      setCurrentMediaIndex(initialMediaIndex);
    }
  }, [open, initialMediaIndex, post?._id]);

  // Reset comment when dialog closes
  useEffect(() => {
    if (!open) {
      setCommentText("");
    }
  }, [open]);

  const postId = post?._id || "";
  const hasMedia = post?.medias && post.medias.length > 0;

  // Fetch post detail to get updated counts
  const { postDetailQuery } = useGetPostDetail(postId);
  const { data: postDetailData } = postDetailQuery;
  const updatedPost = postDetailData?.post || post;

  // Comments
  const { commentsQuery } = useGetComments(postId, open);
  const { createCommentMutation } = useCreateComment(postId);
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
  } = commentsQuery;
  const comments = commentsData?.pages.flatMap((page) => page.items) || [];

  // Like/Unlike mutations
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { sharePostMutation } = useSharePost();

  // Handle like/unlike
  const handleLikeToggle = () => {
    if (!updatedPost) return;
    
    if (updatedPost.isLiked) {
      unlikePostMutation.mutate(updatedPost._id);
    } else {
      likePostMutation.mutate(updatedPost._id);
    }
  };

  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!updatedPost) return;
    
    if (updatedPost.isSaved) {
      unsavePostMutation.mutate(updatedPost._id);
    } else {
      savePostMutation.mutate(updatedPost._id);
    }
  };

  // Handle share
  const handleShare = () => {
    if (!updatedPost) return;
    
    sharePostMutation.mutate(updatedPost._id, {
      onSuccess: () => {
        toast.success("Post shared successfully");
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      },
      onError: () => {
        toast.error("Failed to share post");
      },
    });
  };

  // Handle comment submission
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
          toast.success("Comment posted");
        },
        onError: () => {
          toast.error("Failed to post comment");
        },
      }
    );
  };

  if (!post) return null;

  // Fetch signed URL for avatar
  const { useSignedUrl: useSignedAvatarUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedAvatarUrl(post.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || post.author.avatar?.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-7xl w-full h-[95vh] p-0 overflow-hidden flex flex-row">
        {/* Left Side - Media */}
        <div className="lg:w-3/4 bg-black relative flex items-center justify-center">
          {hasMedia ? (
            <MediaCarousel
              medias={post.medias}
              currentIndex={currentMediaIndex}
              onIndexChange={setCurrentMediaIndex}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white/50">
              <p>No media available</p>
            </div>
          )}
        </div>

        {/* Right Side - Post Details & Comments */}
        <div className="lg:w-1/4 flex flex-col border-l bg-background">
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">Post Details</DialogTitle>
            </div>
          </DialogHeader>

          {/* Post Info */}
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Link href={`/${post.author.username}?id=${post.author._id}`}>
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={finalAvatarUrl} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link 
                  href={`/${post.author.username}?id=${post.author._id}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {post.author.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  @{post.author.username} • {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Post Text */}
            {post.text && (
              <p className="text-sm mb-3 whitespace-pre-wrap wrap-break-word">{post.text}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-t border-b">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                <span>{updatedPost?.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{updatedPost?.commentCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                <span>{updatedPost?.shareCount || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                className={`flex-1 gap-1 ${updatedPost?.isLiked ? "text-red-500" : ""}`}
              >
                <Heart className={`h-4 w-4 ${updatedPost?.isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Comment</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex-1 gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs">Share</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                className={`flex-1 gap-1 ${updatedPost?.isSaved ? "text-yellow-500" : ""}`}
              >
                <Bookmark className={`h-4 w-4 ${updatedPost?.isSaved ? "fill-current" : ""}`} />
                <span className="text-xs">Save</span>
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <h3 className="font-semibold text-sm mb-3">Comments</h3>
            
            {isCommentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((comment: Comment) => (
                  <CommentItemComponent key={comment._id} comment={comment} />
                ))}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="border-t px-4 py-3 shrink-0">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                {currentUser?.avatar?.url ? (
                  <AvatarImage src={currentUser.avatar.url} alt={currentUser.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-10 resize-none text-sm"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="shrink-0"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
