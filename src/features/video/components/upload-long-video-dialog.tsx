"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Spinner } from "@/components/atoms/spinner";
import {
  uploadLongVideoSchema,
  UploadLongVideoSchemaType,
} from "@/schema/video-schema";
import { useUploadLongVideo } from "../hooks/video-query";
import { useUploadImage, useUploadVideo } from "@/features/home/hooks/upload-query";
import { Upload, Image, X } from "lucide-react";

interface UploadLongVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadLongVideoDialog({
  open,
  onOpenChange,
}: UploadLongVideoDialogProps) {
  const { uploadLongVideoMutation } = useUploadLongVideo();
  const { uploadVideoMutation } = useUploadVideo();
  const { uploadImageMutation } = useUploadImage();
  const [globalError, setGlobalError] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<string>("");

  const form = useForm<UploadLongVideoSchemaType>({
    resolver: zodResolver(uploadLongVideoSchema),
    defaultValues: {
      video: undefined,
      thumbnail: undefined,
      title: "",
      description: "",
      subCategory: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleVideoUpload = (
    field: { onChange: (file: File) => void }
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        field.onChange(file);
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
      }
    };
    
    input.click();
  };

  const handleThumbnailUpload = (
    field: { onChange: (file: File) => void }
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        field.onChange(file);
        const url = URL.createObjectURL(file);
        setThumbnailPreview(url);
      }
    };
    
    input.click();
  };

  const removeVideo = (field: { onChange: (file?: File) => void }) => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    field.onChange(undefined);
  };

  const removeThumbnail = (field: { onChange: (file?: File) => void }) => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    field.onChange(undefined);
  };

  const onSubmit = async (data: UploadLongVideoSchemaType) => {
    setGlobalError("");
    setUploadStage("");

    try {
      // Step 1: Upload video file
      setUploadStage("Uploading video...");
      const videoResult = await uploadVideoMutation.mutateAsync(data.video);

      // Step 2: Upload thumbnail if provided
      let thumbnailResult = null;
      if (data.thumbnail) {
        setUploadStage("Uploading thumbnail...");
        thumbnailResult = await uploadImageMutation.mutateAsync(data.thumbnail);
      }

      // Step 3: Submit the payload with uploaded media references
      setUploadStage("Submitting...");
      await uploadLongVideoMutation.mutateAsync({
        video: {
          url: videoResult.url,
          key: videoResult.key,
          provider: videoResult.provider,
        },
        ...(thumbnailResult && {
          thumbnail: {
            url: thumbnailResult.url,
            key: thumbnailResult.key,
            provider: thumbnailResult.provider,
          },
        }),
        title: data.title,
        description: data.description,
        subCategory: data.subCategory,
      });
      
      // Clean up previews
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      
      form.reset();
      setVideoPreview(null);
      setThumbnailPreview(null);
      setUploadStage("");
      onOpenChange(false);
    } catch (error: any) {
      setUploadStage("");
      console.error("Upload long video error:", error);
      setGlobalError(
        error.response?.data?.message || "Failed to upload video"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Long Video</DialogTitle>
          <DialogDescription>
            Upload your long video with optional thumbnail, title, and description.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {globalError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {globalError}
              </div>
            )}

            {/* Video Upload */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Video</h3>
              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        {videoPreview ? (
                          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                            <video
                              src={videoPreview}
                              className="w-full h-full object-cover"
                              controls
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeVideo(field)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() => handleVideoUpload(field)}
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Upload Video
                              </span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Thumbnail (Optional)</h3>
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        {thumbnailPreview ? (
                          <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                            <img
                              src={thumbnailPreview}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeThumbnail(field)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-24 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() => handleThumbnailUpload(field)}
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <Image className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Upload Thumbnail
                              </span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Video title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Video description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sub Category */}
            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sub category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || uploadLongVideoMutation.isPending || uploadVideoMutation.isPending || uploadImageMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadLongVideoMutation.isPending || uploadVideoMutation.isPending || uploadImageMutation.isPending}
              >
                {uploadVideoMutation.isPending || uploadImageMutation.isPending || uploadLongVideoMutation.isPending ? (
                  <>
                    {uploadStage || "Processing..."}
                    <Spinner />
                  </>
                ) : (
                  "Upload Video"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
