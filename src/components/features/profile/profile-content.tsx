"use client";

import { useState } from "react";
import { 
  ProfileHeader, 
  ProfileInfo, 
  ProfileTabs, 
  EditProfileDialog,
  ProfileSkeleton,
  useGetUserProfile,
  useGetUserProfileById,
  useFollowUser,
  useUnfollowUser,
} from "@/components/features/profile";
import { isAxiosError } from "axios";
import { toast } from "sonner";

interface ProfileContentProps {
  username?: string;
  userId?: string;
}

export function ProfileContent({ username, userId }: ProfileContentProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Use different hooks based on whether we're viewing our own profile or someone else's
  const { showUserProfileQuery } = useGetUserProfile();
  const { showUserProfileByIdQuery } = useGetUserProfileById(userId || "");
  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();
  
  // Determine which query to use - if userId is provided, fetch by ID, otherwise show own profile
  const activeQuery = userId ? showUserProfileByIdQuery : showUserProfileQuery;
  const { data: profile, isLoading, error } = activeQuery;

  // Handle follow/unfollow - use the profile's _id from the response
  const handleFollow = () => {
    if (!userId) return;
    followUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success("Following user");
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? error.response?.data?.message || "Failed to follow user"
          : "Failed to follow user";
        toast.error(message);
      },
    });
  };

  const handleUnfollow = () => {
    if (!userId) return;
    unfollowUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success("Unfollowed user");
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? error.response?.data?.message || "Failed to unfollow user"
          : "Failed to unfollow user";
        toast.error(message);
      },
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Error Loading Profile</h1>
          <p className="text-muted-foreground">
            {error?.message || "Unable to load profile data. Please try again."}
          </p>
        </div>
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

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Profile Content - Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Header */}
            <ProfileHeader 
              profile={profile.data} 
              onEditProfile={() => setIsEditDialogOpen(true)}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              isFollowLoading={followUserMutation.isPending || unfollowUserMutation.isPending}
            />

            {/* Profile Tabs (Posts, Media, Likes, Saved) */}
            <ProfileTabs />
          </div>

          {/* Sidebar - Profile Info - Right Column (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <ProfileInfo profile={profile.data} />
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      {profile.data.isMe && (
        <EditProfileDialog
          profile={profile.data}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
