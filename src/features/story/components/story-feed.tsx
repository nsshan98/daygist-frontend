"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { useGetStoriesFeed } from "../hooks/story-query";
import { useSignedMedia } from "@/features/profile";
import { Plus } from "lucide-react";
import { useCreateStoryStore } from "../stores/create-story-store";
import { StoryViewer } from "./story-viewer";
import type { StoryFeedItem } from "@/types";

function StoryFeedItemComponent({
  storyGroup,
  onClick,
}: {
  storyGroup: StoryFeedItem;
  onClick: () => void;
}) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(storyGroup.owner.avatar.key || null);
  const avatarUrl = signedAvatarUrl || storyGroup.owner.avatar.url;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[80px]"
    >
      <div className={`w-16 h-16 rounded-full p-1 ${!storyGroup.isSeen ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500' : 'bg-muted'}`}>
        <div className="w-full h-full rounded-full bg-background p-0.5">
          <Avatar className="w-full h-full">
            <AvatarImage src={avatarUrl} alt={storyGroup.owner.name} />
            <AvatarFallback>
              {storyGroup.owner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs truncate w-full text-center">
        {storyGroup.isMe ? "You" : storyGroup.owner.name}
      </span>
    </button>
  );
}

export function StoryFeed() {
  const { storiesFeedQuery } = useGetStoriesFeed();
  const { openModal } = useCreateStoryStore();
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryFeedItem | null>(null);

  const stories = storiesFeedQuery.data?.pages.flatMap((page) => page.items) || [];

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* Create Story Button */}
        <button
          onClick={openModal}
          className="flex flex-col items-center gap-2 min-w-[80px]"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-muted p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
          <span className="text-xs truncate w-full text-center">Your Story</span>
        </button>

        {/* Stories */}
        {stories.map((storyGroup) => (
          <StoryFeedItemComponent
            key={storyGroup._id}
            storyGroup={storyGroup}
            onClick={() => setSelectedStoryGroup(storyGroup)}
          />
        ))}
      </div>

      {/* Story Viewer */}
      {selectedStoryGroup && (
        <StoryViewer
          storyGroup={selectedStoryGroup}
          onClose={() => setSelectedStoryGroup(null)}
        />
      )}
    </>
  );
}
