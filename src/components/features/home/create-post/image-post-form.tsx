"use client";

import { useCallback, useEffect, useState } from "react";
import { useCreatePostStore } from "../stores/create-post-store";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";
import { ImagePlus, X, Grid3X3, LayoutGrid, Rows3, Square, GalleryHorizontal } from "lucide-react";

// Object URL cache for cleanup
const objectUrls = new Set<string>();

export function ImagePostForm() {
  const {
    caption,
    setCaption,
    mediaFiles,
    addMediaFile,
    removeMediaFile,
    imageLayout,
    setImageLayout,
  } = useCreatePostStore();

  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews when files change
  useEffect(() => {
    // Clean up old object URLs
    previews.forEach((url) => {
      if (objectUrls.has(url)) {
        URL.revokeObjectURL(url);
        objectUrls.delete(url);
      }
    });

    // Create new object URLs
    const newPreviews = mediaFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.add(url);
      return url;
    });

    setPreviews(newPreviews);

    // Cleanup on unmount
    return () => {
      newPreviews.forEach((url) => {
        if (objectUrls.has(url)) {
          URL.revokeObjectURL(url);
          objectUrls.delete(url);
        }
      });
    };
  }, [mediaFiles]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      // Limit to 10 images
      const remainingSlots = 10 - mediaFiles.length;
      const filesToAdd = imageFiles.slice(0, remainingSlots);

      filesToAdd.forEach((file) => {
        if (file.size <= 25 * 1024 * 1024) {
          // 25MB limit
          addMediaFile(file);
        }
      });

      // Reset input
      e.target.value = "";
    },
    [mediaFiles.length, addMediaFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      const remainingSlots = 10 - mediaFiles.length;
      const filesToAdd = imageFiles.slice(0, remainingSlots);

      filesToAdd.forEach((file) => {
        if (file.size <= 25 * 1024 * 1024) {
          addMediaFile(file);
        }
      });
    },
    [mediaFiles.length, addMediaFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const layoutOptions = [
    { value: "single" as const, icon: Square, label: "Single" },
    { value: "grid2" as const, icon: LayoutGrid, label: "Grid" },
    { value: "grid3" as const, icon: Grid3X3, label: "Rows" },
    { value: "carousel" as const, icon: GalleryHorizontal, label: "Carousel" },
  ];

  return (
    <div className="space-y-4">
      {/* Caption Input */}
      <Input
        placeholder="Add a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="border-0 bg-muted/30 focus-visible:ring-1"
      />

      {/* Layout Selector (only show if multiple images) */}
      {mediaFiles.length > 1 && (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground mr-2">Layout:</span>
          {layoutOptions.map((option) => (
            <Button
              key={option.value}
              variant={imageLayout === option.value ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setImageLayout(option.value)}
            >
              <option.icon className="w-4 h-4 mr-1" />
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {mediaFiles.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/heic"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drag photos here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum 10 images, 25MB each
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image Preview Grid */}
          <div
            className={cn(
              "grid gap-2 rounded-xl overflow-hidden",
              imageLayout === "single" && "grid-cols-1",
              imageLayout === "grid2" && "grid-cols-2",
              imageLayout === "grid3" && "grid-cols-3",
              imageLayout === "carousel" && "grid-cols-1"
            )}
          >
            {previews.map((preview, index) => (
              <div
                key={index}
                className={cn(
                  "relative group aspect-square bg-muted rounded-lg overflow-hidden",
                  imageLayout === "grid2" && mediaFiles.length === 3 && index === 0 && "row-span-2"
                )}
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
            ))}
          </div>

          {/* Add More Button */}
          {mediaFiles.length < 10 && (
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-more"
              />
              <label htmlFor="image-upload-more" className="flex-1">
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Add More ({mediaFiles.length}/10)
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
