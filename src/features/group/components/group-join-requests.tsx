"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { UserPlus, Check, X, Users } from "lucide-react";
import { useGetGroupJoinRequests, useUpdateMemberStatus } from "../hooks/group-query";
import { formatDistanceToNow } from "date-fns";
import type { GroupJoinRequest } from "@/types";

interface GroupJoinRequestsProps {
  groupId: string;
}

function RequestSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function GroupJoinRequests({ groupId }: GroupJoinRequestsProps) {
  const { joinRequestsQuery } = useGetGroupJoinRequests(groupId);
  const { updateMemberStatusMutation } = useUpdateMemberStatus();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    joinRequestsQuery;

  // Flatten all pages into a single array
  const requests = data?.pages.flatMap((page) => page.items) || [];

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

  const handleApprove = (memberId: string) => {
    updateMemberStatusMutation.mutate({
      groupId,
      memberId,
      status: "active",
    });
  };

  const handleReject = (memberId: string) => {
    updateMemberStatusMutation.mutate({
      groupId,
      memberId,
      status: "rejected",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <UserPlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load join requests</h3>
          <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No pending join requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Join Requests</h3>

        <div className="space-y-2">
          {requests.map((request: GroupJoinRequest) => (
            <div
              key={request._id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {request.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{request.user.username} · Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleApprove(request._id)}
                  disabled={updateMemberStatusMutation.isPending}
                  title="Approve"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleReject(request._id)}
                  disabled={updateMemberStatusMutation.isPending}
                  title="Reject"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <RequestSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}

        {!hasNextPage && requests.length > 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            All requests loaded
          </div>
        )}
      </CardContent>
    </Card>
  );
}
