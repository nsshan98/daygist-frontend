"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/atoms/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { useGetUserStories, useMarkStorySeen, useDeleteStory } from "../hooks/story-query";
import { useSignedMedia } from "@/components/features/profile";
import { useShowUserProfile } from "@/components/features/auth/hooks/auth-query";
import { X, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { StoryFeedItem, Story } from "@/types";

interface StoryViewerProps {
  storyGroup: StoryFeedItem;
  onClose: () => void;
}

export function StoryViewer({ storyGroup, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { userStoriesQuery } = useGetUserStories(storyGroup.ownerId);
  const { markStorySeenMutation } = useMarkStorySeen();
  const { deleteStoryMutation } = useDeleteStory();
  const { useSignedUrl } = useSignedMedia();
  const { showUserProfileQuery } = useShowUserProfile();

  const stories = userStoriesQuery.data?.pages.flatMap((page) => page.items) || [];
  const currentStory = stories[currentIndex];
  const user = showUserProfileQuery.data?.data;
  const isMyStory = storyGroup.isMe;

  const { data: signedAvatarUrl } = useSignedUrl(storyGroup.owner.avatar.key || null);
  const avatarUrl = signedAvatarUrl || storyGroup.owner.avatar.url;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        nextStory();
      }
    }, interval);
  }, [currentIndex, stories.length]);

  const resetTimer = useCallback(() => {
    setProgress(0);
    startTimer();
  }, [startTimer]);

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleDelete = async () => {
    if (!currentStory) return;
    try {
      await deleteStoryMutation.mutateAsync(currentStory._id);
      if (currentIndex >= stories.length - 1) {
        onClose();
      } else {
        setCurrentIndex(currentIndex);
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  useEffect(() => {
    if (currentStory && !storyGroup.isSeen) {
      markStorySeenMutation.mutate(currentStory._id);
    }
  }, [currentStory]);

  useEffect(() => {
    if (stories.length > 0) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, stories.length, resetTimer]);

  const renderStoryContent = () => {
    if (!currentStory) return null;

    if (currentStory.type === "text") {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-8"
          style={{ backgroundColor: currentStory.backgroundUrl || "#667eea" }}
        >
          <p
            className="text-xl font-semibold text-center break-words"
            style={{
              color: currentStory.textStyle?.color || "#ffffff",
              fontSize: `${currentStory.textStyle?.fontSize || 24}px`,
              textAlign: currentStory.textStyle?.align || "center",
            }}
          >
            {currentStory.text}
          </p>
        </div>
      );
    }

    if (currentStory.type === "image" && currentStory.media) {
      return (
        <img
          src={currentStory.media.url}
          alt="Story"
          className="w-full h-full object-cover"
        />
      );
    }

    if (currentStory.type === "video" && currentStory.media) {
      return (
        <video
          src={currentStory.media.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
        />
      );
    }

    return null;
  };

  if (userStoriesQuery.isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] p-0 overflow-hidden bg-black" showCloseButton={false}>
          <div className="w-full h-[80vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0 overflow-hidden bg-black" showCloseButton={false}>
        <div className="relative w-full h-[80vh]">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-white transition-all duration-50",
                    index < currentIndex ? "w-full" : index === currentIndex ? "" : "w-0"
                  )}
                  style={{ width: index === currentIndex ? `${progress * 100}%` : undefined }}
                />
              </div>
            ))}
          </div>

          {/* Story Content */}
          {renderStoryContent()}

          {/* Navigation Overlays */}
          <div className="absolute inset-0 flex">
            <button
              onClick={prevStory}
              className="flex-1 h-full"
            />
            <button
              onClick={nextStory}
              className="flex-1 h-full"
            />
          </div>

          {/* Top Bar */}
          <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={avatarUrl} alt={storyGroup.owner.name} />
                <AvatarFallback className="bg-white/20">
                  {storyGroup.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="font-semibold text-sm">
                  {isMyStory ? "You" : storyGroup.owner.name}
                </p>
                {currentStory && (
                  <p className="text-xs text-white/70">
                    {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isMyStory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteStoryMutation.isPending}
                  className="text-white hover:bg-white/20"
                >
                  {deleteStoryMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
