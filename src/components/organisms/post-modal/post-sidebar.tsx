"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  Globe,
  Users,
  Lock,
  Loader2,
  Image as ImageIcon,
  Smile,
  Link2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Skeleton } from "@/components/atoms/skeleton";
import { ReactionPicker } from "@/components/molecules/reaction-picker";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { useFollowUser, useUnfollowUser } from "@/features/follow";
import {
  useGetComments,
  useCreateComment,
} from "@/features/home/hooks/comment-query";
import { EditPostDialog } from "@/features/home/components/edit-post-dialog";
import { PostCommentItem } from "./comment-item";
import { CurrentUserLite } from "./types";
import { FeedItem } from "@/types";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const PrivacyIcon = ({ privacy }: { privacy: string }) => {
  if (privacy === "public") return <Globe className="h-3 w-3" />;
  if (privacy === "friends") return <Users className="h-3 w-3" />;
  return <Lock className="h-3 w-3" />;
};

interface PostSidebarProps {
  post: FeedItem;
  currentUser: CurrentUserLite | null | undefined;
  onSaveToggle: (postId: string) => void;
  onShare: (postId: string) => void;
  isLiking: boolean;
  isSaving: boolean;
  isSharing: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onReact: (postId: string, reaction: string) => void;
  onRemoveReact: (postId: string) => void;
}

