"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  Camera,
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  Check,
  Share2,
  Heart,
  Edit
} from "lucide-react";
import { useUploadAvatar, useUploadCover } from "./hooks/profile-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  avatar: { url: string; provider: string };
  cover: { url: string | null };
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

export function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  const [coverImage, setCoverImage] = useState<string | null>(profile.cover.url);
  const [avatarImage, setAvatarImage] = useState<string>(profile.avatar.url);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { uploadCoverMutation } = useUploadCover();
  const { uploadAvatarMutation } = useUploadAvatar();

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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    uploadCoverMutation.mutate(formData, {
      onSuccess: (response) => {
        const newCoverUrl = response.data?.data?.cover?.url;
        if (newCoverUrl) {
          setCoverImage(newCoverUrl);
          toast.success("Cover photo updated successfully");
        }
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? error.response?.data?.message || "Failed to update cover photo"
          : "Failed to update cover photo";
        toast.error(message);
      },
      onSettled: () => {
        setIsUploadingCover(false);
        if (coverInputRef.current) {
          coverInputRef.current.value = "";
        }
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    uploadAvatarMutation.mutate(formData, {
      onSuccess: (response) => {
        const newAvatarUrl = response.data?.avatar?.url;

        console.log({ newAvatarUrl });
        console.log({ response });


        if (newAvatarUrl) {
          setAvatarImage(newAvatarUrl);
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
      },
    });
  };

  return (
    <Card className="border-none shadow-2xl overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-linear-to-br from-primary/20 via-secondary/20 to-muted/20">
        {coverImage && (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}

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
              <AvatarImage src={avatarImage} alt={profile.name} />
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
  );
}
