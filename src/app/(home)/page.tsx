"use client";

import { useEffect, useRef, useState } from "react";
import {
  FeedPost,
  CreatePost,
  Suggestions,
  Sidebar,
  CommentDialog,
  FeedItem,
} from "@/components/features/home";
import { Card, CardContent } from "@/components/atoms/card";
import { useGetFeed, useLikePost, useSavePost, useSharePost, useUnlikePost, useUnsavePost } from "@/components/features/home/hooks/feed-query";
import { useGetUserProfile } from "@/components/features/profile/hooks/profile-query";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/atoms/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

// Mock data for suggestions (can be replaced with real API later)
const mockSuggestions = [
  { id: 1, name: "Emily Rodriguez", username: "emily_r", avatar: "/placeholder-user-4.jpg", mutual: "3 mutual friends" },
  { id: 2, name: "Alex Thompson", username: "alex_t", avatar: "/placeholder-user-5.jpg", mutual: "5 mutual friends" },
  { id: 3, name: "Creative Studio", username: "creative_studio", avatar: "/placeholder-user-6.jpg", mutual: "Trending" },
];

// Loading skeleton for feed posts
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

export default function Home() {
  const { 
    feedQuery, 
  } = useGetFeed();
  
  const { likePostMutation } = useLikePost();
  const { savePostMutation } = useSavePost();
  const { sharePostMutation } = useSharePost();
  const { unsavePostMutation } = useUnsavePost();
  const { unlikePostMutation } = useUnlikePost();

  // Comment dialog state
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<FeedItem | null>(null);

  // Get current user profile for avatar in comment dialog
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

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap((page: any) => page.items) || [];
  
  // Debug logging
  useEffect(() => {
    console.log('Feed data changed:', {
      pagesCount: data?.pages?.length,
      totalPosts: posts.length,
      hasNextPage,
      isFetchingNextPage,
      lastPageCursor: data?.pages[data?.pages.length - 1]?.nextCursor
    });
  }, [data, posts.length, hasNextPage, isFetchingNextPage]);

  // Infinite scroll handler
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

  // Handle like action
  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  // Handle save action
  const handleSave = (postId: string) => {
    savePostMutation.mutate(postId);
  };

  // Handle like/unlike for comment dialog
  const handleLikeToggle = (postId: string) => {
    const post = posts.find((item: FeedItem) => item.data._id === postId);
    if (post) {
      if (post.data.isLiked) {
        unlikePostMutation.mutate(postId);
      } else {
        likePostMutation.mutate(postId);
      }
    }
  };

  // Handle save/unsave for comment dialog
  const handleSaveToggle = (postId: string) => {
    const post = posts.find((item: FeedItem) => item.data._id === postId);
    if (post) {
      if (post.data.isSaved) {
        unsavePostMutation.mutate(postId);
      } else {
        savePostMutation.mutate(postId);
      }
    }
  };

  // Handle share action
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

  // Handle comment action
  const handleComment = (postId: string) => {
    const postItem = posts.find((item: FeedItem) => item.data._id === postId);
    if (postItem) {
      setSelectedPostForComment(postItem);
      setIsCommentDialogOpen(true);
    }
  };

  // Error state
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
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Sidebar - Navigation (Hidden on mobile) */}
          <div className="hidden xl:block xl:col-span-3">
            <Sidebar />
          </div>

          {/* Center Feed */}
          <div className="xl:col-span-6 col-span-1">

            {/* Create Post */}
            <div className="mb-8">
              <CreatePost />
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {/* Initial loading state */}
              {isLoading && (
                <>
                  <FeedSkeleton />
                  <FeedSkeleton />
                  <FeedSkeleton />
                </>
              )}

              {/* Empty state */}
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

              {/* Feed posts */}
              {posts.map((item: any) => (
                <FeedPost
                  key={item.data._id}
                  post={item}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShare={handleShare}
                  onComment={handleComment}
                />
              ))}

              {/* Load more indicator */}
              {isFetchingNextPage && (
                <div className="py-8 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-10" />

              {/* No more posts message */}
              {!hasNextPage && posts.length > 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  You're all caught up! Check back later for more posts.
                </div>
              )}
            </div>
          </div>

          {/* Comment Dialog */}
          <CommentDialog
            post={selectedPostForComment}
            open={isCommentDialogOpen}
            onOpenChange={setIsCommentDialogOpen}
            onLikeToggle={handleLikeToggle}
            onSaveToggle={handleSaveToggle}
            isLiking={likePostMutation.isPending || unlikePostMutation.isPending}
            isSaving={savePostMutation.isPending || unsavePostMutation.isPending}
            currentUser={currentUser ? {
              name: currentUser.name,
              avatar: currentUser.avatar
            } : null}
          />

          {/* Right Sidebar - Suggestions (Hidden on mobile/tablet) */}
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
