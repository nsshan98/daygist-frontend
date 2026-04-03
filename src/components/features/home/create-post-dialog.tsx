"use client";

import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { useCreatePostStore, PostType } from "./stores/create-post-store";
import { PrivacySelector } from "./create-post/privacy-selector";
import { TextPostForm } from "./create-post/text-post-form";
import { ImagePostForm } from "./create-post/image-post-form";
import { VideoPostForm } from "./create-post/video-post-form";
import { useCreatePost, CreatePostPayload } from "./hooks/feed-query";
import { useUploadImage, useUploadVideo } from "./hooks/upload-query";
import { useShowUserProfile } from "../auth/hooks/auth-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Type, Image as ImageIcon, Video, Loader2 } from "lucide-react";

const postTypeOptions: {
  type: PostType;
  label: string;
  icon: typeof Type;
  color: string;
}[] = [
  { type: "text", label: "Text", icon: Type, color: "text-blue-500" },
  { type: "image", label: "Photo", icon: ImageIcon, color: "text-green-500" },
  { type: "video", label: "Video", icon: Video, color: "text-red-500" },
];

export function CreatePostDialog() {
  const {
    isOpen,
    closeModal,
    postType,
    setPostType,
    privacy,
    caption,
    textContent,
    textBackground,
    textStyle,
    mediaFiles,
    imageLayout,
    videoFile,
    videoMode,
    mutedByDefault,
    loop,
    isUploading,
    setIsUploading,
    resetStore,
  } = useCreatePostStore();

  const { showUserProfileQuery } = useShowUserProfile();
  const { createPostMutation } = useCreatePost();
  const { uploadImageMutation } = useUploadImage();
  const { uploadVideoMutation } = useUploadVideo();

  const user = showUserProfileQuery.data?.data;

  // Reset store when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        resetStore();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetStore]);

  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const canSubmit = useCallback(() => {
    if (!postType) return false;

    switch (postType) {
      case "text":
        return textContent.trim().length > 0;
      case "image":
        return mediaFiles.length > 0;
      case "video":
        return videoFile !== null;
      default:
        return false;
    }
  }, [postType, textContent, mediaFiles.length, videoFile]);

  const handleSubmit = async () => {
    if (!canSubmit() || isUploading) return;

    setIsUploading(true);

    try {
      let payload: CreatePostPayload;

      switch (postType) {
        case "text":
          payload = {
            type: "text",
            privacy,
            text: textContent,
            ...(textBackground && {
              backgroundUrl: textBackground,
              textStyle: {
                color: textStyle.color,
                fontSize: textStyle.fontSize,
                fontWeight: textStyle.fontWeight,
                align: textStyle.align,
              },
            }),
          };
          break;

        case "image": {
          // Upload all images first
          const uploadResults = await Promise.all(
            mediaFiles.map(async (file) => {
              const result = await uploadImageMutation.mutateAsync(file);
              return {
                url: result.url,
                provider: result.provider,
                key: result.key,
                // We would ideally get dimensions from the image, using defaults for now
                width: 1080,
                height: 1350,
              };
            })
          );

          payload = {
            type: "image",
            privacy,
            caption,
            layout: imageLayout,
            images: uploadResults,
          };
          break;
        }

        case "video": {
          if (!videoFile) throw new Error("No video file selected");

          // Upload video
          const videoResult = await uploadVideoMutation.mutateAsync(videoFile);

          payload = {
            type: "video",
            privacy,
            caption,
            videoMode,
            category: videoMode === "reels" ? "reels" : "video",
            subCategory: "general",
            mutedByDefault,
            loop,
            video: {
              url: videoResult.url,
              provider: videoResult.provider,
              key: videoResult.key,
              // These would ideally come from video metadata
              durationSec: 0,
              width: 1080,
              height: videoMode === "reels" ? 1920 : 1080,
            },
          };
          break;
        }

        default:
          throw new Error("Invalid post type");
      }

      // Create the post
      await createPostMutation.mutateAsync(payload);

      toast.success("Post created successfully!");
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Create Post
          </DialogTitle>
        </DialogHeader>

        {/* User Info Header */}
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatar?.url} alt={user?.name} />
            <AvatarFallback className="bg-primary/10">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{user?.name || "User"}</p>
            <PrivacySelector />
          </div>
        </div>

        {/* Post Type Selector */}
        {!postType && (
          <div className="grid grid-cols-3 gap-3 py-4">
            {postTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setPostType(option.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
              >
                <option.icon className={cn("w-8 h-8", option.color)} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Post Type Switcher (when type is selected) */}
        {postType && (
          <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
            {postTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setPostType(option.type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  postType === option.type
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon
                  className={cn(
                    "w-4 h-4",
                    postType === option.type ? option.color : ""
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Form Content */}
        {postType === "text" && <TextPostForm />}
        {postType === "image" && <ImagePostForm />}
        {postType === "video" && <VideoPostForm />}

        {/* Submit Button */}
        {postType && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || isUploading}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {postType === "image" && mediaFiles.length > 1
                    ? `Uploading ${mediaFiles.length} images...`
                    : postType === "video"
                    ? "Uploading video..."
                    : "Creating post..."}
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
