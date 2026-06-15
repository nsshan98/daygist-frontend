import { axiosClient } from "@/lib/api/axios-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FollowListItem, FollowListResponse } from "@/types";

// Follow types imported from @/types/api/follow.types.ts

// ===============================|| FOLLOW USER ||============================== //
const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  const followUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axiosClient.post(`/follow/${userId}`);
      return data;
    },
    onSuccess: (_, userId) => {
      toast.success("Followed successfully");
      // Invalidate user profile queries and feed
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["followers-list"] });
      queryClient.invalidateQueries({ queryKey: ["following-list"] });
    },
  });
  return { followUserMutation };
};

// ===============================|| UNFOLLOW USER ||============================== //
const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  const unfollowUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axiosClient.delete(`/follow/${userId}`);
      return data;
    },
    onSuccess: (_, userId) => {
      toast.success("Unfollowed successfully");
      // Invalidate user profile queries and feed
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["followers-list"] });
      queryClient.invalidateQueries({ queryKey: ["following-list"] });
    },
  });
  return { unfollowUserMutation };
};

// ===============================|| GET FOLLOWERS LIST ||============================== //
const useGetFollowersList = (userId: string, searchQuery?: string) => {
  const followersQuery = useQuery({
    queryKey: ["followers-list", userId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      
      const { data } = await axiosClient.get<FollowListResponse>(
        `/follow/${userId}/followers?${params.toString()}`
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  return { followersQuery };
};

// ===============================|| GET FOLLOWING LIST ||============================== //
const useGetFollowingList = (userId: string, searchQuery?: string) => {
  const followingQuery = useQuery({
    queryKey: ["following-list", userId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      
      const { data } = await axiosClient.get<FollowListResponse>(
        `/follow/${userId}/following?${params.toString()}`
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  return { followingQuery };
};

export { useFollowUser, useUnfollowUser, useGetFollowersList, useGetFollowingList };
