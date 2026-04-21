"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Pencil } from "lucide-react";
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
import { useDeleteGroupPost, useLikeGroupPost, useUnlikeGroupPost, useShareGroupPost } from "../hooks/group-post-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import { EditGroupPostDialog } from "./edit-group-post-dialog";
import { GroupCommentDialog } from "./group-comment-dialog";
import { toast } from "sonner";
import { GroupPostData } from "@/types";

interface GroupPostCardProps {
  post: GroupPostData;
  groupId: string;
  isAuthor: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function GroupPostCard({
  post,
  groupId,
  isAuthor,
  onLike,
  onComment,
  onShare,
}: GroupPostCardProps) {
  const { useSignedUrl } = useSignedMedia();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const { likeGroupPostMutation } = useLikeGroupPost(groupId);
  const { unlikeGroupPostMutation } = useUnlikeGroupPost(groupId);
  const { shareGroupPostMutation } = useShareGroupPost(groupId);
  const { deleteGroupPostMutation } = useDeleteGroupPost(groupId);

  // Fetch signed URL for avatar
  const author = post.author || post.authorId;
  const { data: signedAvatarUrl } = useSignedUrl(author?.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || author?.avatar?.url;
  const { data: signedCurrentUserAvatar } = useSignedUrl(author?.avatar?.key || null);
  const currentUserAvatarUrl = signedCurrentUserAvatar || author?.avatar?.url;

  const handleLikeToggle = () => {
    const isLiked = (post as any).isLiked || false;
    if (isLiked) {
      unlikeGroupPostMutation.mutate(post._id);
    } else {
      likeGroupPostMutation.mutate(post._id);
    }
    onLike?.(post._id);
  };

  const handleShare = () => {
    shareGroupPostMutation.mutate(post._id);
    onShare?.(post._id);
    toast.success("Post shared!");
  };

  const handleDeletePost = () => {
    deleteGroupPostMutation.mutate(post._id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostContent = () => {
    // Text post with background
    if (post.type === "text" && post.backgroundUrl) {
      return (
        <div 
          className="relative aspect-square w-full overflow-hidden rounded-lg"
          style={{ 
            backgroundImage: `url(${post.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
            <p 
              className="text-center leading-relaxed"
              style={{
                color: post.textStyle?.color || "#ffffff",
                fontSize: `${post.textStyle?.fontSize || 24}px`,
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

    // Text post without background
    if (post.type === "text") {
      return (
        <div className="py-4">
          <p className="text-base whitespace-pre-wrap">{post.text}</p>
        </div>
      );
    }

    // Image post
    if (post.type === "image" && post.images && post.images.length > 0) {
      return (
        <div className="space-y-2">
          {post.text && (
            <p className="text-base whitespace-pre-wrap">{post.text}</p>
          )}
          <div className="grid gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Image ${index + 1}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      );
    }

    // Video post
    if (post.type === "video" && post.images && post.images.length > 0) {
      const video = post.images[0];
      return (
        <div className="space-y-2">
          {post.text && (
            <p className="text-base whitespace-pre-wrap">{post.text}</p>
          )}
          <video
            src={video.url}
            controls
            muted={post.mutedByDefault}
            loop={post.loop}
            className="w-full rounded-lg"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link href={`/${author?.name}?id=${author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
              <AvatarImage src={avatarUrl} alt={author?.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                {author?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-base">
                {author?.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </Link>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer"
                >
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {renderPostContent()}
      </CardContent>

      <CardFooter className="flex flex-col pt-0">
        {/* Action buttons */}
        <div className="flex items-center justify-between w-full pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeToggle}
            disabled={likeGroupPostMutation.isPending || unlikeGroupPostMutation.isPending}
            className={`group/like relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-110 ${(post as any).isLiked ? 'text-red-500' : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'}`}
          >
            {/* Like animation background */}
            <div className="absolute inset-0 bg-red-500/10 scale-0 group-hover/like:scale-100 transition-transform duration-300 rounded-xl" />
            <Heart className={`h-5 w-5 relative z-10 transition-all duration-300 ${(post as any).isLiked ? 'fill-current scale-110' : 'group-hover/like:scale-125'}`} />
            <span className="relative z-10 ml-1">{post.counts?.likeCount || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCommentDialogOpen(true)}
            className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="ml-1">{post.counts?.commentCount || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={shareGroupPostMutation.isPending}
            className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
          >
            <Share2 className="w-5 h-5" />
            <span className="ml-1">{post.counts?.shareCount || 0}</span>
          </Button>
        </div>
      </CardFooter>

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
              disabled={deleteGroupPostMutation.isPending}
            >
              {deleteGroupPostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <EditGroupPostDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        post={post}
      />

      {/* Comment Dialog */}
      <GroupCommentDialog
        post={post}
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        currentUser={author ? { name: author.name, avatar: author.avatar } : null}
      />
    </Card>
  );
}
