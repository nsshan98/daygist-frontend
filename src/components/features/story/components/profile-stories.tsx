"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { useGetUserStories, useDeleteStory } from "../hooks/story-query";
import { useSignedMedia } from "@/components/features/profile";
import { Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StoryViewer } from "./story-viewer";
import type { Story, StoryFeedItem, StoryFeedItemOwner } from "@/types";

interface ProfileStoriesProps {
  userId: string;
  isMyProfile: boolean;
  owner: StoryFeedItemOwner;
}

export function ProfileStories({ userId, isMyProfile, owner }: ProfileStoriesProps) {
  const { userStoriesQuery } = useGetUserStories(userId);
  const { deleteStoryMutation } = useDeleteStory();
  const { useSignedUrl } = useSignedMedia();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const stories = userStoriesQuery.data?.pages.flatMap((page) => page.items) || [];

  const handleDelete = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteStoryMutation.mutateAsync(storyId);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const renderStoryContent = (story: Story) => {
    if (story.type === "text") {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-2"
          style={{ backgroundColor: story.backgroundUrl || "#667eea" }}
        >
          <p
            className="text-sm font-semibold text-center break-words line-clamp-3"
            style={{
              color: story.textStyle?.color || "#ffffff",
            }}
          >
            {story.text}
          </p>
        </div>
      );
    }

    if (story.type === "image" && story.media) {
      return (
        <img
          src={story.media.thumbnailUrl || story.media.url}
          alt="Story"
          className="w-full h-full object-cover"
        />
      );
    }

    if (story.type === "video" && story.media) {
      return (
        <div className="w-full h-full relative">
          <img
            src={story.media.thumbnailUrl || story.media.url}
            alt="Story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const storyGroupForViewer: StoryFeedItem = {
    _id: userId,
    ownerId: userId,
    lastItemAt: stories[0]?.createdAt || new Date().toISOString(),
    lastStory: stories[0] ? {
      _id: stories[0]._id,
      type: stories[0].type,
      privacy: stories[0].privacy,
      media: stories[0].media,
      text: stories[0].text,
      createdAt: stories[0].createdAt,
    } : {
      _id: "",
      type: "text",
      privacy: "followers",
      media: null,
      text: "",
      createdAt: new Date().toISOString(),
    },
    count: stories.length,
    owner,
    isSeen: false,
    isMe: isMyProfile,
  };

  if (userStoriesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No stories yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {stories.map((story) => (
          <div
            key={story._id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setSelectedStory(story)}
          >
            {renderStoryContent(story)}
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isMyProfile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => handleDelete(story._id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-xs text-white/90 truncate drop-shadow-md">
                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedStory && (
        <StoryViewer
          storyGroup={storyGroupForViewer}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}
