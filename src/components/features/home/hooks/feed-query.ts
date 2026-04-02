import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

// Types for feed data
export interface FeedAuthor {
  _id: string;
  name: string;
  username: string;
  avatar: {
    url: string;
    key: string;
    provider: string;
  };
  isMe: boolean;
}

export interface FeedMedia {
  url: string;
  type: "image" | "video";
  provider: string;
  publicId: string | null;
  key: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface FeedPostData {
  _id: string;
  author: FeedAuthor;
  type: "image" | "video" | "text";
  privacy: string;
  text: string;
  backgroundUrl: string | null;
  textStyle: {
    color: string;
    fontSize: number;
    fontWeight: string;
    align: string;
  } | null;
  medias: FeedMedia[];
  layout: string | null;
  mutedByDefault: boolean;
  loop: boolean;
  videoMode: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  feedType: "post";
  isFollowingAuthor: boolean;
  isLiked: boolean;
  isShared: boolean;
}

export interface FeedItem {
  feedType: "post";
  data: FeedPostData;
}

export interface FeedResponse {
  success: boolean;
  items: FeedItem[];
  nextCursor?: string | { createdAt: string; _id: string };
  hasMore?: boolean;
}

// ===============================|| GET FEED ||============================== //
export const useGetFeed = () => {
  const feedQuery = useInfiniteQuery<FeedResponse>({
    queryKey: ["feed"],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      // Handle both string and object cursors
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'string') {
          cursor = `&cursor=${encodeURIComponent(pageParam)}`;
        } else if (typeof pageParam === 'object') {
          // If cursor is an object, stringify it
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/posts/feed?limit=${limit}${cursor}`;
      console.log('Fetching feed:', url, 'pageParam:', pageParam);
      const { data } = await axiosClient.get(url);
      console.log('Feed response:', {
        itemsCount: data.items?.length,
        nextCursor: data.nextCursor,
        hasMore: data.hasMore,
        currentPageParam: pageParam
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      console.log('getNextPageParam called:', {
        lastPageNextCursor: lastPage.nextCursor,
        lastPageItemsCount: lastPage.items?.length,
        hasMore: lastPage.hasMore
      });
      
      // Return the cursor as-is (could be string or object)
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { feedQuery };
};

// ===============================|| LIKE POST ||============================== //
export const useLikePost = () => {
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/like`);
      return data;
    },
  });
  return { likePostMutation };
};

// ===============================|| SAVE POST ||============================== //
export const useSavePost = () => {
  const savePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/save`);
      return data;
    },
  });
  return { savePostMutation };
};

// ===============================|| SHARE POST ||============================== //
export const useSharePost = () => {
  const sharePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/share`);
      return data;
    },
  });
  return { sharePostMutation };
};
