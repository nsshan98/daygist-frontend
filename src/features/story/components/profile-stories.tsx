"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { useGetUserStories, useDeleteStory } from "../hooks/story-query";
import { useSignedMedia } from "@/features/profile";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  const stories = userStoriesQuery.data?.pages.flatMap((page) => page.items) || [];

  const handleDeleteClick = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    setStoryToDelete(story);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;
    try {
      await deleteStoryMutation.mutateAsync(storyToDelete._id);
      setShowDeleteConfirm(false);
      setStoryToDelete(null);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const ProfileStoryMedia = ({ story }: { story: Story }) => {
    const { useSignedUrl } = useSignedMedia();
    const { data: signedUrl } = useSignedUrl(story.media?.key || null);
    const { data: signedThumbnailUrl } = useSignedUrl(
      story.media?.thumbnailUrl ? story.media.key + "_thumb" : null
    );
    const finalUrl = signedUrl || story.media?.url;
    const finalThumbnailUrl = signedThumbnailUrl || story.media?.thumbnailUrl;

    if (story.type === "image") {
      return (
        <img
          src={finalThumbnailUrl || finalUrl}
          alt="Story"
          className="w-full h-full object-cover"
        />
      );
    }

    if (story.type === "video") {
      return (
        <div className="w-full h-full relative">
          <img
            src={finalThumbnailUrl || finalUrl}
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
      return <ProfileStoryMedia story={story} />;
    }

    if (story.type === "video" && story.media) {
      return <ProfileStoryMedia story={story} />;
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
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-primary/20 hover:border-primary/50 transition-all"
            onClick={() => setSelectedStory(story)}
          >
            {renderStoryContent(story)}
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isMyProfile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => handleDeleteClick(story, e)}
                  disabled={deleteStoryMutation.isPending}
                >
                  {deleteStoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
          singleStory={selectedStory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteStoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteStoryMutation.isPending}
            >
              {deleteStoryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
