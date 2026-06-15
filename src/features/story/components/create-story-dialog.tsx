"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import { Input } from "@/components/atoms/input";
import { useCreateStoryStore, StoryType, StoryPrivacy } from "../stores/create-story-store";
import { useCreateStory } from "../hooks/story-query";
import { useUploadImage, useUploadVideo } from "@/features/home/hooks/upload-query";
import { useShowUserProfile } from "@/features/auth/hooks/auth-query";
import { useSignedMedia } from "@/features/profile";
import { toast } from "sonner";
import { Type, Image as ImageIcon, Video, Loader2, X } from "lucide-react";
import { CreateStoryPayload } from "@/types";

const storyTypeOptions: {
  type: StoryType;
  label: string;
  icon: typeof Type;
  color: string;
}[] = [
  { type: "text", label: "Text", icon: Type, color: "text-blue-500" },
  { type: "image", label: "Image", icon: ImageIcon, color: "text-green-500" },
  { type: "video", label: "Video", icon: Video, color: "text-purple-500" },
];

const backgroundColors = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
  "#fa709a",
  "#fee140",
  "#a18cd1",
  "#fbc2eb",
];

export function CreateStoryDialog() {
  const {
    isOpen,
    closeModal,
    storyType,
    setStoryType,
    privacy,
    setPrivacy,
    text,
    setText,
    backgroundUrl,
    setBackgroundUrl,
    textStyle,
    setTextStyle,
    webLink,
    setWebLink,
    mediaFile,
    setMediaFile,
    isUploading,
    setIsUploading,
    resetStore,
  } = useCreateStoryStore();

  const { showUserProfileQuery } = useShowUserProfile();
  const { createStoryMutation } = useCreateStory();
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
    closeModal();
  }, [closeModal]);

  const canSubmit = useCallback(() => {
    if (storyType === "text") {
      return text.trim().length > 0 || backgroundUrl.length > 0;
    }
    return mediaFile !== null;
  }, [storyType, text, backgroundUrl, mediaFile]);

  const handleSubmit = async () => {
    if (!canSubmit() || isUploading) return;

    setIsUploading(true);

    try {
      let payload: CreateStoryPayload;

      if (storyType === "text") {
        payload = {
          type: "text",
          privacy,
          text,
          backgroundUrl: backgroundUrl || undefined,
          textStyle: backgroundUrl ? textStyle : undefined,
          webLink: webLink || undefined,
        };
      } else if (storyType === "image" && mediaFile) {
        const uploadResult = await uploadImageMutation.mutateAsync(mediaFile);
        payload = {
          type: "image",
          privacy,
          media: {
            url: uploadResult.url,
            thumbnailUrl: uploadResult.url,
            provider: uploadResult.provider,
            key: uploadResult.key,
            width: 1080,
            height: 1920,
          },
        };
      } else if (storyType === "video" && mediaFile) {
        const uploadResult = await uploadVideoMutation.mutateAsync(mediaFile);
        payload = {
          type: "video",
          privacy,
          media: {
            url: uploadResult.url,
            thumbnailUrl: uploadResult.url,
            provider: uploadResult.provider,
            key: uploadResult.key,
            durationSec: 15,
            width: 1080,
            height: 1920,
          },
        };
      } else {
        return;
      }

      await createStoryMutation.mutateAsync(payload);

      toast.success("Story created successfully!");
      handleClose();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Create Story
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
            <Select
              value={privacy}
              onValueChange={(value) => setPrivacy(value as StoryPrivacy)}
            >
              <SelectTrigger className="w-[140px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="only_me">Only Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Story Type Selection */}
        {!storyType && (
          <div className="grid grid-cols-3 gap-3 py-4">
            {storyTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setStoryType(option.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <option.icon className={`w-8 h-8 ${option.color}`} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Text Story */}
        {storyType === "text" && (
          <div className="space-y-4">
            <div
              className="relative aspect-[9/16] rounded-xl overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: backgroundUrl || "#667eea" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your story..."
                className="w-full h-full bg-transparent text-center resize-none outline-none p-8 text-xl font-semibold"
                style={{
                  color: textStyle.color,
                  fontSize: `${textStyle.fontSize}px`,
                  textAlign: textStyle.align,
                }}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Background</p>
              <div className="flex gap-2 flex-wrap">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundUrl(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      backgroundUrl === color ? "border-primary ring-2 ring-primary/50" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={() => setBackgroundUrl("")}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Text Color</p>
              <div className="flex gap-2 flex-wrap">
                {["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextStyle({ color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textStyle.color === color ? "border-primary ring-2 ring-primary/50" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Web Link (Optional)</p>
              <Input
                type="url"
                placeholder="https://example.com"
                value={webLink}
                onChange={(e) => setWebLink(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Image Story */}
        {storyType === "image" && (
          <div className="space-y-4">
            {!mediaFile ? (
              <button
                onClick={() => {
                  const input = document.getElementById("story-image-upload");
                  if (input) input.click();
                }}
                className="w-full aspect-[9/16] rounded-xl border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <input
                  id="story-image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith("image/") && file.size <= 25 * 1024 * 1024) {
                      setMediaFile(file);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </button>
            ) : (
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden">
                <img
                  src={URL.createObjectURL(mediaFile)}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setMediaFile(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Video Story */}
        {storyType === "video" && (
          <div className="space-y-4">
            {!mediaFile ? (
              <button
                onClick={() => {
                  const input = document.getElementById("story-video-upload");
                  if (input) input.click();
                }}
                className="w-full aspect-[9/16] rounded-xl border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Video className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload video</span>
                <input
                  id="story-video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith("video/") && file.size <= 300 * 1024 * 1024) {
                      setMediaFile(file);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </button>
            ) : (
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black">
                <video
                  src={URL.createObjectURL(mediaFile)}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
                <button
                  onClick={() => setMediaFile(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {storyType && (
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
                  Creating story...
                </>
              ) : (
                "Share Story"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
