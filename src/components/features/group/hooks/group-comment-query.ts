import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  Comment,
  CommentsResponse,
  RepliesResponse,
  CreateCommentPayload,
  CreateCommentResponse,
} from "@/types";

// ===============================|| GET GROUP POST COMMENTS ||============================== //

export const useGetGroupPostComments = (postId: string, enabled: boolean = true) => {
  const commentsQuery = useInfiniteQuery<CommentsResponse>({
    queryKey: ["group-post-comments", postId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let url = `/comment/${postId}/comments?type=groupPost&limit=${limit}`;
      
      if (pageParam) {
        const cursor = typeof pageParam === 'string' 
          ? pageParam 
          : JSON.stringify(pageParam);
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
      
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor || lastPage.items.length === 0) {
        return undefined;
      }
      return lastPage.nextCursor;
    },
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  return { commentsQuery };
};

// ===============================|| CREATE GROUP POST COMMENT ||============================== //

interface GroupCommentContext {
  previousComments: unknown;
}

export const useCreateGroupPostComment = (postId: string) => {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation<CreateCommentResponse, Error, CreateCommentPayload, GroupCommentContext>({
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data } = await axiosClient.post(`/comment/${postId}/comments`, payload);
      return data;
    },
    onMutate: async (payload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["group-post-comments", postId] });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(["group-post-comments", postId]);

      // Optimistically add comment to the list
      queryClient.setQueryData(["group-post-comments", postId], (old: any) => {
        if (!old) return old;
        
        // Create optimistic comment
        const optimisticComment: Comment = {
          _id: `temp-${Date.now()}`,
          targetType: "groupPost",
          postId: postId,
          author: {
            _id: "temp",
            name: "You",
            username: "you",
          },
          parentId: payload.parentId || null,
          text: payload.text,
          isDeleted: false,
          likeCount: 0,
          replyCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
        };

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Only add to first page for top-level comments
            if (index === 0 && !payload.parentId) {
              return {
                ...page,
                items: [optimisticComment, ...page.items],
              };
            }
            return page;
          }),
        };
      });

      return { previousComments };
    },
    onError: (err, payload, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(["group-post-comments", postId], context.previousComments);
      }
    },
    onSuccess: (data, payload) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData(["group-post-comments", postId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: Comment) => {
              if (item._id.startsWith("temp-")) {
                return data.comment;
              }
              // Update reply count if this was a reply
              if (payload.parentId && item._id === payload.parentId) {
                return {
                  ...item,
                  replyCount: item.replyCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      // Update comment count in group posts
      queryClient.setQueryData(["group-posts"], (old: any) => {
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
                    commentCount: item.counts.commentCount + 1,
                  },
                };
              }
              return item;
            }),
          })),
        };
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["group-post-comments", postId] });
    },
  });

  return { createCommentMutation };
};

// ===============================|| GET GROUP POST REPLIES ||============================== //

export const useGetGroupPostReplies = (commentId: string, enabled: boolean = true) => {
  const repliesQuery = useInfiniteQuery<RepliesResponse>({
    queryKey: ["group-post-replies", commentId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let url = `/comment/${commentId}/replies?limit=${limit}`;
      
      if (pageParam) {
        const cursor = typeof pageParam === 'string' 
          ? pageParam 
          : JSON.stringify(pageParam);
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
      
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor || lastPage.items.length === 0) {
        return undefined;
      }
      return lastPage.nextCursor;
    },
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!commentId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return { repliesQuery };
};

