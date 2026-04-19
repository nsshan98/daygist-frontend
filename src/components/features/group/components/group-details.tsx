"use client";

import { MediaImage } from "@/components/features/profile";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Users,
  FileText,
  Lock,
  Globe,
  MapPin,
  Calendar,
  Shield,
  Crown,
  User,
  AlertCircle,
} from "lucide-react";
import { useGetGroupDetails, useJoinGroup } from "../hooks/group-query";
import { formatDistanceToNow } from "date-fns";

interface GroupDetailsProps {
  groupId: string;
  showOnlyAbout?: boolean;
}

export function GroupDetails({ groupId, showOnlyAbout = false }: GroupDetailsProps) {
  const { groupDetailsQuery } = useGetGroupDetails(groupId);
  const { joinGroupMutation } = useJoinGroup();

  const { data, isLoading, isError, refetch } = groupDetailsQuery;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Cover Skeleton */}
        <Skeleton className="aspect-3/1 w-full rounded-xl" />

        {/* Info Skeleton */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load group</h3>
          <p className="text-muted-foreground mb-4">
            Something went wrong. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const group = data.group;
  const isMember = group.myMembership?.status === "active";
  const isOwner = group.myMembership?.role === "owner";
  const isAdmin = group.myMembership?.role === "admin";

  const handleJoin = () => {
    joinGroupMutation.mutate(group._id);
  };

  // If showOnlyAbout is true, only render the about section
  if (showOnlyAbout) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* About */}
          {group.about && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{group.about}</p>
            </div>
          )}

          {/* Location */}
          {group.location?.country || group.location?.city ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {group.location.city && group.location.country
                    ? `${group.location.city}, ${group.location.country}`
                    : group.location.city || group.location.country}
                </span>
              </div>
            </div>
          ) : null}

          {/* Rules */}
          {group.rules && group.rules.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Group Rules</h3>
              <div className="space-y-2">
                {group.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative aspect-3/1 w-full rounded-xl overflow-hidden bg-linear-to-br from-primary/20 to-secondary/20">
        {group.coverUrl?.key || group.coverUrl?.url ? (
          <MediaImage
            mediaKey={group.coverUrl?.key || null}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 backdrop-blur-sm bg-background/80 px-3 py-1"
          >
            {group.privacy === "private" ? (
              <>
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Group Info */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className="text-muted-foreground">{group.category}</p>
              </div>

              <div className="flex gap-2">
                {/* Join Button */}
                {!isMember && (
                  <Button
                    onClick={handleJoin}
                    disabled={joinGroupMutation.isPending}
                    size="lg"
                  >
                    {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{group.counts?.members || 0}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
            {isMember && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{group.counts?.posts || 0}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>
            )}
            {!isMember && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{group.counts?.posts || 0}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
          </div>

          {/* About */}
          {group.about && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{group.about}</p>
            </div>
          )}

          {/* Location */}
          {group.location?.country || group.location?.city ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {group.location.city && group.location.country
                    ? `${group.location.city}, ${group.location.country}`
                    : group.location.city || group.location.country}
                </span>
              </div>
            </div>
          ) : null}

          {/* Membership Status */}
          {isMember && group.myMembership && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Your Membership</h3>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="flex items-center gap-1">
                  {isOwner ? (
                    <>
                      <Crown className="w-3 h-3" />
                      <span>Owner</span>
                    </>
                  ) : isAdmin ? (
                    <>
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      <span>Member</span>
                    </>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Joined{" "}
                  {formatDistanceToNow(new Date(group.myMembership.joinedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Rules */}
          {group.rules && group.rules.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Group Rules</h3>
              <div className="space-y-2">
                {group.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
