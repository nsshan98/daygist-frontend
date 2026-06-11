import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { 
  FeedResponse,
  LikeResponse,
  ShareResponse,
  PostDetailResponse,
  SavedPostsResponse,
  MyPostsResponse,
  PhotosResponse,
  ReelsResponse,
  CreatePostPayload,
  EditPostPayload,
} from "@/types";

// Types are now imported from @/types
// See: @/types/models/post.model.ts and @/types/api/feed.types.ts

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
// LikeResponse type imported from @/types

interface LikeContext {
  previousFeed: unknown;
  previousSaved: unknown;
  previousDetail: unknown;
  previousMyReels: unknown;
  previousUserReels: unknown;
  previousAllReels: unknown;
  previousReelsVideos: unknown;
  previousGeneralVideos: unknown;
}

interface LikeVars {
  postId: string;
  reaction?: string;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();

  const likePostMutation = useMutation<LikeResponse, Error, LikeVars, LikeContext>({
    mutationFn: async ({ postId, reaction }) => {
      if (reaction) {
        const { data } = await axiosClient.post(`/posts/${postId}/like`, { reaction });
        return data;
      }
      const { data } = await axiosClient.post(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async ({ postId, reaction }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["saved-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });
      await queryClient.cancelQueries({ queryKey: ["my-reels"] });
      await queryClient.cancelQueries({ queryKey: ["user-reels"] });
      await queryClient.cancelQueries({ queryKey: ["all-reels"] });
      await queryClient.cancelQueries({ queryKey: ["reels-videos"] });
      await queryClient.cancelQueries({ queryKey: ["general-videos"] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousSaved = queryClient.getQueryData(["saved-posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", postId]);
      const previousMyReels = queryClient.getQueryData(["my-reels"]);
      const previousUserReels = queryClient.getQueryData(["user-reels"]);
      const previousAllReels = queryClient.getQueryData(["all-reels"]);
      const previousReelsVideos = queryClient.getQueryData(["reels-videos"]);
      const previousGeneralVideos = queryClient.getQueryData(["general-videos"]);

      const theReaction = reaction || "like";

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
                    reaction: theReaction,
                    likeCount: item.data.likeCount + 1,
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
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: p.likeCount + 1,
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
            isLiked: true,
            reaction: theReaction,
            likeCount: old.post.likeCount + 1,
          },
        };
      });

      queryClient.setQueryData(["my-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: item.likeCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      queryClient.setQueryData(["user-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: item.likeCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      queryClient.setQueryData(["all-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: item.likeCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      queryClient.setQueryData(["reels-videos"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: item.likeCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      queryClient.setQueryData(["general-videos"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: true,
                  reaction: theReaction,
                  likeCount: item.likeCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      return { previousFeed, previousSaved, previousDetail, previousMyReels, previousUserReels, previousAllReels, previousReelsVideos, previousGeneralVideos };
    },
    onError: (err, { postId }, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(["saved-posts"], context.previousSaved);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["post-detail", postId], context.previousDetail);
      }
      if (context?.previousMyReels) {
        queryClient.setQueryData(["my-reels"], context.previousMyReels);
      }
      if (context?.previousUserReels) {
        queryClient.setQueryData(["user-reels"], context.previousUserReels);
      }
      if (context?.previousAllReels) {
        queryClient.setQueryData(["all-reels"], context.previousAllReels);
      }
      if (context?.previousReelsVideos) {
        queryClient.setQueryData(["reels-videos"], context.previousReelsVideos);
      }
      if (context?.previousGeneralVideos) {
        queryClient.setQueryData(["general-videos"], context.previousGeneralVideos);
      }
    },
    onSettled: (data, error, { postId }) => {
      if (data?.data) {
        const { isLiked, likeCount, reaction } = data.data;

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
                      reaction,
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
                    reaction,
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
              reaction,
              likeCount,
            },
          };
        });

        queryClient.setQueryData(["my-reels"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          };
        });

        const userReelsQueries = queryClient.getQueryData(["user-reels"]);
        if (userReelsQueries) {
          queryClient.setQueryData(["user-reels"], {
            ...userReelsQueries,
            pages: (userReelsQueries as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const allReelsQueries = queryClient.getQueryData(["all-reels"]);
        if (allReelsQueries) {
          queryClient.setQueryData(["all-reels"], {
            ...allReelsQueries,
            pages: (allReelsQueries as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const reelsVideosQueries = queryClient.getQueryData(["reels-videos"]);
        if (reelsVideosQueries) {
          queryClient.setQueryData(["reels-videos"], {
            ...reelsVideosQueries,
            pages: (reelsVideosQueries as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const generalVideosQueries = queryClient.getQueryData(["general-videos"]);
        if (generalVideosQueries) {
          queryClient.setQueryData(["general-videos"], {
            ...generalVideosQueries,
            pages: (generalVideosQueries as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }
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
      await queryClient.cancelQueries({ queryKey: ["my-reels"] });
      await queryClient.cancelQueries({ queryKey: ["user-reels"] });
      await queryClient.cancelQueries({ queryKey: ["all-reels"] });
      await queryClient.cancelQueries({ queryKey: ["reels-videos"] });
      await queryClient.cancelQueries({ queryKey: ["general-videos"] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousSaved = queryClient.getQueryData(["saved-posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", postId]);
      const previousMyReels = queryClient.getQueryData(["my-reels"]);
      const previousUserReels = queryClient.getQueryData(["user-reels"]);
      const previousAllReels = queryClient.getQueryData(["all-reels"]);
      const previousReelsVideos = queryClient.getQueryData(["reels-videos"]);
      const previousGeneralVideos = queryClient.getQueryData(["general-videos"]);

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

      // Optimistically update my reels
      queryClient.setQueryData(["my-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: false,
                  likeCount: Math.max(0, item.likeCount - 1),
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update user reels
      queryClient.setQueryData(["user-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: false,
                  likeCount: Math.max(0, item.likeCount - 1),
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update all reels
      queryClient.setQueryData(["all-reels"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: false,
                  likeCount: Math.max(0, item.likeCount - 1),
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update reels videos
      queryClient.setQueryData(["reels-videos"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: false,
                  likeCount: Math.max(0, item.likeCount - 1),
                };
              }
              return item;
            }),
          })),
        };
      });

      // Optimistically update general videos
      queryClient.setQueryData(["general-videos"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item._id === postId) {
                return {
                  ...item,
                  isLiked: false,
                  likeCount: Math.max(0, item.likeCount - 1),
                };
              }
              return item;
            }),
          })),
        };
      });

      return { previousFeed, previousSaved, previousDetail, previousMyReels, previousUserReels, previousAllReels, previousReelsVideos, previousGeneralVideos };
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
      if (context?.previousMyReels) {
        queryClient.setQueryData(["my-reels"], context.previousMyReels);
      }
      if (context?.previousUserReels) {
        queryClient.setQueryData(["user-reels"], context.previousUserReels);
      }
      if (context?.previousAllReels) {
        queryClient.setQueryData(["all-reels"], context.previousAllReels);
      }
      if (context?.previousReelsVideos) {
        queryClient.setQueryData(["reels-videos"], context.previousReelsVideos);
      }
      if (context?.previousGeneralVideos) {
        queryClient.setQueryData(["general-videos"], context.previousGeneralVideos);
      }
    },
    onSettled: (data, error, postId) => {
      if (data?.data) {
        const { isLiked, likeCount, reaction } = data.data;
        
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
                      reaction,
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
                    reaction,
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
              reaction,
              likeCount,
            },
          };
        });

        queryClient.setQueryData(["my-reels"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          };
        });

        const userReelsData = queryClient.getQueryData(["user-reels"]);
        if (userReelsData) {
          queryClient.setQueryData(["user-reels"], {
            ...userReelsData,
            pages: (userReelsData as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const allReelsData = queryClient.getQueryData(["all-reels"]);
        if (allReelsData) {
          queryClient.setQueryData(["all-reels"], {
            ...allReelsData,
            pages: (allReelsData as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const reelsVideosData = queryClient.getQueryData(["reels-videos"]);
        if (reelsVideosData) {
          queryClient.setQueryData(["reels-videos"], {
            ...reelsVideosData,
            pages: (reelsVideosData as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }

        const generalVideosData = queryClient.getQueryData(["general-videos"]);
        if (generalVideosData) {
          queryClient.setQueryData(["general-videos"], {
            ...generalVideosData,
            pages: (generalVideosData as any).pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => {
                if (item._id === postId) {
                  return {
                    ...item,
                    isLiked,
                    reaction,
                    likeCount,
                  };
                }
                return item;
              }),
            })),
          });
        }
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
// ShareResponse imported from @/types

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
// CreatePostPayload types imported from @/types/api/post.types.ts

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
// EditPostPayload imported from @/types

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
// PostDetailResponse imported from @/types

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
// SavedPost and SavedPostsResponse imported from @/types

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
      let cursor = "";
      if (pageParam) {
        const cursorValue = typeof pageParam === 'string' 
          ? pageParam 
          : JSON.stringify(pageParam);
        cursor = `&cursor=${encodeURIComponent(cursorValue)}`;
      }
      const url = `/posts/me/saved/list?limit=${limit}${cursor}`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    getNextPageParam: (lastPage) => {
      // Use nextCursor from API response to determine if there are more pages
      if (!lastPage.nextCursor || lastPage.posts.length === 0) {
        return undefined;
      }
      return lastPage.nextCursor;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return { savedPostsQuery };
};

// ===============================|| GET MY PHOTOS ||============================== //

export const useGetMyPhotos = () => {
  const myPhotosQuery = useInfiniteQuery<PhotosResponse>({
    queryKey: ["my-photos"],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/me/photos?limit=${limit}${cursor}`;
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

  return { myPhotosQuery };
};

// ===============================|| GET USER PHOTOS BY ID ||============================== //

export const useGetUserPhotosById = (userId: string) => {
  const userPhotosQuery = useInfiniteQuery<PhotosResponse>({
    queryKey: ["user-photos", userId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/${userId}/photos?limit=${limit}${cursor}`;
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

  return { userPhotosQuery };
};

// ===============================|| GET MY REELS ||============================== //

export const useGetMyReels = () => {
  const myReelsQuery = useInfiniteQuery<ReelsResponse>({
    queryKey: ["my-reels"],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/me/reels?limit=${limit}${cursor}`;
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

  return { myReelsQuery };
};

// ===============================|| GET USER REELS BY ID ||============================== //

export const useGetUserReelsById = (userId: string) => {
  const userReelsQuery = useInfiniteQuery<ReelsResponse>({
    queryKey: ["user-reels", userId],
    queryFn: async ({ pageParam }) => {
      const limit = 20;
      let cursor = "";
      if (pageParam) {
        if (typeof pageParam === 'object') {
          cursor = `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}`;
        }
      }
      const url = `/users/${userId}/reels?limit=${limit}${cursor}`;
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

  return { userReelsQuery };
};