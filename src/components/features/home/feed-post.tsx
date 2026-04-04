"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import type { FeedItem } from "./hooks/feed-query";
import { useEditPost, useDeletePost, useSavePost, useUnsavePost, useLikePost, useUnlikePost } from "./hooks/feed-query";
import { MediaViewer } from "./media-viewer";
import { useSignedMedia } from "@/components/features/profile/media-image";
import { toast } from "sonner";
import { useFollowUser, useUnfollowUser } from "../profile";

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
  
  // Mutations
  const { editPostMutation } = useEditPost();
  const { deletePostMutation } = useDeletePost();
  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Handle edit post
  const handleEditPost = () => {
    setEditText(data.text || "");
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    
    editPostMutation.mutate(
      { postId: data._id, text: editText },
      {
        onSuccess: () => {
          toast.success("Post updated successfully");
          setIsEditDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to update post");
        },
      }
    );
  };
  
  // Handle delete post
  const handleDeletePost = () => {
    deletePostMutation.mutate(data._id, {
      onSuccess: () => {
        toast.success("Post deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete post");
      },
    });
  };
  
  // Handle follow/unfollow
  const handleFollowToggle = () => {
    const isFollowing = data.isFollowingAuthor || data.author.isFollowing;
    if (isFollowing) {
      unfollowUserMutation.mutate(data.author._id, {
        onSuccess: () => {
          toast.success(`Unfollowed ${data.author.name}`);
        },
        onError: () => {
          toast.error("Failed to unfollow");
        },
      });
    } else {
      followUserMutation.mutate(data.author._id, {
        onSuccess: () => {
          toast.success(`Following ${data.author.name}`);
        },
        onError: () => {
          toast.error("Failed to follow");
        },
      });
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = () => {
    if (data.isSaved) {
      unsavePostMutation.mutate(data._id, {
        onSuccess: () => {
          toast.success("Post removed from saved");
        },
        onError: () => {
          toast.error("Failed to unsave post");
        },
      });
    } else {
      savePostMutation.mutate(data._id, {
        onSuccess: () => {
          toast.success("Post saved");
        },
        onError: () => {
          toast.error("Failed to save post");
        },
      });
    }
  };

  // Handle like/unlike with optimistic updates
  const handleLikeToggle = () => {
    if (data.isLiked) {
      unlikePostMutation.mutate(data._id);
    } else {
      likePostMutation.mutate(data._id);
    }
  };
  
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
          <Link href={`/${data.author.username}?id=${data.author._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary rounded-xl"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {data.author.isMe ? (
                <>
                  <DropdownMenuItem onClick={handleEditPost} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleFollowToggle} className="cursor-pointer">
                  {data.isFollowingAuthor || data.author.isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
                onClick={handleLikeToggle}
                disabled={likePostMutation.isPending || unlikePostMutation.isPending}
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
              onClick={handleSaveToggle}
              className={`rounded-xl transition-all duration-300 hover:scale-110 ${data.isSaved ? 'text-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
            >
              <Bookmark className={`h-5 w-5 transition-all duration-300 ${data.isSaved ? 'fill-current scale-110' : ''}`} />
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
              <span 
                className="hover:text-foreground transition-colors cursor-pointer"
                onClick={() => onComment?.(data._id)}
              >
                {data.commentCount} comments
              </span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{data.shareCount} shares</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{data.saveCount} saves</span>
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-32 resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!editText.trim() || editPostMutation.isPending}
            >
              {editPostMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
