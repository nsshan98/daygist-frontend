"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import {
  Camera,
  MapPin,
  Calendar,
  Heart,
  Edit
} from "lucide-react";
import { useUploadAvatar, useUploadCover, useGetSignedUrl } from "./hooks/profile-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { ImageAdjustmentDialog } from "./image-adjustment-dialog";
import { Skeleton } from "@/components/atoms/skeleton";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  avatar: { url: string; key: string; provider: string };
  cover: { url: string | null; key: string | null };
  bio?: string | null;
  followerCount: number;
  followingCount: number;
  address?: { city?: string | null; country?: string | null; state?: string | null };
  createdAt: string;
  isMe?: boolean;
  isFollowing?: boolean;
  age?: number | null;
  relationship?: string | null;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditProfile?: () => void;
}

interface ImageAdjustments {
  zoom: number;
  rotation: number;
  offsetY: number;
}

export function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  // Use 'key' for signed URL fetching, fallback to 'url' if key is not available
  const [coverKey, setCoverKey] = useState<string | null>(profile.cover.key || profile.cover.url);
  const [avatarKey, setAvatarKey] = useState<string>(profile.avatar.key || profile.avatar.url);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Image adjustment dialog state
  const [showCoverAdjustmentDialog, setShowCoverAdjustmentDialog] = useState(false);
  const [showAvatarAdjustmentDialog, setShowAvatarAdjustmentDialog] = useState(false);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { uploadCoverMutation } = useUploadCover();
  const { uploadAvatarMutation } = useUploadAvatar();
  const { useSignedUrl } = useGetSignedUrl();

  // Helper function to check if a URL is a signed URL (contains query params) or a direct URL
  const isSignedOrDirectUrl = (url: string | null): boolean => {
    if (!url) return false;
    // If URL starts with http/https and has query params, it's likely a signed URL
    return url.startsWith('http') && url.includes('?');
  };

  // Helper function to check if a URL is a key (relative path like "images/...")
  const isMediaKey = (url: string | null): boolean => {
    if (!url) return false;
    // If URL doesn't start with http, it's likely a key
    return !url.startsWith('http');
  };

  // Determine if we need to fetch signed URLs (only for keys, not full URLs)
  const coverKeyForQuery = useMemo(() => {
    if (!coverKey) return null;
    // Only fetch signed URL if it's a key (not a full URL)
    return isMediaKey(coverKey) ? coverKey : null;
  }, [coverKey]);

  const avatarKeyForQuery = useMemo(() => {
    if (!avatarKey) return null;
    // Only fetch signed URL if it's a key (not a full URL)
    return isMediaKey(avatarKey) ? avatarKey : null;
  }, [avatarKey]);

  // Use React Query to fetch signed URLs
  const { data: coverSignedUrlFromQuery, isLoading: isLoadingCoverUrl } = useSignedUrl(coverKeyForQuery);
  const { data: avatarSignedUrlFromQuery, isLoading: isLoadingAvatarUrl } = useSignedUrl(avatarKeyForQuery);

  // Determine final signed URLs
  const coverSignedUrl = useMemo(() => {
    if (!coverKey) return null;
    if (isSignedOrDirectUrl(coverKey)) return coverKey; // Already signed
    if (isMediaKey(coverKey)) return coverSignedUrlFromQuery || null; // From query
    return coverKey; // Regular URL
  }, [coverKey, coverSignedUrlFromQuery]);

  const avatarSignedUrl = useMemo(() => {
    if (!avatarKey) return null;
    if (isSignedOrDirectUrl(avatarKey)) return avatarKey; // Already signed
    if (isMediaKey(avatarKey)) return avatarSignedUrlFromQuery || null; // From query
    return avatarKey; // Regular URL
  }, [avatarKey, avatarSignedUrlFromQuery]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const joinDate = new Date(profile.createdAt);
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const openEditDialog = () => {
    const trigger = document.getElementById("edit-profile-trigger");
    if (trigger) {
      trigger.click();
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(`Image size should be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Show adjustment dialog instead of uploading directly
    setPendingCoverFile(file);
    setShowCoverAdjustmentDialog(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(`Image size should be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Show adjustment dialog instead of uploading directly
    setPendingAvatarFile(file);
    setShowAvatarAdjustmentDialog(true);
  };

  // Upload cover after adjustment
  const uploadAdjustedCover = (file: File, adjustments?: ImageAdjustments) => {
    console.log('uploadAdjustedCover called:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      adjustments,
      fileType: 'cover'
    });
    
    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    console.log('Calling uploadCoverMutation.mutate with formData');
    uploadCoverMutation.mutate(formData, {
      onSuccess: (response) => {
        console.log('Cover upload success:', response.data);
        
        // Response structure: { ok: true, message: 'Cover updated', user: { cover: {...} } }
        // Cover data is in response.data.user.cover
        const newCoverKey = response.data?.user?.cover?.key || response.data?.user?.cover?.url;
        
        if (newCoverKey) {
          setCoverKey(newCoverKey);
          toast.success("Cover photo updated successfully");
        } else {
          console.error('No cover key or URL in response:', response.data);
          toast.error("Upload succeeded but no image URL returned");
        }
      },
      onError: (error) => {
        console.error('Cover upload error:', error);
        const message = isAxiosError(error)
          ? error.response?.data?.message || "Failed to update cover photo"
          : "Failed to update cover photo";
        toast.error(message);
      },
      onSettled: () => {
        console.log('Cover upload settled');
        setIsUploadingCover(false);
        if (coverInputRef.current) {
          coverInputRef.current.value = "";
        }
        setPendingCoverFile(null);
      },
    });
  };

  // Upload avatar after adjustment
  const uploadAdjustedAvatar = (file: File, adjustments?: ImageAdjustments) => {
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    uploadAvatarMutation.mutate(formData, {
      onSuccess: (response) => {
        // Use 'key' if available, fallback to 'url'
        const newAvatarKey = response.data?.avatar?.key || response.data?.avatar?.url;

        if (newAvatarKey) {
          setAvatarKey(newAvatarKey);
          toast.success("Profile picture updated successfully");
        }
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? error.response?.data?.message || "Failed to update profile picture"
          : "Failed to update profile picture";
        toast.error(message);
      },
      onSettled: () => {
        setIsUploadingAvatar(false);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = "";
        }
        setPendingAvatarFile(null);
      },
    });
  };

  return (
    <>
    <Card className="border-none shadow-2xl overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-linear-to-br from-primary/20 via-secondary/20 to-muted/20">
        {isLoadingCoverUrl ? (
          <Skeleton className="w-full h-full" />
        ) : coverSignedUrl ? (
          <img
            src={coverSignedUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Cover Upload Button */}
        {profile.isMe && (
          <div className="absolute top-4 right-4">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              disabled={isUploadingCover}
            />
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 backdrop-blur-sm bg-background/80 hover:bg-background/90"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Change Cover</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 sm:px-8 pb-6">
        {/* Avatar and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-20 gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-2xl">
              {isLoadingAvatarUrl ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <AvatarImage src={avatarSignedUrl || undefined} alt={profile.name} />
              )}
              <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary to-secondary text-white">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            {/* Avatar Upload Button */}
            {profile.isMe && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-background/80 hover:bg-background/90"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Name and Edit Button */}
          <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 sm:mt-0 sm:ml-6">
            {/* Name and Username */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.name}</h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-1">@{profile.username}</p>
            </div>

            {/* Edit Profile Button */}
            {profile.isMe && onEditProfile && (
              <Button
                variant="default"
                className="gap-2 rounded-xl shrink-0"
                onClick={onEditProfile}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mt-6 space-y-3">
          {/* Bio Section */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
            <p className="text-lg leading-relaxed max-w-4xl">{profile.bio || 'N/A'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 sm:gap-8 py-5 mt-6 border-t border-b border-border/40">
          <div className="text-center sm:text-left cursor-pointer hover:text-primary transition-colors">
            <p className="text-2xl sm:text-3xl font-bold">{formatNumber(profile.followingCount)}</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Following</p>
          </div>
          <div className="text-center sm:text-left cursor-pointer hover:text-primary transition-colors">
            <p className="text-2xl sm:text-3xl font-bold">{formatNumber(profile.followerCount)}</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Followers</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>Joined {formattedJoinDate}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>Lives in {profile.address?.country || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>{profile.age ? `${profile.age} years old` : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
            <Heart className="w-5 h-5" />
            <span className="capitalize">{profile.relationship ? profile.relationship.toLowerCase().replace('_', ' ') : 'N/A'}</span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{[profile.address?.city, profile.address?.state, profile.address?.country].filter(Boolean).join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>

    </Card>
    {/* Image Adjustment Dialogs - Rendered outside the Card to avoid overflow clipping */}
    <ImageAdjustmentDialog
      open={showCoverAdjustmentDialog}
      onOpenChange={setShowCoverAdjustmentDialog}
      imageFile={pendingCoverFile}
      onConfirm={uploadAdjustedCover}
      type="cover"
    />

    <ImageAdjustmentDialog
      open={showAvatarAdjustmentDialog}
      onOpenChange={setShowAvatarAdjustmentDialog}
      imageFile={pendingAvatarFile}
      onConfirm={uploadAdjustedAvatar}
      type="avatar"
    />
    </>
  );
}
