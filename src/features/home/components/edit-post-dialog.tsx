"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { useEditPost } from "../hooks/feed-query";
import type { FeedPostData, EditPostPayload } from "@/types";
import { toast } from "sonner";
import { EditPostForm } from "@/components/molecules/edit-post-form";

interface EditPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: FeedPostData;
}

const layoutOptions = [
  { value: "default", label: "Default" },
  { value: "grid", label: "Grid" },
  { value: "carousel", label: "Carousel" },
];

export function EditPostDialog({ isOpen, onOpenChange, post }: EditPostDialogProps) {
  const { editPostMutation } = useEditPost();

  const [text, setText] = useState(post.text || "");
  const [privacy, setPrivacy] = useState(post.privacy || "public");
  const [backgroundUrl, setBackgroundUrl] = useState(post.backgroundUrl || null as string | null);
  const [layout, setLayout] = useState(post.layout || "default");
  const [textColor, setTextColor] = useState(post.textStyle?.color || "#ffffff");
  const [fontSize, setFontSize] = useState(post.textStyle?.fontSize || 24);
  const [fontWeight, setFontWeight] = useState(post.textStyle?.fontWeight || "700");
  const [textAlign, setTextAlign] = useState(post.textStyle?.align || "center");

  useEffect(() => {
    if (isOpen && post) {
      setText(post.text || "");
      setPrivacy(post.privacy || "public");
      setBackgroundUrl(post.backgroundUrl || null);
      setLayout(post.layout || "default");
      setTextColor(post.textStyle?.color || "#ffffff");
      setFontSize(post.textStyle?.fontSize || 24);
      setFontWeight(post.textStyle?.fontWeight || "700");
      setTextAlign(post.textStyle?.align || "center");
    }
  }, [isOpen, post]);

  const handleSave = () => {
    const payload: EditPostPayload = {};

    if (post.type === "text") {
      if (text !== post.text) payload.text = text;
      if (privacy !== post.privacy) payload.privacy = privacy;
      if (backgroundUrl !== post.backgroundUrl) payload.backgroundUrl = backgroundUrl || undefined;
      if (post.textStyle) {
        payload.textStyle = {
          color: textColor,
          fontSize: fontSize,
          fontWeight: fontWeight,
          align: textAlign,
        };
      }
    } else if (post.type === "image" || post.type === "video") {
      if (text !== post.text) payload.text = text;
      if (privacy !== post.privacy) payload.privacy = privacy;
      if (layout !== post.layout) payload.layout = layout;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    editPostMutation.mutate(
      { postId: post._id, payload },
      {
        onSuccess: () => {
          toast.success("Post updated successfully");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to update post");
        },
      }
    );
  };

  const isTextPost = post.type === "text";
  const isMediaPost = post.type === "image" || post.type === "video";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <EditPostForm
          text={text}
          setText={setText}
          backgroundUrl={backgroundUrl}
          setBackgroundUrl={setBackgroundUrl}
          layout={layout}
          setLayout={setLayout}
          textColor={textColor}
          setTextColor={setTextColor}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontWeight={fontWeight}
          setFontWeight={setFontWeight}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          isTextPost={isTextPost}
          isMediaPost={isMediaPost}
          privacy={privacy}
          setPrivacy={setPrivacy}
          layoutOptions={layoutOptions}
        />

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!text.trim() || editPostMutation.isPending}
          >
            {editPostMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