export function PostSidebar({
  post,
  currentUser,
  onSaveToggle,
  onShare,
  isLiking,
  isSaving,
  isSharing,
  isDeleting,
  onDelete,
  onReact,
  onRemoveReact,
}: PostSidebarProps) {
  const data = post.data;
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatar } = useSignedUrl(data.author.avatar?.key || null);
  const avatar = signedAvatar || data.author.avatar?.url;
  const { data: signedMyAvatar } = useSignedUrl(currentUser?.avatar?.key || null);
  const myAvatar = signedMyAvatar || currentUser?.avatar?.url;

  const { followUserMutation } = useFollowUser();
  const { unfollowUserMutation } = useUnfollowUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { commentsQuery } = useGetComments(data._id, true);
  const { createCommentMutation } = useCreateComment(data._id);

  const comments = commentsQuery.data?.pages.flatMap((p) => p.items) || [];
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isFollowing = data.isFollowingAuthor || data.author.isFollowing;

  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = commentsQuery;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    return () => {
      setCommentText("");
      setReplyToId(null);
      setReplyText("");
    };
  }, [data._id]);

  const handleSendComment = () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(
      { text: commentText.trim(), type: "post" },
      {
        onSuccess: () => {
          setCommentText("");
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        },
      }
    );
  };

  const handleSendReply = (parentId: string) => {
    if (!replyText.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(
      { text: replyText.trim(), type: "post", parentId },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyToId(null);
        },
      }
    );
  };

  const handleFollowToggle = () => {
    if (isFollowing) unfollowUserMutation.mutate(data.author._id);
    else followUserMutation.mutate(data.author._id);
  };

  const likeCount = data.counts?.likeCount ?? data.likeCount ?? 0;
  const commentCount = data.counts?.commentCount ?? data.commentCount ?? 0;
  const shareCount = data.counts?.shareCount ?? data.shareCount ?? 0;

  return (
    <div className="flex flex-1 flex-col bg-background overflow-hidden min-h-0">
      {/* PAGE META */}
      <div className="px-4 pt-4 pb-3 border-b">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${data.author.username}?id=${data.author._id}`}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={avatar} alt={data.author.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold text-sm">
                {data.author.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {data.author.name}
                </h3>
                {data.feeling && (
                  <span className="text-xs text-muted-foreground truncate">
                    is feeling {data.feeling.toLowerCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>{formatRelativeTime(data.createdAt)}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5">
                  <PrivacyIcon privacy={data.privacy} />
                </span>
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            {!data.author.isMe && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                className="h-7 px-3 text-xs rounded-full"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-3 w-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/posts/${data._id}`);
                  }}
                  className="cursor-pointer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                {data.author.isMe ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditOpen(true)}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete post"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleFollowToggle}
                    className="cursor-pointer"
                  >
                    {isFollowing ? (
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
        </div>
      </div>

      {/* POST META - Caption / text */}
      {data.text && (
        <div className="px-4 py-3 border-b max-h-40 overflow-y-auto shrink-0">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap wrap-break-word">
            {data.text}
          </p>
          {data.type === "image" || data.type === "video" ? (
            <p className="text-[11px] text-muted-foreground mt-2">
              {data.type === "image"
                ? `${data.medias.length} photo${data.medias.length > 1 ? "s" : ""}`
                : "Video post"}
            </p>
          ) : null}
        </div>
      )}

      {/* STATS */}
      <div className="px-4 py-2 border-b flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-linear-to-br from-red-400 to-pink-500 flex items-center justify-center ring-2 ring-background">
              <Heart className="w-3 h-3 fill-white text-white" />
            </div>
          </div>
          <span className="font-medium">{likeCount.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <span>
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </span>
          <span>{shareCount} shares</span>
        </div>
      </div>

      {/* Engagement buttons */}
      <div className="px-2 py-1.5 border-b grid grid-cols-4 gap-1">
        <ReactionPicker
          isLiked={data.isLiked}
          currentReaction={data.reaction}
          likeCount={likeCount}
          onReact={(r) => onReact(data._id, r)}
          onRemoveReact={() => onRemoveReact(data._id)}
          isLoading={isLiking}
          size="sm"
          iconSize="sm"
          showCount={false}
          showLabel={true}
          buttonText="Like"
          likedText="Liked"
          buttonClassName="w-full gap-1.5 rounded-lg h-9"
          activeClassName="text-red-500"
          hoverClassName="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
        />
        <Button
          variant="ghost"
          className="w-full gap-1.5 rounded-lg h-9 hover:bg-primary/10 hover:text-primary"
          onClick={() => {
            const ta = document.getElementById(`post-modal-comment-${data._id}`);
            ta?.focus();
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">Comment</span>
        </Button>
        <Button
          variant="ghost"
          disabled={isSharing}
          onClick={() => onShare(data._id)}
          className="w-full gap-1.5 rounded-lg h-9 hover:bg-primary/10 hover:text-primary"
        >
          {isSharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span className="text-xs">Share</span>
        </Button>
        <Button
          variant="ghost"
          disabled={isSaving}
          onClick={() => onSaveToggle(data._id)}
          className={`w-full gap-1.5 rounded-lg h-9 ${
            data.isSave
              ? "text-primary"
              : "hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${data.isSave ? "fill-current" : ""}`} />
          <span className="text-xs">{data.isSave ? "Saved" : "Save"}</span>
        </Button>
      </div>

      {/* COMMENTS LIST */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-2"
      >
        {commentsQuery.isLoading ? (
          <div className="space-y-3 py-2">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-10">
            <MessageCircle className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {comments.map((c) => (
              <PostCommentItem
                key={c._id}
                comment={c}
                currentUserId={currentUser?._id}
                postId={data._id}
                onReply={setReplyToId}
                replyToId={replyToId}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onSendReply={handleSendReply}
                isSendingReply={createCommentMutation.isPending}
              />
            ))}
            <div ref={loadMoreRef} className="h-3" />
            {commentsQuery.isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMMENT FORM */}
      <div className="border-t px-3 py-2.5">
        <div className="flex items-end gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            {myAvatar && <AvatarImage src={myAvatar} alt={currentUser?.name || "You"} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {currentUser?.name?.[0]?.toUpperCase() || "Y"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            <Textarea
              id={`post-modal-comment-${data._id}`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-9 max-h-24 resize-none pr-20 text-sm rounded-2xl"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <div className="absolute right-1.5 bottom-1.5 flex items-center gap-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                title="Emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                title="Attach media"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            disabled={!commentText.trim() || createCommentMutation.isPending}
            onClick={handleSendComment}
            className="h-8 w-8 rounded-full shrink-0"
          >
            {createCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Edit Post Dialog */}
      {data.author.isMe && (
        <EditPostDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          post={data}
        />
      )}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 py-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full rounded-2xl" />
      </div>
    </div>
  );
}
