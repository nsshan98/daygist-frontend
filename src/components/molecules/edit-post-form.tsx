"use client";

import { useState, useEffect } from "react";
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
import { Globe, Users, Lock, AlignLeft, AlignCenter, AlignRight, Bold, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT_BACKGROUNDS } from "@/features/home/stores/create-post-store";

interface EditPostFormProps {
  text: string;
  setText: (v: string) => void;
  backgroundUrl: string | null;
  setBackgroundUrl: (v: string | null) => void;
  layout: string;
  setLayout: (v: string) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  fontWeight: string;
  setFontWeight: (v: string) => void;
  textAlign: string;
  setTextAlign: (v: string) => void;
  isTextPost: boolean;
  isMediaPost: boolean;
  privacy?: string;
  setPrivacy?: (v: string) => void;
  layoutOptions: { value: string; label: string }[];
}

export function EditPostForm({
  text,
  setText,
  backgroundUrl,
  setBackgroundUrl,
  layout,
  setLayout,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight,
  textAlign,
  setTextAlign,
  isTextPost,
  isMediaPost,
  privacy,
  setPrivacy,
  layoutOptions,
}: EditPostFormProps) {
  const [localFontSize, setLocalFontSize] = useState(fontSize);

  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(48, localFontSize + delta));
    setLocalFontSize(newSize);
    setFontSize(newSize);
  };

  const privacyOptions = [
    { value: "public", label: "Public", icon: Globe, description: "Anyone can see" },
    { value: "friends", label: "Friends", icon: Users, description: "Only friends can see" },
    { value: "private", label: "Private", icon: Lock, description: "Only you can see" },
  ];

  return (
    <div className="py-4 space-y-4">
      {/* Privacy Selector - Only for feed posts */}
      {privacy !== undefined && setPrivacy && (
        <div className="space-y-2">
          <Label>Privacy</Label>
          <Select value={privacy} onValueChange={setPrivacy}>
            <SelectTrigger>
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              {privacyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
                    <span className="text-sm w-8 text-center">{localFontSize}</span>
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
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
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
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                  <p
                    className="text-center leading-relaxed"
                    style={{
                      color: textColor,
                      fontSize: `${localFontSize}px`,
                      fontWeight: fontWeight,
                      textAlign: textAlign as "left" | "center" | "right",
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
  );
}
