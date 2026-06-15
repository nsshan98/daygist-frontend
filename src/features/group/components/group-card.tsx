"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Users, Lock, Globe, Users2 } from "lucide-react";
import Link from "next/link";
import { MediaImage } from "@/features/profile";
import { useJoinGroup } from "../hooks/group-query";
import type { ForYouGroup, Group } from "@/types";

interface GroupCardProps {
  group: ForYouGroup | Group;
  isForYou?: boolean;
  isMyGroup?: boolean;
}

export function GroupCard({ group, isForYou = false, isMyGroup = false }: GroupCardProps) {
  const { joinGroupMutation } = useJoinGroup();

  const isPrivate = group.privacy === "private";
  const hasCover = group.coverUrl?.key || group.coverUrl?.url;

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinGroupMutation.mutate(group._id);
  };

  return (
    <Link href={`/groups/${group._id}`}>
      <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer p-0">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-primary/20 to-secondary/20">
          {hasCover ? (
            <MediaImage
              mediaKey={group.coverUrl?.key || null}
              alt={group.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users2 className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Group Name & Category */}
          <div>
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {group.name}
            </h3>
            <p className="text-sm text-muted-foreground">{group.category}</p>
          </div>

          {/* About */}
          {group.about && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {group.about}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.counts?.members || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{group.counts?.posts || 0} posts</span>
            </div>
            {/* Privacy Badge */}
            <div className="ml-auto">
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                {isPrivate ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    <span className="text-xs">Public</span>
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Mutual Friends (For You groups only) */}
          {isForYou && "mutualCount" in group && group.mutualCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {group.mutualCount} mutual friend{group.mutualCount !== 1 ? "s" : ""}
            </div>
          )}

          {/* Join Button - Only show for "For You" groups */}
          {!isMyGroup && (
            <Button
              onClick={handleJoin}
              disabled={joinGroupMutation.isPending}
              className="w-full"
              size="sm"
            >
              {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
