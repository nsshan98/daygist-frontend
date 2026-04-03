"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatePostStore } from "../stores/create-post-store";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import { cn } from "@/lib/utils";
import { Video, X, Film, Clapperboard } from "lucide-react";

// Object URL cache for cleanup
const objectUrls = new Set<string>();

export function VideoPostForm() {
  const {
    caption,
    setCaption,
    videoFile,
    setVideoFile,
    videoMode,
    setVideoMode,
    mutedByDefault,
    setMutedByDefault,
    loop,
    setLoop,
  } = useCreatePostStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate preview when file changes
  useEffect(() => {
    // Clean up old object URL
    if (preview && objectUrls.has(preview)) {
      URL.revokeObjectURL(preview);
      objectUrls.delete(preview);
    }

    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      objectUrls.add(url);
      setPreview(url);
    } else {
      setPreview(null);
      setVideoMetadata(null);
    }

    // Cleanup on unmount
    return () => {
      if (preview && objectUrls.has(preview)) {
        URL.revokeObjectURL(preview);
        objectUrls.delete(preview);
      }
    };
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoMetadata({
        duration: videoRef.current.duration,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        if (file.size <= 300 * 1024 * 1024) {
          // 300MB limit
          setVideoFile(file);
        }
      }
      // Reset input
      e.target.value = "";
    },
    [setVideoFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("video/")) {
        if (file.size <= 300 * 1024 * 1024) {
          setVideoFile(file);
        }
      }
    },
    [setVideoFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleRemove = () => {
    setVideoFile(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Caption Input */}
      <Input
        placeholder="Add a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="border-0 bg-muted/30 focus-visible:ring-1"
      />

      {/* Video Mode Selector */}
      <div className="flex gap-2 p-2 bg-muted/30 rounded-lg">
        <Button
          variant={videoMode === "standard" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setVideoMode("standard")}
        >
          <Film className="w-4 h-4 mr-2" />
          Standard
        </Button>
        <Button
          variant={videoMode === "reels" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setVideoMode("reels")}
        >
          <Clapperboard className="w-4 h-4 mr-2" />
          Reels
        </Button>
      </div>

      {/* Video Options */}
      {videoFile && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="muted"
                checked={mutedByDefault}
                onCheckedChange={setMutedByDefault}
              />
              <Label htmlFor="muted" className="text-sm cursor-pointer">
                Muted
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="loop" checked={loop} onCheckedChange={setLoop} />
              <Label htmlFor="loop" className="text-sm cursor-pointer">
                Loop
              </Label>
            </div>
          </div>
          {videoMetadata && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(videoMetadata.duration)} • {videoMetadata.width}x
              {videoMetadata.height}
            </span>
          )}
        </div>
      )}

      {/* Drop Zone or Preview */}
      {!videoFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="cursor-pointer block">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drag video here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum 300MB, any video format
            </p>
          </label>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={preview || undefined}
            className={cn(
              "w-full",
              videoMode === "reels" ? "aspect-9/16 max-h-[400px]" : "aspect-video"
            )}
            controls
            muted={mutedByDefault}
            loop={loop}
            onLoadedMetadata={handleLoadedMetadata}
          />
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
