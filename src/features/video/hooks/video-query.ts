import { axiosClient } from "@/lib/api/axios-client";
import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  UploadLongVideoPayload,
  UploadLongVideoResponse,
  UserVideosResponse,
  VideoSearchResponse,
} from "@/types";

// ===============================|| UPLOAD LONG VIDEO ||============================== //

export const useUploadLongVideo = () => {
  const queryClient = useQueryClient();
  const uploadLongVideoMutation = useMutation<
    UploadLongVideoResponse,
    Error,
    UploadLongVideoPayload
  >({
    mutationFn: async (payload: UploadLongVideoPayload) => {
      const { data } = await axiosClient.post("/videos/video/upload", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Long video uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["user-videos"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload long video");
    },
  });

  return { uploadLongVideoMutation };
};

// ===============================|| GET USER VIDEOS ||============================== //

export const useGetUserVideos = () => {
  const userVideosQuery = useInfiniteQuery<UserVideosResponse>({
    queryKey: ["user-videos"],
    queryFn: async ({ pageParam }) => {
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === "object") {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const { data } = await axiosClient.get(`/users/videos/me?limit=10${cursor}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });

  return { userVideosQuery };
};

// ===============================|| SEARCH VIDEOS ||============================== //

export const useSearchVideos = (query: string) => {
  const searchVideosQuery = useQuery<VideoSearchResponse>({
    queryKey: ["video-search", query],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/videos/search?q=${encodeURIComponent(query)}`
      );
      return data;
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return { searchVideosQuery };
};
