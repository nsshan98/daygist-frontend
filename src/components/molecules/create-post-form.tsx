"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { FEELINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Type, Image as ImageIcon, Video, SmilePlus, X } from "lucide-react";

interface CreatePostFormProps {
  user?: { name?: string; avatar?: { url: string; key: string | null } | null };
  avatarUrl?: string;
  textContent: string;
  setTextContent: (v: string) => void;
  mediaFiles: File[];
  addMediaFile: (file: File) => void;
  removeMediaFile: (index: number) => void;
  clearMediaFiles: () => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  videoMode: "standard" | "reels" | null;
  setVideoMode: (mode: "standard" | "reels" | null) => void;
  mutedByDefault: boolean;
  setMutedByDefault: (v: boolean) => void;
  loop: boolean;
  setLoop: (v: boolean) => void;
  feeling: string | null;
  setFeeling: (f: string | null) => void;
  headerSlot?: React.ReactNode;
  videoLabel?: string;
  fileInputPrefix?: string;
  imageInputId?: string;
  videoInputId?: string;
}

export function CreatePostForm({
  user,
  avatarUrl,
  textContent,
  setTextContent,
  mediaFiles,
  addMediaFile,
  removeMediaFile,
  clearMediaFiles,
  videoFile,
  setVideoFile,
  videoMode,
  setVideoMode,
  mutedByDefault,
  setMutedByDefault,
  loop,
  setLoop,
  feeling,
  setFeeling,
  headerSlot,
  videoLabel = "Reels",
  fileInputPrefix = "",
  imageInputId = "image-upload-inline",
  videoInputId = "video-upload-inline",
}: CreatePostFormProps) {
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    imageFiles.forEach((file) => {
      if (file.size <= 25 * 1024 * 1024) {
        addMediaFile(file);
      }
    });
    e.target.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/") && file.size <= 300 * 1024 * 1024) {
      setVideoFile(file);
    }
    e.target.value = "";
  };

  return (
    <>
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
              is feeling {feeling.toLowerCase()}{" "}
              {FEELINGS.find((f) => f.label === feeling)?.emoji}
            </p>
          )}
          {headerSlot}
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-4">
        <div className="relative min-h-[150px] rounded-xl overflow-hidden">
          <Textarea
            placeholder="What's on your mind?"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="min-h-[150px] border-0 resize-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70 text-base text-left"
          />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">Add to your post</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => document.getElementById(imageInputId)?.click()}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all"
            >
              <ImageIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm">Photo</span>
            </button>
            <button
              onClick={() => {
                setVideoMode("reels");
                document.getElementById(videoInputId)?.click();
              }}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-red-500/50 hover:bg-red-500/5 transition-all"
            >
              <Video className="w-5 h-5 text-red-500" />
              <span className="text-sm">{videoLabel}</span>
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
            id={imageInputId}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/heic"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            id={videoInputId}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
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
                {FEELINGS.map((f) => (
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
      </div>

      {/* Image preview section */}
      {mediaFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Photos</p>
            <button
              onClick={clearMediaFiles}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {mediaFiles.map((file, index) => {
              const preview = URL.createObjectURL(file);
              return (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeMediaFile(index)}
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
              onClick={() => document.getElementById(imageInputId)?.click()}
              className="w-full p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add more photos</p>
            </button>
          )}
        </div>
      )}

      {/* Video preview section */}
      {videoFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{videoLabel}</p>
            <button
              onClick={() => setVideoFile(null)}
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
                onChange={(e) => setMutedByDefault(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Muted</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Loop</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}
