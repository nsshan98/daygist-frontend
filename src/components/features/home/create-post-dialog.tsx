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
import { useSignedMedia } from "../profile/media-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Type, Image as ImageIcon, Video, Loader2, SmilePlus, X } from "lucide-react";
import { useState } from "react";

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
    setTextContent,
    textBackground,
    textStyle,
    mediaFiles,
    imageLayout,
    videoFile,
    videoMode,
    setVideoMode,
    mutedByDefault,
    loop,
    isUploading,
    setIsUploading,
    resetStore,
    feeling,
    setFeeling,
  } = useCreatePostStore();

  const hasMedia = mediaFiles.length > 0 || videoFile !== null;
  
  const { showUserProfileQuery } = useShowUserProfile();
  const { createPostMutation } = useCreatePost();
  const { uploadImageMutation } = useUploadImage();
  const { uploadVideoMutation } = useUploadVideo();
  const { useSignedUrl } = useSignedMedia();
  
  const user = showUserProfileQuery.data?.data;
    
  // Fetch signed URL for avatar
  const { data: signedAvatarUrl } = useSignedUrl(user?.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || user?.avatar?.url;

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
    if (postType === "text") {
      // If has media, allow submit even without text
      if (hasMedia) return true;
      // Otherwise require text content
      return textContent.trim().length > 0;
    }
    return false;
  }, [postType, textContent, hasMedia]);

  // Common feelings list
  const feelings = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😍", label: "Love" },
    { emoji: "😎", label: "Cool" },
    { emoji: "🎉", label: "Celebrating" },
    { emoji: "💪", label: "Motivated" },
    { emoji: "😴", label: "Tired" },
    { emoji: "🤔", label: "Thinking" },
    { emoji: "😂", label: "Laughing" },
    { emoji: "🥳", label: "Party" },
    { emoji: "😡", label: "Angry" },
    { emoji: "🤗", label: "Hugged" },
    { emoji: "🥰", label: "Blessed" },
    { emoji: "😅", label: "Silly" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😌", label: "Peaceful" },
    { emoji: "💔", label: "Heartbroken" },
    { emoji: "😇", label: "Innocent" },
  ];

  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  const handleSubmit = async () => {
    if (!canSubmit() || isUploading) return;

    setIsUploading(true);

    try {
      let payload: CreatePostPayload;

      // If background is selected, create text post with background
      if (textBackground) {
        payload = {
          type: "text",
          privacy,
          text: textContent,
          feeling: feeling || null,
          backgroundUrl: textBackground,
          textStyle: {
            color: textStyle.color,
            fontSize: textStyle.fontSize,
            fontWeight: textStyle.fontWeight,
            align: textStyle.align,
          },
        };
      } 
      // If media files exist, create media post
      else if (mediaFiles.length > 0) {
        // Upload all images first
        const uploadResults = await Promise.all(
          mediaFiles.map(async (file) => {
            const result = await uploadImageMutation.mutateAsync(file);
            return {
              url: result.url,
              provider: result.provider,
              key: result.key,
              width: 1080,
              height: 1350,
            };
          })
        );

        payload = {
          type: "image",
          privacy,
          caption: textContent, // Use textContent as caption
          layout: imageLayout,
          images: uploadResults,
        };
      }
      else if (videoFile) {
        // Upload video
        const videoResult = await uploadVideoMutation.mutateAsync(videoFile);
        const finalVideoMode = videoMode || "standard";

        payload = {
          type: "video",
          privacy,
          caption: textContent, // Use textContent as caption
          videoMode: finalVideoMode,
          category: finalVideoMode === "reels" ? "reels" : "video",
          subCategory: "general",
          mutedByDefault,
          loop,
          video: {
            url: videoResult.url,
            provider: videoResult.provider,
            key: videoResult.key,
            durationSec: 0,
            width: 1080,
            height: finalVideoMode === "reels" ? 1920 : 1080,
          },
        };
      }
      // Plain text post
      else {
        payload = {
          type: "text",
          privacy,
          text: textContent,
          feeling: feeling || null,
        };
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
            <AvatarImage src={avatarUrl} alt={user?.name} />
            <AvatarFallback className="bg-primary/10">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{user?.name || "User"}</p>
            {feeling && (
              <p className="text-xs text-muted-foreground">
                is feeling {feeling.toLowerCase()} {feelings.find(f => f.label === feeling)?.emoji}
              </p>
            )}
            <PrivacySelector />
          </div>
        </div>

        {/* Feelings Selector - Removed from top, moved to add section */}

        {/* Form Content - Unified Facebook-style layout */}
        {postType === "text" && (
          <div className="space-y-4">
            <TextPostForm />
            
            {/* Add Media Options - Only show if no background selected */}
            {!textBackground && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Add to your post</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      // Trigger file input for images
                      const input = document.getElementById('image-upload-inline');
                      if (input) input.click();
                    }}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                  >
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setVideoMode("standard");
                      // Trigger file input for video
                      const input = document.getElementById('video-upload-inline');
                      if (input) input.click();
                    }}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                  >
                    <Video className="w-5 h-5 text-red-500" />
                    <span className="text-sm">Video</span>
                  </button>
                  <button
                    onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all"
                  >
                    <SmilePlus className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">Feeling</span>
                  </button>
                </div>
                
                {/* Hidden file inputs */}
                <input
                  id="image-upload-inline"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/heic"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
                    imageFiles.forEach((file) => {
                      if (file.size <= 25 * 1024 * 1024) {
                        useCreatePostStore.getState().addMediaFile(file);
                      }
                    });
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <input
                  id="video-upload-inline"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith("video/") && file.size <= 300 * 1024 * 1024) {
                      useCreatePostStore.getState().setVideoFile(file);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                
                {/* Feeling Picker */}
                {showFeelingPicker && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">How are you feeling?</p>
                      {feeling && (
                        <button
                          onClick={() => {
                            setFeeling(null);
                            setShowFeelingPicker(false);
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {feelings.map((f) => (
                        <button
                          key={f.label}
                          onClick={() => {
                            setFeeling(feeling === f.label ? null : f.label);
                            setShowFeelingPicker(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg transition-all",
                            feeling === f.label
                              ? "bg-primary/20 ring-2 ring-primary/50"
                              : "hover:bg-muted"
                          )}
                        >
                          <span className="text-2xl">{f.emoji}</span>
                          <span className="text-sm">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Show message when background is selected */}
            {textBackground && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  Background selected. Media upload is disabled for background posts.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Image preview section - when images are added */}
        {postType === "text" && mediaFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Photos</p>
              <button
                onClick={() => {
                  useCreatePostStore.getState().clearMediaFiles();
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {mediaFiles.map((file, index) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        useCreatePostStore.getState().removeMediaFile(index);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            {mediaFiles.length < 10 && (
              <button
                onClick={() => {
                  const input = document.getElementById('image-upload-inline');
                  if (input) input.click();
                }}
                className="w-full p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Add more photos</p>
              </button>
            )}
          </div>
        )}
        
        {/* Video preview section - when video is added */}
        {postType === "text" && videoFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Video</p>
              <button
                onClick={() => {
                  useCreatePostStore.getState().setVideoFile(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                src={URL.createObjectURL(videoFile)}
                className="w-full aspect-video"
                controls
                muted={mutedByDefault}
                loop={loop}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mutedByDefault}
                  onChange={(e) => useCreatePostStore.getState().setMutedByDefault(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Muted</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => useCreatePostStore.getState().setLoop(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Loop</span>
              </label>
            </div>
          </div>
        )}

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
                  {mediaFiles.length > 0
                    ? `Uploading ${mediaFiles.length} image${mediaFiles.length > 1 ? 's' : ''}...`
                    : videoFile
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
