"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { useGetReplies } from "@/features/home/hooks/comment-query";
import { Comment } from "@/types";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

interface PostCommentItemProps {
  comment: Comment;
  isHighlighted?: boolean;
  onReply: (commentId: string) => void;
  replyToId: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: (parentId: string) => void;
  isSendingReply: boolean;
}

export function PostCommentItem({
  comment,
  isHighlighted,
  onReply,
  replyToId,
  replyText,
  onReplyTextChange,
  onSendReply,
  isSendingReply,
}: PostCommentItemProps) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatar } = useSignedUrl(comment.author.avatar?.key || null);
  const avatar = signedAvatar || comment.author.avatar?.url;
  const isReplying = replyToId === comment._id;
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div
      className={`flex gap-2.5 py-2.5 rounded-xl transition-colors ${
        isHighlighted ? "bg-yellow-50 dark:bg-yellow-950/30" : ""
      }`}
    >
      <Link
        href={`/${comment.author.username}?id=${comment.author._id}`}
        className="shrink-0"
      >
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="bg-muted/60 rounded-2xl px-3 py-2">
          <Link
            href={`/${comment.author.username}?id=${comment.author._id}`}
            className="font-semibold text-xs hover:underline"
          >
            {comment.author.name}
          </Link>
          <p className="text-sm text-foreground/90 wrap-break-word whitespace-pre-wrap">
            {comment.text}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-0.5 px-2">
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          <button
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => onReply(comment._id)}
          >
            Reply
          </button>
          {comment.likeCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {comment.likeCount} likes
            </span>
          )}
        </div>

        {isReplying && (
          <div className="flex gap-2 mt-2">
            <Textarea
              autoFocus
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder={`Reply to ${comment.author.name}...`}
              className="min-h-9 resize-none text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) onSendReply(comment._id);
                }
              }}
            />
            <Button
              size="icon"
              className="shrink-0 h-9 w-9 rounded-full"
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

        {comment.replyCount > 0 && (
          <button
            className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5 ml-1 hover:underline"
            onClick={() => setShowReplies((v) => !v)}
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showReplies ? "rotate-180" : ""}`}
            />
            {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}

        {showReplies && <RepliesList commentId={comment._id} />}
      </div>
    </div>
  );
}

function RepliesList({ commentId }: { commentId: string }) {
  const { repliesQuery } = useGetReplies(commentId, true);
  const { data, isLoading } = repliesQuery;
  const replies = data?.pages.flatMap((p) => p.items) || [];

  if (isLoading) {
    return (
      <div className="ml-10 py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (replies.length === 0) return null;

  return (
    <div className="ml-6 mt-1.5 border-l-2 border-muted pl-3 space-y-1">
      {replies.map((r) => (
        <ReplyRow key={r._id} reply={r} />
      ))}
    </div>
  );
}

function ReplyRow({ reply }: { reply: Comment }) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatar } = useSignedUrl(reply.author.avatar?.key || null);
  const avatar = signedAvatar || reply.author.avatar?.url;

  return (
    <div className="flex gap-2 py-1.5">
      <Link href={`/${reply.author.username}?id=${reply.author._id}`}>
        <Avatar className="h-6 w-6 hover:opacity-80">
          <AvatarImage src={avatar} alt={reply.author.name} />
          <AvatarFallback className="text-[10px]">
            {reply.author.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-2xl px-2.5 py-1.5">
          <Link
            href={`/${reply.author.username}?id=${reply.author._id}`}
            className="font-semibold text-[11px] hover:underline"
          >
            {reply.author.name}
          </Link>
          <p className="text-xs wrap-break-word whitespace-pre-wrap">
            {reply.text}
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground ml-2">
          {formatRelativeTime(reply.createdAt)}
        </span>
      </div>
    </div>
  );
}
