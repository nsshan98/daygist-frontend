"use client";

import { useEffect, useRef, useCallback } from "react";
import { Bookmark, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  useGetSavedPosts,
  useUnsavePost,
} from "@/features/home/hooks/feed-query";
import { SavedPostCard } from "./saved-post-card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function SavedPostsContent() {
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { savedPostsQuery } = useGetSavedPosts();
  const { unsavePostMutation } = useUnsavePost();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = savedPostsQuery;

  // Flatten all pages into a single array
  const savedPosts = data?.pages.flatMap((page) => page.posts) || [];

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  // Handle unsave
  const handleUnsave = (postId: string) => {
    unsavePostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success("Post removed from saved");
        // Invalidate and refetch saved posts
        queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      },
      onError: () => {
        toast.error("Failed to remove post");
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-lg">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-none shadow-lg max-w-md mx-4">
          <CardContent className="py-12 px-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Saved Posts</h3>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </p>
            <Button
              onClick={() => savedPostsQuery.refetch()}
              className="rounded-full px-6"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (savedPosts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-primary" />
              Saved Posts
            </h1>
            <p className="text-muted-foreground mt-2">
              Posts you&apos;ve saved for later
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardContent className="py-16 px-6 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Bookmark className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Saved Posts Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                When you save posts, they&apos;ll appear here so you can easily find
                them later.
              </p>
              <Button asChild className="rounded-full px-6">
                <Link href="/">Browse Posts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" />
            Saved Posts
          </h1>
          <p className="text-muted-foreground mt-2">
            {savedPosts.length} {savedPosts.length === 1 ? "post" : "posts"} saved
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedPosts.map((post) => (
            <SavedPostCard
              key={post._id}
              post={post}
              onUnsave={handleUnsave}
              isUnsaving={unsavePostMutation.isPending}
            />
          ))}
        </div>

        {/* Load More Trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                className="rounded-full"
              >
                Load More
              </Button>
            )}
          </div>
        )}

        {/* End of List */}
        {!hasNextPage && savedPosts.length > 0 && (
          <div className="mt-8 text-center text-muted-foreground text-sm">
            You&apos;ve reached the end of your saved posts
          </div>
        )}
      </div>
    </div>
  );
}
