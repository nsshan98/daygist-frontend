import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReelsResponse } from "@/types";

interface VideosQueryParams {
  subCategory?: string;
}

// ===============================|| GET REELS VIDEOS FEED ||============================== //

export const useGetReelsVideos = (params?: VideosQueryParams) => {
  const reelsQuery = useInfiniteQuery<ReelsResponse>({
    queryKey: ["reels-videos", params?.subCategory],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const subCategoryParam = params?.subCategory ? `&subCategory=${params.subCategory}` : '';
      const url = `/videos/feed/reels?limit=${limit}${cursor}${subCategoryParam}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { reelsQuery };
};

// ===============================|| GET GENERAL VIDEOS FEED ||============================== //

export const useGetGeneralVideos = (params?: VideosQueryParams) => {
  const videosQuery = useInfiniteQuery<ReelsResponse>({
    queryKey: ["general-videos", params?.subCategory],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const subCategoryParam = params?.subCategory ? `&subCategory=${params.subCategory}` : '';
      const url = `/videos/feed/general?limit=${limit}${cursor}${subCategoryParam}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { videosQuery };
};
