// ===============================|| STORY TYPES ||============================== //
// All story-related types: models, API requests, and responses

// ===============================|| STORY MEDIA ||============================== //

export interface StoryMedia {
  url: string;
  thumbnailUrl?: string;
  provider: string;
  key: string;
  width?: number;
  height?: number;
  durationSec?: number;
}

// ===============================|| TEXT STYLE ||============================== //

export interface StoryTextStyle {
  color: string;
  fontSize: number;
  align: "left" | "center" | "right";
}

// ===============================|| STORY MODEL ||============================== //

export interface Story {
  _id: string;
  userId: string;
  type: "text" | "image" | "video";
  privacy: "followers" | "friends" | "only_me";
  media: StoryMedia | null;
  text: string;
  backgroundUrl: string;
  webLink: string;
  textStyle: StoryTextStyle | null;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ===============================|| STORY FEED ITEM ||============================== //

export interface StoryFeedItemOwner {
  _id: string;
  name: string;
  username: string;
  avatar: {
    url: string;
    key: string | null;
    provider: string;
  };
}

export interface StoryFeedItemLastStory {
  _id: string;
  type: "text" | "image" | "video";
  privacy: "followers" | "friends" | "only_me";
  media: StoryMedia | null;
  text: string;
  createdAt: string;
}

export interface StoryFeedItem {
  _id: string;
  ownerId: string;
  lastItemAt: string;
  lastStory: StoryFeedItemLastStory;
  count: number;
  owner: StoryFeedItemOwner;
  isSeen: boolean;
  isMe: boolean;
}

// ===============================|| STORY API RESPONSES ||============================== //

export interface CreateStoryResponse {
  success: boolean;
  story: Story;
}

export interface StoryFeedResponse {
  success: boolean;
  items: StoryFeedItem[];
  nextCursor?: {
    lastItemAt: string;
    ownerId: string;
  };
}

export interface UserStoriesResponse {
  success: boolean;
  items: Story[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  };
}

export interface DeleteStoryResponse {
  success: boolean;
}

export interface MarkStorySeenResponse {
  success: boolean;
}

// ===============================|| STORY API PAYLOADS ||============================== //

export interface CreateTextStoryPayload {
  type: "text";
  privacy: "followers" | "friends" | "only_me";
  text: string;
  backgroundUrl?: string;
  textStyle?: StoryTextStyle;
  webLink?: string;
}

export interface CreateImageStoryPayload {
  type: "image";
  privacy: "followers" | "friends" | "only_me";
  media: StoryMedia;
}

export interface CreateVideoStoryPayload {
  type: "video";
  privacy: "followers" | "friends" | "only_me";
  media: StoryMedia;
}

export type CreateStoryPayload = CreateTextStoryPayload | CreateImageStoryPayload | CreateVideoStoryPayload;
