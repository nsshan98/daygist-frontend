"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Send, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { toast } from "sonner";
import {
  useGetGroupPostComments,
  useCreateGroupPostComment,
  useGetGroupPostReplies,
} from "../hooks/group-comment-query";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { Comment, GroupPostData } from "@/types";

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

interface GroupCommentDialogProps {
  post: GroupPostData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: { name: string; avatar?: { url: string; key: string | null } | null } | null;
}

export function GroupCommentDialog({ post, open, onOpenChange, currentUser }: GroupCommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const postId = post._id;

  // Fetch comments
  const { commentsQuery } = useGetGroupPostComments(postId, open);
  const { createCommentMutation } = useCreateGroupPostComment(postId);

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
        type: "groupPost",
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
        type: "groupPost",
        parentId,
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyToId(null);
          toast.success("Reply posted!");
        },
        onError: () => {
          toast.error("Failed to post reply");
        },
      }
    );
  };

  // Reply component
  const ReplyItem = ({ reply }: { reply: Comment }) => {
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
  };

  // Comment item component
  const CommentItem = ({ comment }: { comment: Comment }) => {
    const { useSignedUrl } = useSignedMedia();
    const { data: signedAvatarUrl } = useSignedUrl(comment.author.avatar?.key || null);
    const finalAvatarUrl = signedAvatarUrl || comment.author.avatar?.url;
    const { repliesQuery } = useGetGroupPostReplies(comment._id, expandedComments.has(comment._id));
    const { data: repliesData, isLoading: isLoadingReplies } = repliesQuery;
    const replies = repliesData?.pages.flatMap((page) => page.items) || [];

    return (
      <div className="space-y-2">
        <div className="flex gap-3">
          <Link href={`/${comment.author.username}?id=${comment.author._id}`}>
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
              <AvatarImage src={finalAvatarUrl} alt={comment.author.name} />
              <AvatarFallback className="text-xs">
                {comment.author.name[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                href={`/${comment.author.username}?id=${comment.author._id}`}
                className="text-sm font-semibold hover:underline truncate"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-1 wrap-break-word">{comment.text}</p>
            {comment.likeCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <MessageCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {comment.likeCount}
                </span>
              </div>
            )}
            
            {/* Reply button */}
            <button
              onClick={() => setReplyToId(replyToId === comment._id ? null : comment._id)}
              className="text-xs text-muted-foreground hover:text-foreground mt-1 font-medium transition-colors"
            >
              Reply
            </button>

            {/* Show replies count and toggle */}
            {comment.replyCount > 0 && (
              <button
                onClick={() => handleToggleReplies(comment._id)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedComments.has(comment._id) ? "rotate-180" : ""}`} />
                {expandedComments.has(comment._id) ? "Hide" : `View`} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
              </button>
            )}

            {/* Load and show replies */}
            {expandedComments.has(comment._id) && (
              <div className="mt-2 ml-2 border-l-2 border-muted pl-3 space-y-2">
                {isLoadingReplies ? (
                  <div className="text-xs text-muted-foreground">Loading replies...</div>
                ) : (
                  replies.map((reply) => <ReplyItem key={reply._id} reply={reply} />)
                )}
              </div>
            )}

            {/* Reply input */}
            {replyToId === comment._id && (
              <div className="flex gap-2 mt-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-10 text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(comment._id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleSendReply(comment._id)}
                  disabled={!replyText.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold">Comments</DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}

              {/* Load more indicator */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-4" />
            </>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input */}
        <div className="px-4 py-3 border-t bg-background">
          <div className="flex gap-3 items-end">
            <Avatar className="h-9 w-9 shrink-0">
              {currentUser?.avatar?.url && <AvatarImage src={currentUser.avatar.url} alt={currentUser.name} />}
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-11 max-h-[120px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleSendComment}
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="shrink-0"
              >
                {createCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
