import { axiosClient } from "@/lib/api/axios-client";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateGroupPayload,
  CreateGroupResponse,
  JoinGroupResponse,
  ForYouGroupsResponse,
  MyGroupsResponse,
  GroupDetailsResponse,
} from "@/types";

// ===============================|| CREATE GROUP ||============================== //
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (payload: CreateGroupPayload): Promise<CreateGroupResponse> => {
      const { data } = await axiosClient.post("/groups/create", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Group created successfully");
      queryClient.invalidateQueries({ queryKey: ["for-you-groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  return { createGroupMutation };
};

// ===============================|| JOIN GROUP ||============================== //
export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string): Promise<JoinGroupResponse> => {
      const { data } = await axiosClient.post(`/groups/${groupId}/join`);
      return data;
    },
    onSuccess: (_, groupId) => {
      toast.success("Joined group successfully");
      queryClient.invalidateQueries({ queryKey: ["group-details", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to join group");
    },
  });

  return { joinGroupMutation };
};

// ===============================|| GET FOR YOU GROUPS ||============================== //
export const useGetForYouGroups = () => {
  const forYouGroupsQuery = useInfiniteQuery<ForYouGroupsResponse>({
    queryKey: ["for-you-groups"],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      let cursor = "";
      if (pageParam) {
        cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
      }
      const { data } = await axiosClient.get(`/groups/for-you?limit=${limit}${cursor}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { score: number; createdAt: string; _id: string } | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { forYouGroupsQuery };
};

// ===============================|| GET MY GROUPS ||============================== //
export const useGetMyGroups = () => {
  const myGroupsQuery = useInfiniteQuery<MyGroupsResponse>({
    queryKey: ["my-groups"],
    queryFn: async ({ pageParam }) => {
      let cursor = "";
      if (pageParam) {
        cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
      }
      const { data } = await axiosClient.get(`/groups/my?limit=20${cursor}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { section: number; createdAt: string; _id: string } | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { myGroupsQuery };
};

// ===============================|| GET GROUP DETAILS ||============================== //
export const useGetGroupDetails = (groupId: string) => {
  const groupDetailsQuery = useQuery<GroupDetailsResponse>({
    queryKey: ["group-details", groupId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/groups/${groupId}/group-details`);
      return data;
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { groupDetailsQuery };
};
