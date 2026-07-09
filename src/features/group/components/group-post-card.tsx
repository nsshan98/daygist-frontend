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
import { useDeleteGroupPost, useLikeGroupPost, useUnlikeGroupPost, useShareGroupPost } from "../hooks/group-post-query";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { EditGroupPostDialog } from "./edit-group-post-dialog";
import { GroupCommentDialog } from "./group-comment-dialog";
import { toast } from "sonner";
import { GroupPostData } from "@/types";
import { ReactionPicker } from "@/components/molecules/reaction-picker";
import { formatRelativeTime } from "@/lib/helpers";
import { DeletePostDialog } from "@/components/molecules/delete-post-dialog";

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

  const handleReact = (reaction: string) => {
    likeGroupPostMutation.mutate({ postId: post._id, reaction });
    onLike?.(post._id);
  };

  const handleRemoveReact = () => {
    unlikeGroupPostMutation.mutate(post._id);
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
          <ReactionPicker
            isLiked={(post as any).isLiked || false}
            currentReaction={(post as any).reaction}
            likeCount={post.counts?.likeCount || 0}
            onReact={handleReact}
            onRemoveReact={handleRemoveReact}
            isLoading={likeGroupPostMutation.isPending || unlikeGroupPostMutation.isPending}
            size="sm"
            iconSize="sm"
            showCount={true}
            buttonClassName="rounded-xl"
            activeClassName="hover:bg-red-50 dark:hover:bg-red-950/30"
            hoverClassName="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            countClassName="ml-0"
          />

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
      <DeletePostDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeletePost}
        isPending={deleteGroupPostMutation.isPending}
      />

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
