"use client";

import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { useCreateGroupPostStore } from "../stores/create-group-post-store";
import { useCreateGroupPost } from "../hooks/group-post-query";
import { useUploadImage, useUploadVideo } from "@/features/home/hooks/upload-query";
import { useShowUserProfile } from "@/features/auth/hooks/auth-query";
import { useSignedMedia } from "@/features/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CreateGroupPostPayload } from "@/types";
import { CreatePostForm } from "@/components/molecules/create-post-form";

interface CreateGroupPostDialogProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupPostDialog({ groupId, isOpen, onOpenChange }: CreateGroupPostDialogProps) {
  const {
    postType,
    textContent,
    setTextContent,
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
  } = useCreateGroupPostStore();

  const hasMedia = mediaFiles.length > 0 || videoFile !== null;

  const { showUserProfileQuery } = useShowUserProfile();
  const { createGroupPostMutation } = useCreateGroupPost(groupId);
  const { uploadImageMutation } = useUploadImage();
  const { uploadVideoMutation } = useUploadVideo();
  const { useSignedUrl } = useSignedMedia();

  const user = showUserProfileQuery.data?.data;
  const { data: signedAvatarUrl } = useSignedUrl(user?.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || user?.avatar?.url;

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetStore();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetStore]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const canSubmit = useCallback(() => {
    if (postType === "text") {
      if (hasMedia) return true;
      return textContent.trim().length > 0;
    }
    return false;
  }, [postType, textContent, hasMedia]);

  const handleSubmit = async () => {
    if (!canSubmit() || isUploading) return;

    setIsUploading(true);

    try {
      let payload: CreateGroupPostPayload;

      if (mediaFiles.length > 0) {
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
          caption: textContent,
          layout: imageLayout,
          images: uploadResults,
        };
      } else if (videoFile) {
        const videoResult = await uploadVideoMutation.mutateAsync(videoFile);
        const finalVideoMode = videoMode || "standard";

        payload = {
          type: "video",
          caption: textContent,
          category: finalVideoMode === "reels" ? "reels" : "general",
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
      } else {
        payload = {
          type: "text",
          text: textContent,
        };
      }

      await createGroupPostMutation.mutateAsync(payload);

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

        <CreatePostForm
          user={user}
          avatarUrl={avatarUrl}
          textContent={textContent}
          setTextContent={setTextContent}
          mediaFiles={mediaFiles}
          addMediaFile={useCreateGroupPostStore.getState().addMediaFile}
          removeMediaFile={useCreateGroupPostStore.getState().removeMediaFile}
          clearMediaFiles={useCreateGroupPostStore.getState().clearMediaFiles}
          videoFile={videoFile}
          setVideoFile={useCreateGroupPostStore.getState().setVideoFile}
          videoMode={videoMode}
          setVideoMode={setVideoMode}
          mutedByDefault={mutedByDefault}
          setMutedByDefault={useCreateGroupPostStore.getState().setMutedByDefault}
          loop={loop}
          setLoop={useCreateGroupPostStore.getState().setLoop}
          feeling={feeling}
          setFeeling={setFeeling}
          headerSlot={<p className="text-xs text-muted-foreground">Posting to group</p>}
          videoLabel="Video"
          fileInputPrefix="group-"
          imageInputId="group-image-upload-inline"
          videoInputId="group-video-upload-inline"
        />

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
                    ? `Uploading ${mediaFiles.length} image${mediaFiles.length > 1 ? "s" : ""}...`
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
