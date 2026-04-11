"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Input } from "@/components/atoms/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Search, UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";
import { useGetFollowersList, useGetFollowingList, useFollowUser, useUnfollowUser } from "@/components/features/follow/hooks/follow-query";
import { toast } from "sonner";

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: "followers" | "following";
}

export function FollowListDialog({ open, onOpenChange, userId, initialTab = "followers" }: FollowListDialogProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const { followersQuery } = useGetFollowersList(userId, searchQuery);
  const { followingQuery } = useGetFollowingList(userId, searchQuery);
  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();

  const followers = followersQuery.data?.items || [];
  const following = followingQuery.data?.items || [];
  const isFollowersLoading = followersQuery.isLoading;
  const isFollowingLoading = followingQuery.isLoading;

  // Handle follow/unfollow
  const handleFollowToggle = (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      unfollowUserMutation.mutate(targetUserId, {
        onError: () => {
          toast.error("Failed to unfollow");
        },
      });
    } else {
      followUserMutation.mutate(targetUserId, {
        onError: () => {
          toast.error("Failed to follow");
        },
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Reset search when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {activeTab === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "followers" | "following")} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          {/* Followers Tab */}
          <TabsContent value="followers" className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
            {isFollowersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                ))}
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No followers found" : "No followers yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {followers.map((user) => (
                  <FollowListItem
                    key={user._id}
                    user={user}
                    onFollowToggle={handleFollowToggle}
                    isActionLoading={followUserMutation.isPending || unfollowUserMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
            {isFollowingLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                ))}
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No following found" : "Not following anyone yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {following.map((user) => (
                  <FollowListItem
                    key={user._id}
                    user={user}
                    onFollowToggle={handleFollowToggle}
                    isActionLoading={followUserMutation.isPending || unfollowUserMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Individual Follow List Item Component
function FollowListItem({
  user,
  onFollowToggle,
  isActionLoading,
}: {
  user: {
    _id: string;
    name: string;
    username: string;
    isFollowing: boolean;
  };
  onFollowToggle: (userId: string, isFollowing: boolean) => void;
  isActionLoading: boolean;
}) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Link href={`/${user.username}`} className="shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-white font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/${user.username}`} className="block">
          <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
        </Link>
      </div>

      <Button
        variant={user.isFollowing ? "secondary" : "default"}
        size="sm"
        className="gap-1.5 shrink-0"
        onClick={() => onFollowToggle(user._id, user.isFollowing)}
        disabled={isActionLoading}
      >
        {user.isFollowing ? (
          <>
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Following</span>
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Follow</span>
          </>
        )}
      </Button>
    </div>
  );
}
