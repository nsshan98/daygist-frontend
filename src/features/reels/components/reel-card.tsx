"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { FeedPostData } from "@/types";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Send,
  Reply,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  UserMinus
} from "lucide-react";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { cn } from "@/lib/utils";
import { useLikePost, useUnlikePost, useSavePost, useUnsavePost, useSharePost } from "@/features/home/hooks/feed-query";
import { useGetUserProfile } from "@/features/profile/hooks/profile-query";
import { useGetComments, useCreateComment, useGetReplies } from "@/features/home/hooks/comment-query";
import { useFollowUser, useUnfollowUser } from "@/features/follow/hooks/follow-query";
import { Comment } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import { ReactionPicker } from "@/components/molecules/reaction-picker";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";

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
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  });
};

// Format numbers (e.g., 1000 -> 1K)
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Comment Item Component
function CommentItem({ 
  comment, 
  onReply,
  isReplying,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  isSubmitting,
  onToggleReplies,
  isExpanded,
}: { 
  comment: Comment;
  onReply: (id: string) => void;
  isReplying: boolean;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
  isSubmitting: boolean;
  onToggleReplies?: (id: string) => void;
  isExpanded?: boolean;
}) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(comment.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || comment.author.avatar?.url;
  const { repliesQuery } = useGetReplies(comment._id, isExpanded || false);
  const { data: repliesData, isLoading: isLoadingReplies } = repliesQuery;
  const replies = repliesData?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Link href={`/${comment.author.username}?id=${comment.author._id}`}>
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
            <AvatarImage src={finalAvatarUrl} alt={comment.author.name} />
            <AvatarFallback className="text-xs">
              {comment.author.name[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              href={`/${comment.author.username}?id=${comment.author._id}`}
              className="text-sm font-semibold hover:underline truncate"
            >
              {comment.author.name}
            </Link>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mt-1 wrap-break-word">{comment.text}</p>
          {comment.likeCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Heart className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
            </div>
          )}
          
          {/* Reply button */}
          <button
            onClick={() => onReply(comment._id)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 transition-colors"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>

          {/* Show replies count and toggle */}
          {comment.replyCount > 0 && onToggleReplies && (
            <button
              onClick={() => onToggleReplies(comment._id)}
              className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </>
              )}
            </button>
          )}

          {/* Replies list */}
          {isExpanded && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
              {isLoadingReplies ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                replies.map((reply: Comment) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    onReply={onReply}
                    isReplying={isReplying}
                    replyText={replyText}
                    onReplyTextChange={onReplyTextChange}
                    onSubmitReply={onSubmitReply}
                    isSubmitting={isSubmitting}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply input */}
      {isReplying && (
        <div className="ml-11 flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder={`Reply to ${comment.author.name}...`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmitReply(comment._id);
              }
            }}
            className="flex-1 text-sm"
          />
          <Button
            onClick={() => onSubmitReply(comment._id)}
            disabled={!replyText.trim() || isSubmitting}
            size="sm"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface ReelCardProps {
  reel: FeedPostData;
  index: number;
  isActive: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function ReelCard({ reel, index, isActive, onNext, onPrevious, hasNext, hasPrevious }: ReelCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { useSignedUrl } = useSignedMedia();
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { sharePostMutation } = useSharePost();
  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;

  // Comment hooks
  const { commentsQuery } = useGetComments(reel._id, isCommentPanelOpen);
  const { createCommentMutation } = useCreateComment(reel._id);

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
  } = commentsQuery;

  // Flatten comments
  const comments = commentsData?.pages.flatMap((page) => page.items) || [];

  // Fetch signed URLs
  const { data: signedAvatarUrl } = useSignedUrl(reel.author.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || reel.author.avatar.url;
  
  const media = reel.medias?.[0];
  const { data: signedVideoUrl } = useSignedUrl(media?.key || null);
  const videoUrl = signedVideoUrl || media?.url;

  // Auto-play when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  // Handle reaction
  const handleReact = (reaction: string) => {
    likePostMutation.mutate({ postId: reel._id, reaction });
  };

  const handleRemoveReact = () => {
    unlikePostMutation.mutate(reel._id);
  };

  // Handle save/unsave with optimistic update
  const handleSave = () => {
    if (reel.isSaved) {
      unsavePostMutation.mutate(reel._id);
    } else {
      savePostMutation.mutate(reel._id);
    }
  };

  // Handle share
  const handleShare = () => {
    sharePostMutation.mutate(reel._id, {
      onSuccess: () => {
        toast.success("Reel shared successfully!");
      },
      onError: () => {
        toast.error("Failed to share reel");
      },
    });
  };

  // Handle comment button click
  const handleComment = () => {
    setIsCommentPanelOpen(true);
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    setReplyToId(replyToId === commentId ? null : commentId);
    setReplyText("");
  };

  // Handle submit reply
  const handleSubmitReply = (parentId: string) => {
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
          toast.success("Reply posted!");
        },
        onError: () => {
          toast.error("Failed to post reply");
        },
      }
    );
  };

  // Toggle replies visibility
  const handleToggleReplies = (commentId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Handle submit comment
  const handleSubmitComment = () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;
    
    createCommentMutation.mutate(
      {
        text: commentText.trim(),
        type: "post",
      },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment posted!");
          // Scroll to bottom to show new comment
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
        onError: () => {
          toast.error("Failed to post comment");
        },
      }
    );
  };

  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();
  const [progress, setProgress] = useState(0);

  // Handle follow toggle
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFollowing = reel.author.isFollowing || reel.isFollowingAuthor;
    if (isFollowing) {
      unfollowUserMutation.mutate(reel.author._id);
    } else {
      followUserMutation.mutate(reel.author._id);
    }
  };

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        const percentage = (video.currentTime / video.duration) * 100;
        setProgress(percentage);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  // Handle video click (play/pause)
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  // Auto-scroll to bottom when comments load
  useEffect(() => {
    if (isCommentPanelOpen && comments.length > 0) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isCommentPanelOpen, comments.length]);

  // Infinite scroll for comments
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || !isCommentPanelOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isCommentPanelOpen]);

  // Reset state when panel closes
  useEffect(() => {
    if (!isCommentPanelOpen) {
      setCommentText("");
      setReplyToId(null);
      setReplyText("");
      setExpandedComments(new Set());
    }
  }, [isCommentPanelOpen]);

  const isFollowing = reel.author.isFollowing || reel.isFollowingAuthor;

  return (
    <>
      <div className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-background overflow-hidden">
        {/* Navigation Arrows Column (Far Right of Page) */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={cn(
              "p-2.5 rounded-full bg-muted/80 hover:bg-muted border border-border text-foreground transition-all shadow-lg backdrop-blur-sm",
              !hasPrevious ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              "p-2.5 rounded-full bg-muted/80 hover:bg-muted border border-border text-foreground transition-all shadow-lg backdrop-blur-sm",
              !hasNext ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
            )}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Wrapper */}
        <div className="relative flex items-end gap-4 h-full max-h-[calc(100vh-100px)] py-4">
          
          {/* Video Container */}
          <div className="relative aspect-[9/16] h-full rounded-2xl overflow-hidden bg-zinc-900 group/video shadow-2xl">
            {/* Video */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover cursor-pointer"
              loop
              muted={isMuted}
              autoPlay={isActive}
              onClick={handleVideoClick}
            />

            {/* Play/Pause Indicator Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity">
                <Play className="w-16 h-16 text-white/90 fill-white/20" />
              </div>
            )}

            {/* Mute/Unmute Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Bottom Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
              <div className="flex items-center gap-3 mb-4">
                <Link 
                  href={`/${reel.author.username}?id=${reel.author._id}`} 
                  className="hover:opacity-90 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-10 w-10 border-2 border-white/20 ring-2 ring-black/20">
                    <AvatarImage src={avatarUrl} alt={reel.author.name} />
                    <AvatarFallback className="bg-primary text-white text-xs">{reel.author.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/${reel.author.username}?id=${reel.author._id}`}
                      className="text-white font-bold text-sm hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {reel.author.name}
                    </Link>
                    {!reel.author.isMe && (
                      <button 
                        onClick={handleFollowToggle}
                        disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                          isFollowing 
                            ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
                            : "bg-white border-white text-black hover:bg-white/90"
                        )}
                      >
                        {followUserMutation.isPending || unfollowUserMutation.isPending ? "..." : (isFollowing ? "Following" : "Follow")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {reel.text && (
                <p className="text-white text-sm mb-2 line-clamp-2 leading-relaxed drop-shadow-md">
                  {reel.text}
                </p>
              )}
            </div>

            {/* Video Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
              <div 
                className="h-full bg-white transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          {/* Right Side Actions Column */}
          <div className="flex flex-col items-center gap-5 z-10 mb-2">
            {/* Like */}
            <div className="flex flex-col items-center gap-1.5">
              <ReactionPicker
                isLiked={reel.isLiked}
                currentReaction={reel.reaction}
                likeCount={reel.likeCount}
                onReact={handleReact}
                onRemoveReact={handleRemoveReact}
                isLoading={likePostMutation.isPending || unlikePostMutation.isPending}
                size="lg"
                iconSize="md"
                showCount={false}
                buttonClassName="p-3 rounded-full bg-muted/80 hover:bg-muted shadow-sm"
                activeClassName="text-red-500"
                hoverClassName="text-foreground"
              />
              <span className="text-foreground text-[11px] font-bold">
                {formatNumber(reel.likeCount)}
              </span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center gap-1.5">
              <button 
                onClick={handleComment}
                className="p-3 rounded-full bg-muted/80 hover:bg-muted transition-all text-foreground hover:scale-110 active:scale-95 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <span className="text-foreground text-[11px] font-bold">
                {formatNumber(reel.commentCount)}
              </span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-muted/80 hover:bg-muted transition-all text-foreground hover:scale-110 active:scale-95 shadow-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-foreground text-[11px] font-bold">
                {formatNumber(reel.shareCount || 0)}
              </span>
            </div>

            {/* Save */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleSave}
                className="p-3 rounded-full bg-muted/80 hover:bg-muted transition-all text-foreground hover:scale-110 active:scale-95 shadow-sm"
              >
                <Bookmark 
                  className={cn(
                    "w-5 h-5 transition-all",
                    reel.isSaved ? "fill-primary text-primary" : "text-foreground"
                  )} 
                />
              </button>
              <span className="text-foreground text-[11px] font-bold">
                {formatNumber(reel.saveCount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isCommentPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCommentPanelOpen(false)}
          />
          
          {/* Slide-in Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl animate-in slide-in-from-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">Comments</h3>
                  <p className="text-sm text-muted-foreground">
                    {reel.commentCount} comments
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCommentPanelOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingComments ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  // Empty state
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Be the first to comment!</p>
                  </div>
                ) : (
                  // Comments list
                  <div className="space-y-4">
                    {comments.map((comment: Comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        onReply={handleReply}
                        isReplying={replyToId === comment._id}
                        replyText={replyText}
                        onReplyTextChange={setReplyText}
                        onSubmitReply={handleSubmitReply}
                        isSubmitting={createCommentMutation.isPending}
                        onToggleReplies={handleToggleReplies}
                        isExpanded={expandedComments.has(comment._id)}
                      />
                    ))}
                    
                    {/* Load more trigger */}
                    {hasNextPage && (
                      <div ref={loadMoreRef} className="py-2">
                        {isFetchingNextPage && (
                          <div className="flex justify-center">
                            <Skeleton className="h-4 w-24" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Scroll to bottom marker */}
                    <div ref={commentsEndRef} />
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
