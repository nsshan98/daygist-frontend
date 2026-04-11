import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { UploadResponse } from "./upload-query";

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
  isFollowing?: boolean;
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
  feeling: string | null;
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
  isSaved: boolean;
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
export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    isLiked: boolean;
    likeCount: number;
  };
}

interface LikeContext {
  previousFeed: unknown;
  previousSaved: unknown;
  previousDetail: unknown;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();

  const likePostMutation = useMutation<LikeResponse, Error, string, LikeContext>({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["saved-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousSaved = queryClient.getQueryData(["saved-posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", postId]);

      // Optimistically update feed
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
                    isLiked: true,
                    likeCount: item.data.likeCount + 1,
                  },
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update saved posts
      queryClient.setQueryData(["saved-posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p._id === postId) {
                return {
                  ...p,
                  isLiked: true,
                  likeCount: p.likeCount + 1,
                };
              }
              return p;
            }),
          })),
        };
      });

      // Optimistically update post detail
      queryClient.setQueryData(["post-detail", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          post: {
            ...old.post,
            isLiked: true,
            likeCount: old.post.likeCount + 1,
          },
        };
      });

      return { previousFeed, previousSaved, previousDetail };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(["saved-posts"], context.previousSaved);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["post-detail", postId], context.previousDetail);
      }
    },
    onSettled: (data, error, postId) => {
      // Sync with server response
      if (data?.data) {
        const { isLiked, likeCount } = data.data;
        
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
                      isLiked,
                      likeCount,
                    },
                  };
                }
                return item;
              }),
            })),
          };
        });

        queryClient.setQueryData(["saved-posts"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) => {
                if (p._id === postId) {
                  return {
                    ...p,
                    isLiked,
                    likeCount,
                  };
                }
                return p;
              }),
            })),
          };
        });

        queryClient.setQueryData(["post-detail", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            post: {
              ...old.post,
              isLiked,
              likeCount,
            },
          };
        });
      }
    },
  });

  return { likePostMutation };
};

// ===============================|| UNLIKE POST ||============================== //
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  const unlikePostMutation = useMutation<LikeResponse, Error, string, LikeContext>({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.delete(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["saved-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousSaved = queryClient.getQueryData(["saved-posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", postId]);

      // Optimistically update feed
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
                    isLiked: false,
                    likeCount: Math.max(0, item.data.likeCount - 1),
                  },
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update saved posts
      queryClient.setQueryData(["saved-posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p._id === postId) {
                return {
                  ...p,
                  isLiked: false,
                  likeCount: Math.max(0, p.likeCount - 1),
                };
              }
              return p;
            }),
          })),
        };
      });

      // Optimistically update post detail
      queryClient.setQueryData(["post-detail", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          post: {
            ...old.post,
            isLiked: false,
            likeCount: Math.max(0, old.post.likeCount - 1),
          },
        };
      });

      return { previousFeed, previousSaved, previousDetail };
    },
    onError: (err, postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(["saved-posts"], context.previousSaved);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["post-detail", postId], context.previousDetail);
      }
    },
    onSettled: (data, error, postId) => {
      if (data?.data) {
        const { isLiked, likeCount } = data.data;
        
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
                      isLiked,
                      likeCount,
                    },
                  };
                }
                return item;
              }),
            })),
          };
        });

        queryClient.setQueryData(["saved-posts"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) => {
                if (p._id === postId) {
                  return {
                    ...p,
                    isLiked,
                    likeCount,
                  };
                }
                return p;
              }),
            })),
          };
        });

        queryClient.setQueryData(["post-detail", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            post: {
              ...old.post,
              isLiked,
              likeCount,
            },
          };
        });
      }
    },
  });

  return { unlikePostMutation };
};

