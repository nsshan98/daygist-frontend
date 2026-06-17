"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Crown,
  Shield,
  User,
  MoreVertical,
  Users,
  UserX,
  UserCheck,
  Ban,
  Lock,
} from "lucide-react";
import { useGetGroupMembers, useUpdateMemberStatus } from "../hooks/group-query";
import { useGetGroupDetails } from "../hooks/group-query";
import { MediaImage } from "@/features/profile";
import { formatDistanceToNow } from "date-fns";
import type { GroupMember } from "@/types";

interface GroupMembersListProps {
  groupId: string;
}

function formatJoinedDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "recently";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "recently";
  }
}

function MemberSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function GroupMembersList({ groupId }: GroupMembersListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const { groupMembersQuery } = useGetGroupMembers(groupId, statusFilter);
  const { groupDetailsQuery } = useGetGroupDetails(groupId);
  const { updateMemberStatusMutation } = useUpdateMemberStatus();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = groupMembersQuery;

  const groupDetails = groupDetailsQuery.data?.group;
  const isOwnerOrAdmin =
    groupDetails?.myMembership?.role === "owner" ||
    groupDetails?.myMembership?.role === "admin";

  // Flatten all pages into a single array
  const members = data?.pages.flatMap((page) => page.items) || [];

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

  const handleStatusChange = (memberId: string, newStatus: "active" | "rejected" | "blocked") => {
    updateMemberStatusMutation.mutate({
      groupId,
      memberId,
      status: newStatus,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3" />;
      case "admin":
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default" as const;
      case "admin":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  // Pre-emptively show restricted UI when user role is known to lack access
  const isRegularMember = groupDetails && !isOwnerOrAdmin;
  if (isError || isRegularMember) {
    const isForbidden = (error as any)?.response?.status === 403 || isRegularMember;
    if (isForbidden) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="py-16 px-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Members Area is Private</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Only the group owner and administrators can view the member list.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-muted/60 border">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                {groupDetails?.counts?.members || 0} member
                {(groupDetails?.counts?.members || 0) !== 1 ? "s" : ""} in this group
              </span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load members</h3>
          <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <MemberSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Header with filter */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Group Members</h3>
          {isOwnerOrAdmin && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Members list */}
        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No members found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member: GroupMember) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {member.user.avatar?.key ? (
                      <MediaImage
                        mediaKey={member.user.avatar.key}
                        alt={member.user.name}
                        className="h-full w-full object-cover rounded-full"
                        fallback={
                          <AvatarFallback>
                            {member.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        }
                      />
                    ) : (
                      <AvatarFallback>
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.user.name}</p>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </Badge>
                    </div>
                      <p className="text-sm text-muted-foreground">
                      @{member.user.username} · Joined {formatJoinedDate(member.joinedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions for admins/owners */}
                {isOwnerOrAdmin && member.role === "member" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.status !== "active" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(member._id, "active")}
                          disabled={updateMemberStatusMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {member.status === "active" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(member._id, "blocked")}
                          disabled={updateMemberStatusMutation.isPending}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(member._id, "rejected")}
                        disabled={updateMemberStatusMutation.isPending}
                        className="text-destructive"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <MemberSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}

        {!hasNextPage && members.length > 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            All members loaded
          </div>
        )}
      </CardContent>
    </Card>
  );
}
