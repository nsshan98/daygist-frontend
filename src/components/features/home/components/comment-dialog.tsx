"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { Skeleton } from "@/components/atoms/skeleton";
import { toast } from "sonner";
import {
  useGetComments,
  useCreateComment,
  useGetReplies,
} from "../hooks/comment-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";
import { Comment, FeedItem, FeedMedia } from "@/types";
import { ReactionPicker } from "@/components/shared/reaction-picker";

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

// Current User Avatar Component
function CurrentUserAvatar({ currentUser }: { currentUser?: { name: string; avatar?: { url: string; key: string | null } | null } | null }) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(currentUser?.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || currentUser?.avatar?.url;

  return (
    <Avatar className="h-9 w-9">
      {finalAvatarUrl && <AvatarImage src={finalAvatarUrl} alt={currentUser?.name || "User"} />}
      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
        {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
}

// Reply Item Component
function ReplyItem({ reply }: { reply: Comment }) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(reply.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || reply.author.avatar?.url;

  return (
    <div className="flex gap-2 py-2">
      <Link href={`/${reply.author.username}?id=${reply.author._id}`}>
        <Avatar className="h-7 w-7 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={finalAvatarUrl} alt={reply.author.name} />
          <AvatarFallback className="text-xs text-[10px]">
            {reply.author.name[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl px-3 py-1.5">
          <Link
            href={`/${reply.author.username}?id=${reply.author._id}`}
            className="font-semibold text-xs hover:underline"
          >
            {reply.author.name}
          </Link>
          <p className="text-xs text-foreground/90 wrap-break-word">{reply.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-0.5 px-2">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(reply.createdAt)}
          </span>
          {reply.likeCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {reply.likeCount} likes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Replies List Component
function RepliesList({
  commentId,
  showReplies,
}: {
  commentId: string;
  showReplies: boolean;
}) {
  const { repliesQuery } = useGetReplies(commentId, showReplies);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = repliesQuery;

  const replies = data?.pages.flatMap((page) => page.items) || [];

  if (!showReplies) return null;

  if (isLoading) {
    return (
      <div className="ml-11 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (replies.length === 0) return null;

  return (
    <div className="ml-6 mt-1 border-l-2 border-muted pl-2">
      {replies.map((reply) => (
        <ReplyItem key={reply._id} reply={reply} />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="text-xs text-primary font-medium py-2 hover:underline"
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
          ) : null}
          Load more replies
        </button>
      )}
    </div>
  );
}

// Comment Item Component
function CommentItem({
  comment,
  onReply,
  replyToId,
  replyText,
  onReplyTextChange,
  onSendReply,
  isSendingReply,
  showReplies,
  onToggleReplies,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
  replyToId: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: (parentId: string) => void;
  isSendingReply: boolean;
  showReplies: boolean;
  onToggleReplies: (commentId: string) => void;
}) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(comment.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || comment.author.avatar?.url;
  const isReplying = replyToId === comment._id;

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/${comment.author.username}?id=${comment.author._id}`}>
        <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={finalAvatarUrl} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="bg-muted/50 rounded-2xl px-3 py-2">
              <Link
                href={`/${comment.author.username}?id=${comment.author._id}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.author.name}
              </Link>
              <p className="text-sm text-foreground/90 wrap-break-word">{comment.text}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 px-2">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => onReply(comment._id)}
              >
                Reply
              </button>
              {comment.likeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {comment.likeCount} likes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="flex gap-2 mt-2 ml-2">
            <Textarea
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder={`Reply to ${comment.author.name}...`}
              className="min-h-10 resize-none text-sm"
              rows={1}
            />
            <Button
              size="sm"
              className="shrink-0"
              disabled={!replyText.trim() || isSendingReply}
              onClick={() => onSendReply(comment._id)}
            >
              {isSendingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Show reply count - clickable to toggle replies */}
        {comment.replyCount > 0 && (
          <button
            className="flex items-center gap-1 text-xs text-primary font-medium mt-1 ml-2 hover:underline"
            onClick={() => onToggleReplies(comment._id)}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Replies List */}
        <RepliesList commentId={comment._id} showReplies={showReplies} />
      </div>
    </div>
  );
}

// Media Item with Signed URL for PostPreview
function PreviewMedia({ media }: { media: FeedMedia }) {
  const [isLoading, setIsLoading] = useState(true);
  const { useSignedUrl } = useSignedMedia();
  const { data: signedUrl } = useSignedUrl(media.key || null);
  const finalUrl = signedUrl || media.url;

  if (media.type === "video") {
    return (
      <video
        src={finalUrl}
        controls
        className="w-full max-h-[300px]"
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={finalUrl}
        alt="Post media"
        className={`w-full max-h-[300px] object-cover ${isLoading ? 'invisible' : 'visible'}`}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}

// Post Preview in Dialog
function PostPreview({
  post,
  onLikeToggle,
  onSaveToggle,
  isLiked,
  isSaved,
  isLiking,
  isSaving,
  onReact,
  onRemoveReact,
  currentReaction,
}: {
  post: FeedItem;
  onLikeToggle: () => void;
  onSaveToggle: () => void;
  isLiked: boolean;
  isSaved: boolean;
  isLiking: boolean;
  isSaving: boolean;
  onReact?: (reaction: string) => void;
  onRemoveReact?: () => void;
  currentReaction?: string | null;
}) {
  const postData = post.data;
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatarUrl } = useSignedUrl(postData.author.avatar?.key || null);
  const finalAvatarUrl = signedAvatarUrl || postData.author.avatar?.url;

  return (
    <div className="border-b pb-4 mb-4">
      {/* Author */}
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/${postData.author.username}?id=${postData.author._id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={finalAvatarUrl} alt={postData.author.name} />
            <AvatarFallback>{postData.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{postData.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(postData.createdAt)}
            </p>
          </div>
        </Link>
      </div>

      {/* Text content */}
      {postData.text && !postData.backgroundUrl && (
        <p className="text-sm mb-3 whitespace-pre-wrap">{postData.text}</p>
      )}

      {/* Text with background */}
      {postData.backgroundUrl && postData.textStyle && (
        <div
          className="relative w-full overflow-hidden rounded-xl mb-3 min-h-[200px]"
          style={{
            backgroundImage: `url(${postData.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
            <p
              className="text-center leading-relaxed"
              style={{
                color: postData.textStyle.color,
                fontSize: `${Math.min(postData.textStyle.fontSize, 24)}px`,
                fontWeight: postData.textStyle.fontWeight,
                textAlign: postData.textStyle.align as any,
              }}
            >
              {postData.text}
            </p>
          </div>
        </div>
      )}

      {/* Media */}
      {postData.medias && postData.medias.length === 1 && (
        <div className="rounded-xl overflow-hidden mb-3 relative">
          <PreviewMedia media={postData.medias[0]} />
        </div>
      )}

      {postData.medias && postData.medias.length > 1 && (
        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-3">
          {postData.medias.slice(0, 4).map((media: FeedMedia, index: number) => (
            <div key={index} className="relative aspect-square">
              <PreviewMedia media={media} />
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{postData.likeCount} likes</span>
        <span>{postData.commentCount} comments</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t pt-2">
        {onReact && onRemoveReact ? (
          <ReactionPicker
            isLiked={isLiked}
            currentReaction={currentReaction}
            likeCount={post.data.likeCount}
            onReact={onReact}
            onRemoveReact={onRemoveReact}
            isLoading={isLiking}
            size="sm"
            iconSize="sm"
            showCount={false}
            buttonText="Like"
            likedText="Liked"
            buttonClassName="flex-1 gap-1"
            activeClassName="text-red-500"
            hoverClassName=""
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLikeToggle}
            disabled={isLiking}
            className={`flex-1 gap-1 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="flex-1 gap-1">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Comment</span>
        </Button>
      </div>
    </div>
  );
}

interface CommentDialogProps {
  post: FeedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  isLiking: boolean;
  isSaving: boolean;
  onReact?: (postId: string, reaction: string) => void;
  onRemoveReact?: (postId: string) => void;
  currentUser?: {
    name: string;
    avatar?: {
      url: string;
      key: string | null;
    } | null;
  } | null;
}

export function CommentDialog({
  post,
  open,
  onOpenChange,
  onLikeToggle,
  onSaveToggle,
  isLiking,
  isSaving,
  onReact,
  onRemoveReact,
  currentUser,
}: CommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const postId = post?.data._id || "";

  // Fetch comments
  const { commentsQuery } = useGetComments(postId, open);
  const { createCommentMutation } = useCreateComment(postId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = commentsQuery;

  // Flatten comments
  const comments = data?.pages.flatMap((page) => page.items) || [];

  // Infinite scroll for comments
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll to bottom when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCommentText("");
      setReplyToId(null);
      setReplyText("");
      setExpandedComments(new Set());
    }
  }, [open]);

  // Toggle replies visibility
  const handleToggleReplies = (commentId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Handle create comment
  const handleSendComment = () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      {
        text: commentText.trim(),
        type: "post",
      },
      {
        onSuccess: () => {
          setCommentText("");
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
        onError: () => {
          toast.error("Failed to post comment");
        },
      }
    );
  };

  // Handle reply
  const handleSendReply = (parentId: string) => {
    if (!replyText.trim() || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      {
        text: replyText.trim(),
        type: "post",
        parentId,
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyToId(null);
        },
        onError: () => {
          toast.error("Failed to post reply");
        },
      }
    );
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-lg">Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Post Preview */}
          <PostPreview
            post={post}
            onLikeToggle={() => onLikeToggle(postId)}
            onSaveToggle={() => onSaveToggle(postId)}
            isLiked={post.data.isLiked}
            isSaved={post.data.isSave}
            isLiking={isLiking}
            isSaving={isSaving}
            onReact={onReact ? (r) => onReact(postId, r) : undefined}
            onRemoveReact={onRemoveReact ? () => onRemoveReact(postId) : undefined}
            currentReaction={post.data.reaction}
          />

          {/* Comments List */}
          <div className="space-y-1">
            {isLoading ? (
              <>
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
              </>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onReply={setReplyToId}
                    replyToId={replyToId}
                    replyText={replyText}
                    onReplyTextChange={setReplyText}
                    onSendReply={handleSendReply}
                    isSendingReply={createCommentMutation.isPending}
                    showReplies={expandedComments.has(comment._id)}
                    onToggleReplies={handleToggleReplies}
                  />
                ))}

                {/* Load more trigger */}
                <div ref={loadMoreRef} className="h-4" />
                {isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Scroll anchor */}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input - Fixed at bottom */}
        <div className="border-t px-4 py-3">
          <div className="flex gap-3">
            <CurrentUserAvatar currentUser={currentUser} />
            <div className="flex-1 flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-10 resize-none text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <Button
                size="sm"
                className="shrink-0"
                disabled={!commentText.trim() || createCommentMutation.isPending}
                onClick={handleSendComment}
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Comment Skeleton
function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-24 mb-1" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
