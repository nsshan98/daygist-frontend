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
import { useUpdateGroupPost } from "../hooks/group-post-query";
import type { GroupPostData, EditGroupPostPayload } from "@/types";
import { toast } from "sonner";
import { EditPostForm } from "@/components/molecules/edit-post-form";

interface EditGroupPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: GroupPostData;
}

const layoutOptions = [
  { value: "single", label: "Single" },
  { value: "grid2", label: "Grid 2" },
  { value: "grid3", label: "Grid 3" },
  { value: "carousel", label: "Carousel" },
];

export function EditGroupPostDialog({ isOpen, onOpenChange, post }: EditGroupPostDialogProps) {
  const groupId = typeof post.groupId === "string" ? post.groupId : post.groupId?._id || "";
  const { updateGroupPostMutation } = useUpdateGroupPost(groupId);

  const [text, setText] = useState(post.text || "");
  const [backgroundUrl, setBackgroundUrl] = useState(post.backgroundUrl || null as string | null);
  const [layout, setLayout] = useState(post.layout || "single");
  const [textColor, setTextColor] = useState(post.textStyle?.color || "#ffffff");
  const [fontSize, setFontSize] = useState(post.textStyle?.fontSize || 24);
  const [fontWeight, setFontWeight] = useState(post.textStyle?.fontWeight || "700");
  const [textAlign, setTextAlign] = useState(post.textStyle?.align || "center");

  useEffect(() => {
    if (isOpen && post) {
      setText(post.text || "");
      setBackgroundUrl(post.backgroundUrl || null);
      setLayout(post.layout || "single");
      setTextColor(post.textStyle?.color || "#ffffff");
      setFontSize(post.textStyle?.fontSize || 24);
      setFontWeight(post.textStyle?.fontWeight || "700");
      setTextAlign(post.textStyle?.align || "center");
    }
  }, [isOpen, post]);

  const handleSave = () => {
    const payload: EditGroupPostPayload = {};

    if (post.type === "text") {
      if (text !== post.text) payload.text = text;
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
      if (layout !== post.layout) payload.layout = layout;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    updateGroupPostMutation.mutate(
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
          layoutOptions={layoutOptions}
        />

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateGroupPostMutation.isPending}>
            {updateGroupPostMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
