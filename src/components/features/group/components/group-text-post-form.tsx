"use client";

import { useCreateGroupPostStore, TEXT_BACKGROUNDS } from "../stores/create-group-post-store";
import { Textarea } from "@/components/atoms/textarea";
import { cn } from "@/lib/utils";
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Minus, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";

export function GroupTextPostForm() {
  const {
    textContent,
    setTextContent,
    textBackground,
    setTextBackground,
    textStyle,
    setTextStyle,
    mediaFiles,
    videoFile,
  } = useCreateGroupPostStore();

  const hasMedia = mediaFiles.length > 0 || videoFile !== null;

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(48, textStyle.fontSize + delta));
    setTextStyle({ fontSize: newSize });
  };

  return (
    <div className="space-y-4">
      {/* Text Input Area */}
      <div
        className={cn(
          "relative min-h-[150px] rounded-xl overflow-hidden transition-all duration-300",
          textBackground ? "bg-cover bg-center" : "bg-transparent"
        )}
        style={
          textBackground
            ? {
                backgroundImage: `url(${textBackground})`,
              }
            : undefined
        }
      >
        <Textarea
          placeholder="What's on your mind?"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className={cn(
            "min-h-[150px] border-0 resize-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70 text-base",
            textBackground 
              ? "text-center" 
              : "text-left"
          )}
          style={{
            color: textBackground ? textStyle.color : undefined,
            fontSize: textBackground ? `${textStyle.fontSize}px` : '16px',
            fontWeight: textBackground ? textStyle.fontWeight : '400',
            textAlign: textBackground ? textStyle.align : 'left',
          }}
        />
        {/* Character count - only show if background selected */}
        {textBackground && (
          <div className="absolute bottom-2 right-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            {textContent.length} chars
          </div>
        )}
      </div>

      {/* Text Style Controls */}
      {textBackground && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
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
              <span className="text-sm w-8 text-center">{textStyle.fontSize}</span>
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
              variant={textStyle.align === "left" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTextStyle({ align: "left" })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={textStyle.align === "center" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTextStyle({ align: "center" })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={textStyle.align === "right" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setTextStyle({ align: "right" })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant={textStyle.fontWeight === "700" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setTextStyle({ fontWeight: textStyle.fontWeight === "700" ? "400" : "700" })
            }
          >
            <Bold className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Background Selector - Only show if no media */}
      {!hasMedia && (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Background</span>
          <div className="flex gap-2 flex-wrap">
            {/* No background option */}
            <button
              onClick={() => setTextBackground(null)}
              className={cn(
                "w-16 h-16 rounded-xl border-2 transition-all duration-200 flex items-center justify-center bg-muted/30",
                textBackground === null
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
                onClick={() => setTextBackground(bg.url)}
                className={cn(
                  "w-16 h-16 rounded-xl border-2 transition-all duration-200 overflow-hidden",
                  textBackground === bg.url
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
      )}
    </div>
  );
}
