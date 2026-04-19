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
import { Textarea } from "@/components/atoms/textarea";
import { Label } from "@/components/atoms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useUpdateGroupPost } from "../hooks/group-post-query";
import type { GroupPostData, EditGroupPostPayload } from "@/types";
import { toast } from "sonner";
import { AlignLeft, AlignCenter, AlignRight, Bold, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT_BACKGROUNDS } from "../stores/create-group-post-store";

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
  const groupId = typeof post.groupId === 'string' ? post.groupId : post.groupId?._id || '';
  const { updateGroupPostMutation } = useUpdateGroupPost(groupId);
  
  // Form state
  const [text, setText] = useState(post.text || "");
  const [backgroundUrl, setBackgroundUrl] = useState(post.backgroundUrl || null as string | null);
  const [layout, setLayout] = useState(post.layout || "single");
  const [textColor, setTextColor] = useState(post.textStyle?.color || "#ffffff");
  const [fontSize, setFontSize] = useState(post.textStyle?.fontSize || 24);
  const [fontWeight, setFontWeight] = useState(post.textStyle?.fontWeight || "700");
  const [textAlign, setTextAlign] = useState(post.textStyle?.align || "center");

  // Reset form when dialog opens with post data
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

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(48, fontSize + delta));
    setFontSize(newSize);
  };

  const handleSave = () => {
    const payload: EditGroupPostPayload = {};

    // Only include fields that are relevant to the post type
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
      if (text !== post.text) payload.text = text; // caption
      if (layout !== post.layout) payload.layout = layout;
    }

    // Check if there are any changes
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
        
        <div className="py-4 space-y-4">
          {/* Text/Caption Field */}
          <div className="space-y-2">
            <Label>{isTextPost ? "Text" : "Caption"}</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isTextPost ? "What's on your mind?" : "Add a caption..."}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Text Post Specific Fields */}
          {isTextPost && (
            <>
              {/* Text Style Controls */}
              {backgroundUrl && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Font Size</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleFontSizeChange(-2)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{fontSize}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleFontSizeChange(2)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant={textAlign === "left" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setTextAlign("left")}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={textAlign === "center" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setTextAlign("center")}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={textAlign === "right" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setTextAlign("right")}
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant={fontWeight === "700" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setFontWeight(fontWeight === "700" ? "400" : "700")}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Background Selector */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Background</Label>
                <div className="flex gap-2 flex-wrap">
                  {/* No background option */}
                  <button
                    type="button"
                    onClick={() => setBackgroundUrl(null)}
                    className={cn(
                      "w-16 h-16 rounded-xl border-2 transition-all duration-200 flex items-center justify-center bg-muted/30",
                      backgroundUrl === null
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">None</span>
                  </button>
                  
                  {/* Background options */}
                  {TEXT_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.url}
                      type="button"
                      onClick={() => setBackgroundUrl(bg.url)}
                      className={cn(
                        "w-16 h-16 rounded-xl border-2 transition-all duration-200 overflow-hidden",
                        backgroundUrl === bg.url
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview for text posts with background */}
              {backgroundUrl && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <div 
                    className="relative aspect-video w-full overflow-hidden rounded-lg shadow-inner"
                    style={{ 
                      backgroundImage: `url(${backgroundUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                      <p 
                        className="text-center leading-relaxed"
                        style={{
                          color: textColor,
                          fontSize: `${fontSize}px`,
                          fontWeight: fontWeight,
                          textAlign: textAlign as any,
                        }}
                      >
                        {text || "Your text here..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Media Post Specific Fields */}
          {isMediaPost && (
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateGroupPostMutation.isPending}
          >
            {updateGroupPostMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
