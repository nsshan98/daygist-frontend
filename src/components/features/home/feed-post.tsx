"use client";

import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import type { FeedItem } from "./hooks/feed-query";
import { MediaViewer } from "./media-viewer";
import { useSignedMedia } from "@/components/features/profile/media-image";

interface FeedPostProps {
  post: FeedItem;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function FeedPost({
  post,
  onLike,
  onSave,
  onShare,
  onComment,
}: FeedPostProps) {
  const { data } = post;
  const { useSignedUrl } = useSignedMedia();
  
  // Fetch signed URL for avatar
  const { data: signedAvatarUrl } = useSignedUrl(data.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || data.author.avatar.url;
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  // Render text post with background
  const renderTextPost = () => {
    if (data.backgroundUrl && data.textStyle) {
      return (
        <div 
          className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-inner"
          style={{ 
            backgroundImage: `url(${data.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
            <p 
              className="text-center leading-relaxed"
              style={{
                color: data.textStyle.color,
                fontSize: `${data.textStyle.fontSize}px`,
                fontWeight: data.textStyle.fontWeight,
                textAlign: data.textStyle.align as any
              }}
            >
              {data.text}
            </p>
          </div>
        </div>
      );
    }

    // Plain text post
    if (data.text) {
      return (
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {data.text}
        </p>
      );
    }

    return null;
  };

  // Render media grid
  const renderMediaGrid = () => {
    if (!data.medias || data.medias.length === 0) return null;

    // Single media
    if (data.medias.length === 1) {
      return (
        <div className="mt-4">
          <MediaViewer media={data.medias[0]} layout={data.layout} />
        </div>
      );
    }

    // Multiple media - Grid layout
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.medias.map((media, index) => (
          <MediaViewer key={index} media={media} layout="grid" />
        ))}
      </div>
    );
  };

  return (
    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-2xl" />
      </div>

      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-lg">
              <AvatarImage src={finalAvatarUrl} alt={data.author.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                {data.author.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors duration-300">{data.author.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>@{data.author.username}</span>
                <span>•</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {formatRelativeTime(data.createdAt)}
                </span>
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary rounded-xl"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 relative">
        {/* Text content */}
        {renderTextPost()}
        
        {/* Media content */}
        {renderMediaGrid()}
      </CardContent>

      <CardFooter className="pt-3 relative">
        <div className="flex w-full flex-col gap-4">
          {/* Action Buttons - Enhanced with hover effects */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLike?.(data._id)}
                className={`group/like relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-110 ${data.isLiked ? 'text-red-500' : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'}`}
              >
                {/* Like animation background */}
                <div className="absolute inset-0 bg-red-500/10 scale-0 group-hover/like:scale-100 transition-transform duration-300 rounded-xl" />
                <Heart className={`h-5 w-5 relative z-10 transition-all duration-300 ${data.isLiked ? 'fill-current scale-110' : 'group-hover/like:scale-125'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onComment?.(data._id)}
                className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onShare?.(data._id)}
                className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave?.(data._id)}
              className={`rounded-xl transition-all duration-300 hover:scale-110 ${data.isShared ? 'text-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
            >
              <Bookmark className={`h-5 w-5 transition-all duration-300 ${data.isShared ? 'fill-current scale-110' : ''}`} />
            </Button>
          </div>

          {/* Stats - Enhanced styling */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-2 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <Heart className="w-3 h-3 fill-white text-white" />
                </div>
              </div>
              <span className="font-medium hover:text-foreground transition-colors cursor-pointer">
                {data.likeCount.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="hover:text-foreground transition-colors cursor-pointer">{data.commentCount} comments</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{data.shareCount} shares</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{data.saveCount} saves</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
