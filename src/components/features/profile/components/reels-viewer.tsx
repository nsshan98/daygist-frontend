"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { FeedPostData, FeedMedia, FeedItem } from "@/types";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  X,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause
} from "lucide-react";
import { useSignedMedia } from "./media-image";
import { cn } from "@/lib/utils";
import { useLikePost, useUnlikePost, useSavePost, useUnsavePost, useSharePost } from "@/components/features/home/hooks/feed-query";
import { CommentDialog } from "@/components/features/home/components/comment-dialog";
import { useGetUserProfile } from "../hooks/profile-query";
import { toast } from "sonner";

interface ReelsViewerProps {
  reels: FeedPostData[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReelsViewer({ 
  reels, 
  initialIndex = 0, 
  open, 
  onOpenChange 
}: ReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { useSignedUrl } = useSignedMedia();
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { sharePostMutation } = useSharePost();
  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;

  const currentReel = reels[currentIndex];

  // Fetch signed URLs for current reel
  const { data: signedAvatarUrl } = useSignedUrl(currentReel?.author.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || currentReel?.author.avatar.url;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsMuted(true);
      setIsPlaying(true);
    }
  }, [open, initialIndex]);

  // Auto-play current video
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video && open) {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });
  }, [currentIndex, open]);

  // Handle scroll to navigate between reels
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  // Handle like/unlike with optimistic update
  const handleLike = () => {
    if (!currentReel) return;

    if (currentReel.isLiked) {
      unlikePostMutation.mutate(currentReel._id);
    } else {
      likePostMutation.mutate(currentReel._id);
    }
  };

  // Handle save/unsave with optimistic update
  const handleSave = () => {
    if (!currentReel) return;

    if (currentReel.isSaved) {
      unsavePostMutation.mutate(currentReel._id);
    } else {
      savePostMutation.mutate(currentReel._id);
    }
  };

  // Handle share
  const handleShare = () => {
    if (!currentReel) return;

    sharePostMutation.mutate(currentReel._id, {
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
    setIsCommentDialogOpen(true);
  };

  // Handle video click (play/pause)
  const handleVideoClick = () => {
    const video = videoRefs.current[currentIndex];
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

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

  if (!currentReel) return null;

  const media = currentReel.medias?.[0];
  const { data: signedVideoUrl } = useSignedUrl(media?.key || null);
  const videoUrl = signedVideoUrl || media?.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full h-full p-0 bg-black border-none">
        <div className="relative w-full h-full flex">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Container */}
          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollBehavior: "smooth" }}
          >
            {reels.map((reel, index) => {
              const reelMedia = reel.medias?.[0];
              const { data: reelSignedUrl } = useSignedUrl(reelMedia?.key || null);
              const reelVideoUrl = reelSignedUrl || reelMedia?.url;
              const { data: reelAvatarUrl } = useSignedUrl(reel.author.avatar?.key || null);
              const reelAvatar = reelAvatarUrl || reel.author.avatar.url;

              return (
                <div
                  key={reel._id}
                  className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black"
                >
                  {/* Video */}
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={reelVideoUrl}
                    className="w-full h-full object-contain"
                    loop
                    muted={isMuted}
                    autoPlay={index === currentIndex}
                    onClick={handleVideoClick}
                  />

                  {/* Play/Pause Indicator */}
                  {index === currentIndex && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <Play className="w-20 h-20 text-white/80" />
                    </div>
                  )}

                  {/* Right Side Actions */}
                  <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
                    {/* Like */}
                    <button
                      onClick={handleLike}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors">
                        <Heart 
                          className={cn(
                            "w-7 h-7 transition-colors",
                            reel.isLiked ? "fill-red-500 text-red-500" : "text-white"
                          )} 
                        />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {formatNumber(reel.likeCount)}
                      </span>
                    </button>

                    {/* Comment */}
                    <button 
                      onClick={handleComment}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {formatNumber(currentReel.commentCount)}
                      </span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors">
                        <Share2 className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {formatNumber(reel.shareCount)}
                      </span>
                    </button>

                    {/* Save */}
                    <button
                      onClick={handleSave}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors">
                        <Bookmark 
                          className={cn(
                            "w-7 h-7 transition-colors",
                            reel.isSaved ? "fill-white text-white" : "text-white"
                          )} 
                        />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {formatNumber(reel.saveCount)}
                      </span>
                    </button>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute left-4 right-20 bottom-8 z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={reelAvatar} alt={reel.author.name} />
                        <AvatarFallback>{reel.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {reel.author.name}
                        </p>
                        <p className="text-white/70 text-xs">
                          @{reel.author.username} • {formatRelativeTime(reel.createdAt)}
                        </p>
                      </div>
                    </div>

                    {reel.text && (
                      <p className="text-white text-sm mb-2 line-clamp-2">
                        {reel.text}
                      </p>
                    )}
                  </div>

                  {/* Mute/Unmute Button */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Scroll Indicators */}
                  {currentIndex > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-10 pointer-events-none">
                      <ChevronUp className="w-8 h-8 text-white/50 animate-bounce" />
                    </div>
                  )}
                  {currentIndex < reels.length - 1 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 z-10 pointer-events-none">
                      <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment Dialog */}
        {currentReel && (
          <CommentDialog
            post={{
              feedType: "post",
              data: currentReel,
            }}
            open={isCommentDialogOpen}
            onOpenChange={setIsCommentDialogOpen}
            onLikeToggle={(postId) => {
              const reel = reels.find(r => r._id === postId);
              if (reel?.isLiked) {
                unlikePostMutation.mutate(postId);
              } else {
                likePostMutation.mutate(postId);
              }
            }}
            onSaveToggle={(postId) => {
              const reel = reels.find(r => r._id === postId);
              if (reel?.isSaved) {
                unsavePostMutation.mutate(postId);
              } else {
                savePostMutation.mutate(postId);
              }
            }}
            isLiking={likePostMutation.isPending || unlikePostMutation.isPending}
            isSaving={savePostMutation.isPending || unsavePostMutation.isPending}
            currentUser={currentUser ? {
              name: currentUser.name,
              avatar: currentUser.avatar
            } : null}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
