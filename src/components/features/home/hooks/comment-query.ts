import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ===============================|| TYPES ||============================== //

export interface CommentAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: {
    url: string;
    key: string | null;
    provider: string;
  };
}

export interface Comment {
  _id: string;
  targetType: "post" | "groupPost";
  postId: string;
  author: CommentAuthor;
  parentId: string | null;
  text: string;
  isDeleted: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CommentsResponse {
  ok: boolean;
  items: Comment[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  };
}

export interface CreateCommentPayload {
  text: string;
  type: "post" | "groupPost";
  parentId?: string;
}

export interface CreateCommentResponse {
  ok: boolean;
  comment: Comment;
}

// ===============================|| GET COMMENTS ||============================== //

export const useGetComments = (postId: string, enabled: boolean = true) => {
  const commentsQuery = useInfiniteQuery<CommentsResponse>({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let url = `/comment/${postId}/comments?type=post&limit=${limit}`;
      
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

// ===============================|| CREATE COMMENT ||============================== //

interface CommentContext {
  previousComments: unknown;
}

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation<CreateCommentResponse, Error, CreateCommentPayload, CommentContext>({
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data } = await axiosClient.post(`/comment/${postId}/comments`, payload);
      return data;
    },
    onMutate: async (payload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(["comments", postId]);

      // Optimistically add comment to the list
      queryClient.setQueryData(["comments", postId], (old: any) => {
        if (!old) return old;
        
        // Create optimistic comment
        const optimisticComment: Comment = {
          _id: `temp-${Date.now()}`,
          targetType: payload.type,
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
        queryClient.setQueryData(["comments", postId], context.previousComments);
      }
    },
    onSuccess: (data, payload) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData(["comments", postId], (old: any) => {
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

      // Update comment count in feed
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item.data._id === postId) {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    commentCount: item.data.commentCount + 1,
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
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  return { createCommentMutation };
};

// ===============================|| GET REPLIES ||============================== //

export interface RepliesResponse {
  ok: boolean;
  items: Comment[];
  nextCursor?: {
    createdAt: string;
    _id: string;
  };
}

export const useGetReplies = (commentId: string, enabled: boolean = true) => {
  const repliesQuery = useInfiniteQuery<RepliesResponse>({
    queryKey: ["replies", commentId],
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

