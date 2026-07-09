"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDeletePost,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useSharePost,
} from "@/features/home/hooks/feed-query";
import { MediaPreview } from "./media-preview";
import { PostSidebar } from "./post-sidebar";
import { PostModalProps } from "./types";

export function PostModal({
  post,
  open,
  onOpenChange,
  currentUser,
}: PostModalProps) {
  const queryClient = useQueryClient();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const { likePostMutation } = useLikePost();
  const { unlikePostMutation } = useUnlikePost();
  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();
  const { sharePostMutation } = useSharePost();
  const { deletePostMutation } = useDeletePost();

  // Body scroll lock
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new Event("feed:pause-videos"));
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Backdrop overlay
  useEffect(() => {
    if (open && !overlayRef.current) {
      const overlay = document.createElement("div");
      overlay.className =
        "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    } else if (!open && overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
    };
  }, [open]);

  if (!post) return null;

  const data = post.data;

  const handleReact = (postId: string, reaction: string) => {
    likePostMutation.mutate({ postId, reaction });
  };

  const handleRemoveReact = (postId: string) => {
    unlikePostMutation.mutate(postId);
  };

  const handleSaveToggle = (postId: string) => {
    if (data.isSave) {
      unsavePostMutation.mutate(postId, {
        onSuccess: () => toast.success("Removed from saved"),
        onError: () => toast.error("Failed to unsave"),
      });
    } else {
      savePostMutation.mutate(postId, {
        onSuccess: () => toast.success("Post saved"),
        onError: () => toast.error("Failed to save"),
      });
    }
  };

  const handleShare = (postId: string) => {
    sharePostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success("Post shared");
        navigator.clipboard
          .writeText(`${window.location.origin}/posts/${postId}`)
          .catch(() => {});
      },
      onError: () => toast.error("Failed to share post"),
    });
  };

  const handleDelete = () => {
    deletePostMutation.mutate(data._id, {
      onSuccess: () => {
        toast.success("Post deleted");
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to delete post"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        showCloseButton={true}
        className="min-w-7xl h-[90vh] max-h-[900px] p-0 overflow-hidden gap-0 sm:rounded-2xl flex flex-col"
      >
        <DialogTitle className="sr-only">Post</DialogTitle>
        <DialogDescription className="sr-only">
          View post by {data.author.name}
        </DialogDescription>

        <div className="flex flex-1 min-h-0 w-full">
          {/* Left: Media Preview (75% on md+) */}
          <div className="md:w-3/4 relative bg-background min-h-[300px] md:min-h-0 overflow-hidden">
            <MediaPreview
              medias={data.medias || []}
              text={data.type === "text" ? data.text : undefined}
              backgroundUrl={data.backgroundUrl}
              textStyle={data.textStyle}
              layout={data.layout}
              mutedByDefault={data.mutedByDefault}
              loop={data.loop}
            />
          </div>

          {/* Right: Sidebar (25% on md+) */}
          <div className="md:w-1/4 flex flex-col min-h-0 overflow-hidden border-l">
            <PostSidebar
              post={post}
              currentUser={currentUser}
              onSaveToggle={handleSaveToggle}
              onShare={handleShare}
              isLiking={likePostMutation.isPending || unlikePostMutation.isPending}
              isSaving={savePostMutation.isPending || unsavePostMutation.isPending}
              isSharing={sharePostMutation.isPending}
              isDeleting={deletePostMutation.isPending}
              onDelete={handleDelete}
              onReact={handleReact}
              onRemoveReact={handleRemoveReact}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
