"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";

export const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
] as const;

export type ReactionType = (typeof REACTIONS)[number]["type"];

const reactionEmojiMap: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

interface ReactionPickerProps {
  isLiked: boolean;
  currentReaction?: string | null;
  onReact: (reaction: string) => void;
  onRemoveReact: () => void;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  iconSize?: "sm" | "md" | "lg";
  showCount?: boolean;
  likeCount?: number;
  buttonText?: string;
  likedText?: string;
  showLabel?: boolean;
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
  hoverClassName?: string;
  countClassName?: string;
}

export function ReactionPicker({
  isLiked,
  currentReaction,
  onReact,
  onRemoveReact,
  isLoading = false,
  size = "md",
  iconSize = "md",
  showCount = true,
  likeCount = 0,
  buttonText,
  likedText,
  showLabel = true,
  className = "",
  buttonClassName = "",
  activeClassName = "",
  hoverClassName = "",
  countClassName = "",
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  useEffect(() => {
    if (!showPicker || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 220;
    const viewportWidth = window.innerWidth;

    let left = rect.left + rect.width / 2 - popupWidth / 2;
    if (left < 8) left = 8;
    if (left + popupWidth > viewportWidth - 8) left = viewportWidth - popupWidth - 8;

    setPopupStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${rect.top - 8}px`,
      transform: "translateY(-100%)",
      zIndex: 9999,
    });
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (popupRef.current && popupRef.current.contains(e.target as Node)) return;
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const handleSelect = (reaction: string) => {
    setShowPicker(false);
    if (isLiked && currentReaction === reaction) {
      onRemoveReact();
    } else {
      onReact(reaction);
    }
  };

  const currentEmoji = isLiked && currentReaction ? reactionEmojiMap[currentReaction] : null;

  const sizeMap = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-10 w-10" };
  const iconSizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  const btnSize = sizeMap[size];
  const iSize = iconSizeMap[iconSize];

  return (
    <div
      ref={ref}
      className={`inline-flex items-center ${className}`}
      onMouseEnter={() => {
        if (!isTouchDevice) {
          if (hideTimer.current) clearTimeout(hideTimer.current);
          setShowPicker(true);
        }
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) {
          hideTimer.current = setTimeout(() => setShowPicker(false), 200);
        }
      }}
    >
      {showPicker && typeof document !== "undefined" && createPortal(
        <div
          style={popupStyle}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={() => {
            hideTimer.current = setTimeout(() => setShowPicker(false), 200);
          }}
        >
          <div className="flex items-center gap-0.5 bg-background dark:bg-gray-800 rounded-full px-2.5 py-1.5 shadow-xl border">
            {REACTIONS.map((r, i) => (
              <button
                key={r.type}
                type="button"
                onClick={() => handleSelect(r.type)}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-full transition-all duration-150 hover:scale-125 hover:-translate-y-1 ${
                  isLiked && currentReaction === r.type ? "bg-primary/10 scale-110" : ""
                }`}
                style={{ animation: `reactionPopIn 0.2s ease-out ${i * 0.035}s both` }}
                title={r.label}
              >
                <span className="text-xl leading-none">{r.emoji}</span>
                <span className="text-[7px] font-semibold text-muted-foreground whitespace-nowrap leading-none">
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          if (isTouchDevice) {
            if (showPicker) {
              handleSelect(currentReaction || "like");
            } else {
              setShowPicker(true);
            }
          } else {
            handleSelect(currentReaction || "like");
          }
        }}
        disabled={isLoading}
        className={`${btnSize} rounded-full inline-flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-110 ${
          isLiked
            ? `text-red-500 ${activeClassName || "hover:bg-red-50 dark:hover:bg-red-950/30"}`
            : hoverClassName || "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
        } ${buttonClassName}`}
      >
        {currentEmoji ? (
          <span className={`${iSize} flex items-center justify-center`}>{currentEmoji}</span>
        ) : (
          <Heart
            className={`${iSize} transition-all duration-300 ${
              isLiked ? "fill-current" : ""
            }`}
          />
        )}
        {showLabel && (isLiked && likedText ? <span className="text-xs font-medium">{likedText}</span> : buttonText ? <span className="text-xs font-medium">{buttonText}</span> : null)}
      </button>

      {showCount && likeCount > 0 && (
        <span className={`text-xs text-muted-foreground ml-1 font-medium ${countClassName}`}>
          {likeCount}
        </span>
      )}
    </div>
  );
}
