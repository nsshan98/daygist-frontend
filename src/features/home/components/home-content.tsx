"use client";

import { useEffect, useRef, useState } from "react";
import {
  FeedPost,
  CreatePost,
  Suggestions,
  Sidebar,
  PostModal,
  FeedItem,
} from "@/features/home";
import {
  StoryFeed,
  CreateStoryDialog,
} from "@/features/story";
import { Card, CardContent } from "@/components/atoms/card";
import { useGetFeed, useLikePost, useSavePost, useSharePost } from "@/features/home/hooks/feed-query";
import { useGetUserProfile } from "@/features/profile/hooks/profile-query";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/atoms/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/molecules/animated-background";

interface PostUser {
  name: string;
  username: string;
  avatar: string;
}

interface Post {
  id: number;
  user: PostUser;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
}

const mockSuggestions = [
  { id: 1, _id: "suggestion1", name: "Emily Rodriguez", username: "emily_r", avatar: "/placeholder-user-4.jpg", mutual: "3 mutual friends" },
  { id: 2, _id: "suggestion2", name: "Alex Thompson", username: "alex_t", avatar: "/placeholder-user-5.jpg", mutual: "5 mutual friends" },
  { id: 3, _id: "suggestion3", name: "Creative Studio", username: "creative_studio", avatar: "/placeholder-user-6.jpg", mutual: "Trending" },
];

function FeedSkeleton() {
  return (
    <Card className="border-none shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function HomeContent() {
  const { 
    feedQuery, 
  } = useGetFeed();
  
  const { likePostMutation } = useLikePost();
  const { savePostMutation } = useSavePost();
  const { sharePostMutation } = useSharePost();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    isError,
    error,
    refetch 
  } = feedQuery;

  const posts = data?.pages.flatMap((page: any) => page.items) || [];

  const selectedPostForModal = selectedPostId
    ? posts.find((item: FeedItem) => item.data._id === selectedPostId) ?? null
    : null;
  
  useEffect(() => {
    console.log('Feed data changed:', {
      pagesCount: data?.pages?.length,
      totalPosts: posts.length,
      hasNextPage,
      isFetchingNextPage,
      lastPageCursor: data?.pages[data?.pages.length - 1]?.nextCursor
    });
  }, [data, posts.length, hasNextPage, isFetchingNextPage]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = (postId: string) => {
    likePostMutation.mutate({ postId });
  };

  const handleSave = (postId: string) => {
    savePostMutation.mutate(postId);
  };

  const handleShare = (postId: string) => {
    sharePostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success("Post shared successfully");
      },
      onError: () => {
        toast.error("Failed to share post");
      },
    });
  };

  const handleOpenPost = (post: FeedItem) => {
    setSelectedPostId(post.data._id);
    setIsPostModalOpen(true);
    window.dispatchEvent(new Event("feed:pause-videos"));
  };

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
    setIsPostModalOpen(true);
    window.dispatchEvent(new Event("feed:pause-videos"));
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-4 border-none shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-bold">Failed to Load Feed</h2>
            <p className="text-muted-foreground">
              {(error as Error).message || "Something went wrong. Please try again."}
            </p>
            <Button 
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <AnimatedBackground />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          <div className="hidden xl:block xl:col-span-3">
            <Sidebar />
          </div>

          <div className="xl:col-span-6 col-span-1">
            <div className="mb-8">
              <StoryFeed />
            </div>

            <div className="mb-8">
              <CreatePost />
            </div>

            <div className="space-y-6">
              {isLoading && (
                <>
                  <FeedSkeleton />
                  <FeedSkeleton />
                  <FeedSkeleton />
                </>
              )}

              {!isLoading && posts.length === 0 && (
                <Card className="border-none shadow-xl">
                  <CardContent className="p-12 text-center space-y-4">
                    <div className="text-6xl">📝</div>
                    <h3 className="text-xl font-semibold">No Posts Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share something!
                    </p>
                  </CardContent>
                </Card>
              )}

              {posts.map((item: any) => (
                <FeedPost
                  key={item.data._id}
                  post={item}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShare={handleShare}
                  onComment={handleComment}
                  onOpen={handleOpenPost}
                />
              ))}

              {isFetchingNextPage && (
                <div className="py-8 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}

              <div ref={loadMoreRef} className="h-10" />

              {!hasNextPage && posts.length > 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  You're all caught up! Check back later for more posts.
                </div>
              )}
            </div>
          </div>

          <PostModal
            post={selectedPostForModal}
            open={isPostModalOpen}
            onOpenChange={setIsPostModalOpen}
            currentUser={currentUser ? {
              _id: currentUser._id,
              name: currentUser.name,
              username: currentUser.username,
              avatar: currentUser.avatar
            } : null}
          />

          <CreateStoryDialog />

          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-8 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto pr-1">
              <Suggestions suggestions={mockSuggestions} />

              <Card className="border-none shadow-lg">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Help</a>
                    <a href="#" className="hover:underline">Press</a>
                    <a href="#" className="hover:underline">API</a>
                    <a href="#" className="hover:underline">Jobs</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    © 2026 Daygist, Inc.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
