import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type {
  CreateStoryResponse,
  StoryFeedResponse,
  UserStoriesResponse,
  DeleteStoryResponse,
  MarkStorySeenResponse,
  CreateStoryPayload,
  Story,
} from "@/types";

// ===============================|| GET STORIES FEED ||============================== //

export const useGetStoriesFeed = () => {
  const storiesFeedQuery = useInfiniteQuery<StoryFeedResponse>({
    queryKey: ["stories-feed"],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/stories/feed?limit=${limit}${cursor}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { lastItemAt: string; ownerId: string } | undefined,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
  });

  return { storiesFeedQuery };
};

// ===============================|| GET USER STORIES ||============================== //

export const useGetUserStories = (userId: string) => {
  const userStoriesQuery = useInfiniteQuery<UserStoriesResponse>({
    queryKey: ["user-stories", userId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/stories/${userId}?limit=${limit}${cursor}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
  });

  return { userStoriesQuery };
};

// ===============================|| CREATE STORY ||============================== //

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  const createStoryMutation = useMutation<CreateStoryResponse, Error, CreateStoryPayload>({
    mutationFn: async (payload: CreateStoryPayload) => {
      const { data } = await axiosClient.post("/stories", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
    },
  });

  return { createStoryMutation };
};

// ===============================|| DELETE STORY ||============================== //

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  const deleteStoryMutation = useMutation<DeleteStoryResponse, Error, string>({
    mutationFn: async (storyId: string) => {
      const { data } = await axiosClient.delete(`/stories/${storyId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
    },
  });

  return { deleteStoryMutation };
};

// ===============================|| MARK STORY AS SEEN ||============================== //

export const useMarkStorySeen = () => {
  const queryClient = useQueryClient();

  const markStorySeenMutation = useMutation<MarkStorySeenResponse, Error, string>({
    mutationFn: async (storyId: string) => {
      const { data } = await axiosClient.post(`/stories/${storyId}/seen`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
    },
  });

  return { markStorySeenMutation };
};
