"use client";

import { useEffect, useRef } from "react";
import { GroupCard } from "./group-card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { RefreshCw, Users2 } from "lucide-react";
import { useGetForYouGroups, useGetMyGroups } from "../hooks/group-query";
import type { ForYouGroup, Group } from "@/types";

interface GroupListProps {
  type: "for-you" | "my-groups";
}

function GroupCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function GroupList({ type }: GroupListProps) {
  const { forYouGroupsQuery } = useGetForYouGroups();
  const { myGroupsQuery } = useGetMyGroups();

  const query = type === "for-you" ? forYouGroupsQuery : myGroupsQuery;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    query as any;

  // Flatten all pages into a single array
  const groups = data?.pages.flatMap((page: any) => page.items) || [];

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <Users2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load groups</h3>
          <p className="text-muted-foreground mb-4">
            Something went wrong. Please try again.
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <Users2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {type === "for-you" ? "No groups recommended" : "You haven't joined any groups yet"}
          </h3>
          <p className="text-muted-foreground">
            {type === "for-you"
              ? "Check back later for personalized recommendations"
              : "Discover and join groups that interest you"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((item: any) => {
          const group: ForYouGroup | Group = type === "for-you" ? item : item.group;
          return (
            <GroupCard
              key={item._id || group._id}
              group={group}
              isForYou={type === "for-you"}
              isMyGroup={type === "my-groups"}
            />
          );
        })}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <GroupCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {!hasNextPage && groups.length > 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          You've reached the end
        </div>
      )}
    </div>
  );
}