// ===============================|| SAVE POST ||============================== //
export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  const savePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/save`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
  return { savePostMutation };
};

// ===============================|| UNSAVE POST ||============================== //
export const useUnsavePost = () => {
  const queryClient = useQueryClient();
  
  const unsavePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.delete(`/posts/${postId}/save`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
  return { unsavePostMutation };
};

// ===============================|| SHARE POST ||============================== //
export interface ShareResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    isShared: boolean;
    shareCount: number;
  };
}

interface ShareContext {
  previousFeed: unknown;
  previousSaved: unknown;
  previousDetail: unknown;
}

export const useSharePost = () => {
  const queryClient = useQueryClient();

  const sharePostMutation = useMutation<ShareResponse, Error, string, ShareContext>({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.post(`/posts/${postId}/share`);
      return data;
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["saved-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousSaved = queryClient.getQueryData(["saved-posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", postId]);

      // Optimistically update feed
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
                    isShared: true,
                    shareCount: item.data.shareCount + 1,
                  },
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update saved posts
      queryClient.setQueryData(["saved-posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p._id === postId) {
                return {
                  ...p,
                  isShared: true,
                  shareCount: p.shareCount + 1,
                };
              }
              return p;
            }),
          })),
        };
      });

      // Optimistically update post detail
      queryClient.setQueryData(["post-detail", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          post: {
            ...old.post,
            isShared: true,
            shareCount: old.post.shareCount + 1,
          },
        };
      });

      return { previousFeed, previousSaved, previousDetail };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(["saved-posts"], context.previousSaved);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["post-detail", postId], context.previousDetail);
      }
    },
    onSettled: (data, error, postId) => {
      // Sync with server response
      if (data?.data) {
        const { isShared, shareCount } = data.data;
        
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
                      isShared,
                      shareCount,
                    },
                  };
                }
                return item;
              }),
            })),
          };
        });

        queryClient.setQueryData(["saved-posts"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) => {
                if (p._id === postId) {
                  return {
                    ...p,
                    isShared,
                    shareCount,
                  };
                }
                return p;
              }),
            })),
          };
        });

        queryClient.setQueryData(["post-detail", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            post: {
              ...old.post,
              isShared,
              shareCount,
            },
          };
        });
      }
    },
  });

  return { sharePostMutation };
};

// ===============================|| CREATE TEXT POST ||============================== //
export interface CreateTextPostPayload {
  type: "text";
  privacy: string;
  text: string;
  feeling?: string | null;
  backgroundUrl?: string;
  textStyle?: {
    color: string;
    fontSize: number;
    fontWeight: string;
    align: string;
  };
}

export interface CreateImagePostPayload {
  type: "image";
  privacy: string;
  caption: string;
  layout: string;
  images: {
    url: string;
    provider: string;
    key: string;
    width?: number;
    height?: number;
  }[];
  subCategory?: string;
}

export interface CreateVideoPostPayload {
  type: "video";
  privacy: string;
  caption: string;
  videoMode: string;
  category: string;
  subCategory?: string;
  mutedByDefault: boolean;
  loop: boolean;
  video: {
    url: string;
    thumbnailUrl?: string;
    provider: string;
    key: string;
    durationSec?: number;
    width?: number;
    height?: number;
  };
}

export type CreatePostPayload = CreateTextPostPayload | CreateImagePostPayload | CreateVideoPostPayload;

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const { data } = await axiosClient.post("/posts/create", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate feed query to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return { createPostMutation };
};

// ===============================|| EDIT POST ||============================== //
export interface EditPostPayload {
  text?: string;
  privacy?: string;
  feeling?: string | null;
  backgroundUrl?: string;
  textStyle?: {
    color: string;
    fontSize: number;
    fontWeight?: string;
    align?: string;
  };
  layout?: string;
}

export const useEditPost = () => {
  const queryClient = useQueryClient();
  
  const editPostMutation = useMutation({
    mutationFn: async ({ postId, payload }: { postId: string; payload: EditPostPayload }) => {
      const { data } = await axiosClient.patch(`/users/me/posts/${postId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });

  return { editPostMutation };
};

// ===============================|| DELETE POST ||============================== //
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axiosClient.delete(`/users/me/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });

  return { deletePostMutation };
};

// ===============================|| GET POST DETAIL ||============================== //
export interface PostDetailResponse {
  success: boolean;
  post: FeedPostData & {
    description: string;
    category: string;
    subCategory: string;
    isDeleted: boolean;
    viewCount: number;
  };
  shareLink: string;
}

export const useGetPostDetail = (postId: string) => {
  const postDetailQuery = useQuery<PostDetailResponse>({
    queryKey: ["post-detail", postId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return { postDetailQuery };
};

// ===============================|| GET SAVED POSTS ||============================== //
export interface SavedPost {
  _id: string;
  author: FeedAuthor;
  type: "image" | "video" | "text";
  privacy: string;
  text: string;
  feeling: string | null;
  description: string;
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
  category: string;
  subCategory: string;
  isDeleted: boolean;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface SavedPostsResponse {
  success: boolean;
  page: number;
  limit: number;
  posts: SavedPost[];
}

export interface MyPostsResponse {
  success: boolean;
  items: FeedPostData[];
  nextCursor?: { createdAt: string; _id: string };
}

export const useGetMyPosts = () => {
  const myPostsQuery = useInfiniteQuery<MyPostsResponse>({
    queryKey: ["my-posts"],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/me/posts?limit=${limit}${cursor}`;
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

  return { myPostsQuery };
};

export const useGetUserPostsById = (userId: string) => {
  const userPostsQuery = useInfiniteQuery<MyPostsResponse>({
    queryKey: ["user-posts", userId],
    queryFn: async ({ pageParam }) => {
      const limit = 10;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/${userId}/posts?limit=${limit}${cursor}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: undefined as { createdAt: string; _id: string } | undefined,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { userPostsQuery };
};

export const useGetSavedPosts = () => {
  const savedPostsQuery = useInfiniteQuery<SavedPostsResponse>({
    queryKey: ["saved-posts"],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      const page = pageParam ? (typeof pageParam === 'number' ? pageParam : 1) : 1;
      const url = `/posts/me/saved/list?page=${page}&limit=${limit}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.posts.length < lastPage.limit) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return { savedPostsQuery };
};