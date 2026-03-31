"use client";

import { useState } from "react";
import { 
  ProfileHeader, 
  ProfileInfo, 
  ProfileTabs, 
  EditProfileDialog,
  ProfileSkeleton,
  useGetUserProfile 
} from "@/components/features/profile";
import { Button } from "@/components/atoms/button";
import { Pencil } from "lucide-react";

export function ProfileContent() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { showUserProfileQuery } = useGetUserProfile();
  
  const { data: profile, isLoading, error } = showUserProfileQuery;

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
