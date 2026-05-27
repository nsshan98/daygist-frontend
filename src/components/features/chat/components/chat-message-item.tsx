"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MoreHorizontal, Reply as ReplyIcon, Smile, Pencil, Trash2, Mic, Play, Pause, Loader2, Paperclip, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import type { ChatMessage, ChatParticipant } from "@/types";

interface ChatMessageItemProps {
  message: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  participant: ChatParticipant | undefined;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  repliedMessage?: any;
  isLast?: boolean;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const VoiceMessagePlayer = ({ url, duration, isMe }: { url: string; duration: number; isMe: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = (currentTime / (duration / 1000)) * 100;

  return (
    <div className="flex items-center gap-2 min-w-40 py-1">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        hidden
      />
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          isMe 
            ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30" 
            : "bg-primary/20 text-primary hover:bg-primary/30"
        )}
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </Button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={cn(
          "h-1.5 rounded-full overflow-hidden relative",
          isMe ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
        )}>
          <div 
            className={cn(
              "absolute inset-y-0 left-0 transition-all duration-100",
              isMe ? "bg-primary-foreground" : "bg-primary"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }} 
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[9px] opacity-70">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] opacity-70">
            {Math.floor(duration / 60000)}:{Math.floor((duration % 60000) / 1000).toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ChatMessageItem = ({
  message,
  isMe,
  showAvatar,
  participant,
  onReply,
  onEdit,
  onDelete,
  onReact,
  repliedMessage,
  isLast,
}: ChatMessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { useSignedUrl } = useSignedMedia();
  
  // Fetch signed URL if media exists
  const { data: signedUrl } = useSignedUrl(message.media?.key);
  const finalMediaUrl = signedUrl || message.media?.url;

  const renderMedia = () => {
    if (!finalMediaUrl) return null;

    switch (message.messageType) {
      case "image":
        return (
          <div className="mt-1 rounded-lg overflow-hidden border border-border">
            <img src={finalMediaUrl} alt="Sent" className="max-w-full h-auto object-cover" />
          </div>
        );
      case "video":
        return (
          <div className="mt-1 rounded-lg overflow-hidden border border-border bg-black">
            <video src={finalMediaUrl} controls className="max-w-full max-h-60" />
          </div>
        );
      case "voice":
        return (
          <VoiceMessagePlayer 
            url={finalMediaUrl} 
            duration={message.mediaMeta.duration} 
            isMe={isMe} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col group/msg w-full",
        isMe ? "items-end" : "items-start",
        repliedMessage ? "mt-4" : "mt-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Replied Message Header & Preview */}
      {repliedMessage && (
        <div className={cn(
          "flex flex-col gap-1 mb-[-12px] z-0",
          isMe ? "items-end" : "items-start"
        )}>
          {/* Who replied to whom header */}
          <div className={cn(
            "flex items-center gap-1 text-[12px] text-muted-foreground/80",
            isMe ? "flex-row mr-1" : "flex-row ml-9"
          )}>
            <span>
              {isMe ? "You replied to " : `${participant?.name} replied to `}
              {repliedMessage.sender === (isMe ? participant?._id : 'me') ? 'yourself' : (isMe ? participant?.name : 'you')}
            </span>
            <ReplyIcon className="h-3 w-3 rotate-180" />
          </div>

          {/* Replied Content Preview - The Quoted Bubble */}
          <div className={cn(
            "flex items-center opacity-50 scale-[0.98] origin-bottom",
            isMe ? "mr-1" : "ml-9"
          )}>
            <div className={cn(
              "bg-muted/80 px-4 py-2 rounded-t-2xl rounded-b-lg text-[13px] flex items-center gap-2 max-w-[260px]",
              isMe ? "rounded-tr-sm" : "rounded-tl-sm"
            )}>
              {(!repliedMessage.text && (repliedMessage.messageType === 'image' || repliedMessage.messageType === 'voice' || repliedMessage.messageType === 'video')) ? (
                <div className="flex items-center gap-1.5 italic text-muted-foreground">
                  <span>Attachment</span>
                  <Paperclip className="h-3.5 w-3.5" />
                </div>
              ) : (
                <span className="truncate">{repliedMessage.text}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "flex items-end gap-2 max-w-[85%] md:max-w-[75%] relative z-10",
        isMe ? "flex-row-reverse" : "flex-row"
      )}>
        {!isMe && (
          <div className="w-7 shrink-0">
            {showAvatar && (
              <Avatar className="w-7 h-7">
                <AvatarImage src={participant?.avatar?.url || ""} />
                <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        )}

        <div className="relative group/content">
          {/* Sending Time (Hover) */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-0",
            isMe ? "right-2" : "left-2",
            isHovered ? "opacity-100 -translate-y-[180%]" : "opacity-0"
          )}>
            <span className="text-[10px] text-white bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-md font-medium">
              {format(new Date(message.createdAt), 'p')}
            </span>
          </div>

          {/* Action Buttons (Hover) */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity duration-200 z-20",
            isMe ? "right-full mr-2 flex-row-reverse" : "left-full ml-2 flex-row",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {/* Reactions Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-7 w-7 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-fit p-1 rounded-full flex items-center gap-1 shadow-lg border border-border bg-card">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message._id, emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Reply Button */}
            <button 
              className="h-7 w-7 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center transition-colors"
              onClick={() => onReply(message)}
            >
              <ReplyIcon className="h-4 w-4" />
            </button>

            {/* More Actions (Edit/Delete) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 w-7 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMe ? "end" : "start"} className="w-32 rounded-xl">
                {isMe && message.messageType === 'text' && (
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(message)}>
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer" 
                  onClick={() => onDelete(message._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={cn(
            "px-3 py-2 rounded-2xl text-sm wrap-break-words relative",
            isMe 
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm" 
              : "bg-muted text-foreground rounded-bl-sm"
          )}>
            {message.text && <p>{message.text}</p>}
            {renderMedia()}
            
            {/* Delivery/Seen Status for My Messages */}
            {isMe && (
              <div className="flex justify-end mt-0.5 -mr-1 -mb-1">
                {message.seen ? (
                  <CheckCheck className="h-3 w-3 text-primary-foreground/90" />
                ) : message.delivered ? (
                  <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                ) : (
                  <Check className="h-3 w-3 text-primary-foreground/60" />
                )}
              </div>
            )}
          </div>

          {/* Reactions Display */}
          {message.reactions?.length > 0 && (
            <div className={cn(
              "absolute bottom-[-10px] z-10",
              isMe ? "left-2" : "right-2"
            )}>
              <div className="bg-background border border-border rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-0.5">
                {Array.from(new Set(message.reactions.map(r => r.emoji))).slice(0, 3).join('')}
                {message.reactions.length > 1 && <span className="ml-0.5 font-medium">{message.reactions.length}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLast && isMe && message.seen && message.seenAt && (
        <div className="mt-2 mr-0 animate-in fade-in slide-in-from-top-1 duration-300">
          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <span>Seen</span>
            <span>{format(new Date(message.seenAt), 'p')}</span>
          </p>
        </div>
      )}
    </div>
  );
};
