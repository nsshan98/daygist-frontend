"use client";

import Link from "next/link";
import { Heart, MessageCircle, Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import type { SavedPost } from "@/types";
import { useLikePost, useUnlikePost } from "@/components/features/home/hooks/feed-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import { useState } from "react";
import { Skeleton } from "@/components/atoms/skeleton";
import { ReactionPicker } from "@/components/shared/reaction-picker";

interface SavedPostCardProps {
  post: SavedPost;
  onUnsave: (postId: string) => void;
  isUnsaving?: boolean;
}

export function SavedPostCard({ post, onUnsave, isUnsaving }: SavedPostCardProps) {
  const { useSignedUrl } = useSignedMedia();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();

  const handleReact = (reaction: string) => {
    likePostMutation.mutate({ postId: post._id, reaction });
  };

  const handleRemoveReact = () => {
    unlikePostMutation.mutate(post._id);
  };

  // Fetch signed URL for avatar
  const { data: signedAvatarUrl } = useSignedUrl(post.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || post.author.avatar?.url;

  // Get the first media for preview
  const firstMedia = post.medias?.[0];
  const { data: signedMediaUrl } = useSignedUrl(firstMedia?.key || null);
  const finalMediaUrl = signedMediaUrl || firstMedia?.url;

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
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Render preview based on post type
  const renderPreview = () => {
    if (post.type === "text" && post.backgroundUrl) {
      return (
        <div
          className="relative aspect-square w-full overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${post.backgroundUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
            <p
              className="text-center leading-relaxed line-clamp-3"
              style={{
                color: post.textStyle?.color || "#ffffff",
                fontSize: `${Math.min(post.textStyle?.fontSize || 24, 18)}px`,
                fontWeight: post.textStyle?.fontWeight || "700",
                textAlign: (post.textStyle?.align as any) || "center",
              }}
            >
              {post.text}
            </p>
          </div>
        </div>
      );
    }

    if (post.type === "text") {
      return (
        <div className="relative aspect-square w-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
          <p className="text-center text-foreground line-clamp-4 text-sm">
            {post.text || "No content"}
          </p>
        </div>
      );
    }

    if (firstMedia) {
      return (
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={finalMediaUrl}
            alt="Post preview"
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {post.medias.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{post.medias.length - 1}
            </div>
          )}
          {post.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No preview</span>
      </div>
    );
  };

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Preview Section */}
      <Link href={`/posts/${post._id}`} prefetch={false} className="block">
        <div className="relative overflow-hidden">{renderPreview()}</div>
      </Link>

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/${post.author.username}?id=${post.author._id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={finalAvatarUrl} alt={post.author.name} />
              <AvatarFallback className="bg-primary/20 text-xs">
                {post.author.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.author.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                @{post.author.username}
              </p>
            </div>
          </Link>
        </div>

        {/* Post Text Preview */}
        {post.text && post.type !== "text" && (
          <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
            {post.text}
          </p>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <ReactionPicker
              isLiked={post.isLiked || false}
              currentReaction={post.reaction}
              likeCount={post.likeCount || 0}
              onReact={handleReact}
              onRemoveReact={handleRemoveReact}
              isLoading={likePostMutation.isPending || unlikePostMutation.isPending}
              size="sm"
              iconSize="sm"
              showCount={true}
              className="hover:text-foreground"
              activeClassName="text-red-500"
              hoverClassName="hover:text-red-500"
            />
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentCount}
            </span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <Bookmark className="h-4 w-4 fill-primary text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/posts/${post._id}`} prefetch={false}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Post
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUnsave(post._id)}
                disabled={isUnsaving}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isUnsaving ? "Removing..." : "Remove Save"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
