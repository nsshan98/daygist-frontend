import { axiosClient } from "@/lib/axios-client";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateGroupPostPayload,
  EditGroupPostPayload,
  GroupPostsResponse,
  GroupPostDetailResponse,
  GroupPostLikeResponse,
  GroupPostShareResponse,
} from "@/types";

interface GroupPostContext {
  previousGroupPosts: unknown;
  previousGroupPostDetail: unknown;
}

// ===============================|| CREATE GROUP POST ||============================== //
export const useCreateGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const createGroupPostMutation = useMutation({
    mutationFn: async (payload: CreateGroupPostPayload) => {
      const { data } = await axiosClient.post(`/groups/${groupId}/posts`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-details", groupId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  return { createGroupPostMutation };
};

// ===============================|| GET GROUP POSTS ||============================== //
export const useGetGroupPosts = (groupId: string) => {
  const groupPostsQuery = useInfiniteQuery<GroupPostsResponse>({
    queryKey: ["group-posts", groupId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
      }
      const { data } = await axiosClient.get(`/groups/${groupId}/posts?limit=${limit}${cursor}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { groupPostsQuery };
};

// ===============================|| GET GROUP POST DETAIL ||============================== //
export const useGetGroupPostDetail = (groupId: string, postId: string) => {
  const groupPostDetailQuery = useQuery<GroupPostDetailResponse>({
    queryKey: ["group-post-detail", groupId, postId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/groups/${groupId}/posts/${postId}`);
      return data;
    },
    enabled: !!groupId && !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { groupPostDetailQuery };
};

// ===============================|| UPDATE GROUP POST ||============================== //
export const useUpdateGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const updateGroupPostMutation = useMutation({
    mutationFn: async ({ postId, payload }: { postId: string; payload: EditGroupPostPayload }) => {
      const { data } = await axiosClient.patch(`/groups/${groupId}/posts/${postId}`, payload);
      return data;
    },
    onSuccess: (_, { postId }) => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-post-detail", groupId, postId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  return { updateGroupPostMutation };
};

// ===============================|| DELETE GROUP POST ||============================== //
export const useDeleteGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const deleteGroupPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.delete(`/groups/${groupId}/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-details", groupId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  return { deleteGroupPostMutation };
};

interface GroupPostLikeVars {
  postId: string;
  reaction?: string;
}

// ===============================|| LIKE GROUP POST ||============================== //
export const useLikeGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const likeGroupPostMutation = useMutation<GroupPostLikeResponse, Error, GroupPostLikeVars, GroupPostContext>({
    mutationFn: async ({ postId, reaction }) => {
      if (reaction) {
        const { data } = await axiosClient.post(`/groups/${postId}/like`, { reaction });
        return data;
      }
      const { data } = await axiosClient.post(`/groups/${postId}/like`);
      return data;
    },
    onMutate: async ({ postId, reaction }) => {
      await queryClient.cancelQueries({ queryKey: ["group-posts", groupId] });
      await queryClient.cancelQueries({ queryKey: ["group-post-detail", groupId, postId] });

      const previousGroupPosts = queryClient.getQueryData(["group-posts", groupId]);
      const previousGroupPostDetail = queryClient.getQueryData(["group-post-detail", groupId, postId]);

      const theReaction = reaction || "like";

      queryClient.setQueryData(["group-posts", groupId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  counts: {
                    ...item.counts,
                    likeCount: item.counts.likeCount + 1,
                  },
                  isLiked: true,
                  reaction: theReaction,
                };
              }
              return item;
            }),
          })),
        };
      });

      queryClient.setQueryData(["group-post-detail", groupId, postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          item: {
            ...old.item,
            counts: {
              ...old.item.counts,
              likeCount: old.item.counts.likeCount + 1,
            },
            isLiked: true,
            reaction: theReaction,
          },
        };
      });

      return { previousGroupPosts, previousGroupPostDetail };
    },
    onError: (err, { postId }, context) => {
      if (context?.previousGroupPosts) {
        queryClient.setQueryData(["group-posts", groupId], context.previousGroupPosts);
      }
      if (context?.previousGroupPostDetail) {
        queryClient.setQueryData(["group-post-detail", groupId, postId], context.previousGroupPostDetail);
      }
    },
    onSettled: (data, error, { postId }) => {
      if (data?.data) {
        const { isLiked, likeCount, reaction } = data.data;

        queryClient.setQueryData(["group-posts", groupId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    counts: {
                      ...item.counts,
                      likeCount,
                    },
                    isLiked,
                    reaction,
                  };
                }
                return item;
              }),
            })),
          };
        });

        queryClient.setQueryData(["group-post-detail", groupId, postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            item: {
              ...old.item,
              counts: {
                ...old.item.counts,
                likeCount,
              },
              isLiked,
              reaction,
            },
          };
        });
      }
    },
  });

  return { likeGroupPostMutation };
};

// ===============================|| UNLIKE GROUP POST ||============================== //
export const useUnlikeGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const unlikeGroupPostMutation = useMutation<GroupPostLikeResponse, Error, string, GroupPostContext>({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.delete(`/groups/${postId}/like`);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["group-posts", groupId] });
      await queryClient.cancelQueries({ queryKey: ["group-post-detail", groupId, postId] });

      const previousGroupPosts = queryClient.getQueryData(["group-posts", groupId]);
      const previousGroupPostDetail = queryClient.getQueryData(["group-post-detail", groupId, postId]);

      // Optimistically update group posts
      queryClient.setQueryData(["group-posts", groupId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  counts: {
                    ...item.counts,
                    likeCount: Math.max(0, item.counts.likeCount - 1),
                  },
                  isLiked: false,
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update group post detail
      queryClient.setQueryData(["group-post-detail", groupId, postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          item: {
            ...old.item,
            counts: {
              ...old.item.counts,
              likeCount: Math.max(0, old.item.counts.likeCount - 1),
            },
            isLiked: false,
          },
        };
      });

      return { previousGroupPosts, previousGroupPostDetail };
    },
    onError: (err, postId, context) => {
      if (context?.previousGroupPosts) {
        queryClient.setQueryData(["group-posts", groupId], context.previousGroupPosts);
      }
      if (context?.previousGroupPostDetail) {
        queryClient.setQueryData(["group-post-detail", groupId, postId], context.previousGroupPostDetail);
      }
    },
    onSettled: (data, error, postId) => {
      if (data?.data) {
        const { isLiked, likeCount, reaction } = data.data;

        queryClient.setQueryData(["group-posts", groupId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    counts: {
                      ...item.counts,
                      likeCount,
                    },
                    isLiked,
                    reaction,
                  };
                }
                return item;
              }),
            })),
          };
        });

        queryClient.setQueryData(["group-post-detail", groupId, postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            item: {
              ...old.item,
              counts: {
                ...old.item.counts,
                likeCount,
              },
              isLiked,
              reaction,
            },
          };
        });
      }
    },
  });

  return { unlikeGroupPostMutation };
};

// ===============================|| SHARE GROUP POST ||============================== //
export const useShareGroupPost = (groupId: string) => {
  const queryClient = useQueryClient();

  const shareGroupPostMutation = useMutation<GroupPostShareResponse, Error, string>({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/groups/${postId}/share`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    },
  });

  return { shareGroupPostMutation };
};
