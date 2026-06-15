"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send, ChevronDown, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/dialog";
import { ReactionPicker } from "@/components/molecules/reaction-picker";
import { useSignedMedia } from "@/features/profile/components/media-image";
import {
  useGetReplies,
  useReactToComment,
  useEditComment,
  useDeleteComment,
} from "@/features/home/hooks/comment-query";
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
  currentUserId?: string;
  postId: string;
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
  currentUserId,
  postId,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isMine = currentUserId === comment.author._id;

  const { reactToCommentMutation } = useReactToComment(postId);
  const { editCommentMutation } = useEditComment(postId);
  const { deleteCommentMutation } = useDeleteComment(postId);

  const handleReact = (reaction: string) => {
    reactToCommentMutation.mutate({ commentId: comment._id, reaction });
  };

  const handleRemoveReact = () => {
    // Toggle: sending the current reaction again removes it
    const current = comment.reaction || "like";
    reactToCommentMutation.mutate({ commentId: comment._id, reaction: current });
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false);
      setEditText(comment.text);
      return;
    }
    editCommentMutation.mutate(
      { commentId: comment._id, text: editText.trim() },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    deleteCommentMutation.mutate(comment._id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  return (
    <div
      className={`group flex gap-2.5 py-2.5 rounded-xl transition-colors ${
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
          <div className="flex items-start justify-between gap-1">
            <Link
              href={`/${comment.author.username}?id=${comment.author._id}`}
              className="font-semibold text-xs hover:underline"
            >
              {comment.author.name}
            </Link>
            {isMine && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditText(comment.text);
                      setIsEditing(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-2 mt-1">
              <Textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-9 resize-none text-sm"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditText(comment.text);
                  }
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  disabled={!editText.trim() || editCommentMutation.isPending}
                  onClick={handleSaveEdit}
                >
                  {editCommentMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/90 wrap-break-word whitespace-pre-wrap">
              {comment.text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-0.5 px-2">
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          <ReactionPicker
            isLiked={comment.isLiked ?? false}
            currentReaction={comment.reaction}
            likeCount={comment.likeCount}
            onReact={handleReact}
            onRemoveReact={handleRemoveReact}
            isLoading={reactToCommentMutation.isPending}
            size="sm"
            iconSize="sm"
            showCount={true}
            showLabel={false}
            buttonClassName="h-5 px-1.5 rounded-full text-[11px]"
            activeClassName="text-red-500"
            hoverClassName=""
          />
          <button
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => onReply(comment._id)}
          >
            Reply
          </button>
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

        {showReplies && <RepliesList commentId={comment._id} currentUserId={currentUserId} postId={postId} />}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RepliesList({ commentId, currentUserId, postId }: { commentId: string; currentUserId?: string; postId: string }) {
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
        <ReplyRow key={r._id} reply={r} currentUserId={currentUserId} postId={postId} />
      ))}
    </div>
  );
}

function ReplyRow({ reply, currentUserId, postId }: { reply: Comment; currentUserId?: string; postId: string }) {
  const { useSignedUrl } = useSignedMedia();
  const { data: signedAvatar } = useSignedUrl(reply.author.avatar?.key || null);
  const avatar = signedAvatar || reply.author.avatar?.url;
  const isMine = currentUserId === reply.author._id;

  const { reactToCommentMutation } = useReactToComment(postId);
  const { editCommentMutation } = useEditComment(postId);
  const { deleteCommentMutation } = useDeleteComment(postId);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.text);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSaveEdit = () => {
    if (!editText.trim() || editText === reply.text) {
      setIsEditing(false);
      setEditText(reply.text);
      return;
    }
    editCommentMutation.mutate(
      { commentId: reply._id, text: editText.trim() },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    deleteCommentMutation.mutate(reply._id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  return (
    <div className="group flex gap-2 py-1.5">
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
          <div className="flex items-start justify-between gap-1">
            <Link
              href={`/${reply.author.username}?id=${reply.author._id}`}
              className="font-semibold text-[11px] hover:underline"
            >
              {reply.author.name}
            </Link>
            {isMine && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-2.5 w-2.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditText(reply.text);
                      setIsEditing(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-1.5 mt-1">
              <Textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-8 resize-none text-xs"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditText(reply.text);
                  }
                }}
              />
              <Button
                size="icon"
                className="h-6 w-6 shrink-0 rounded-full"
                disabled={!editText.trim() || editCommentMutation.isPending}
                onClick={handleSaveEdit}
              >
                {editCommentMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <p className="text-xs wrap-break-word whitespace-pre-wrap">
              {reply.text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(reply.createdAt)}
          </span>
          <ReactionPicker
            isLiked={reply.isLiked ?? false}
            currentReaction={reply.reaction}
            likeCount={reply.likeCount}
            onReact={(reaction) => reactToCommentMutation.mutate({ commentId: reply._id, reaction })}
            onRemoveReact={() => reactToCommentMutation.mutate({ commentId: reply._id, reaction: reply.reaction || "like" })}
            isLoading={reactToCommentMutation.isPending}
            size="sm"
            iconSize="sm"
            showCount={true}
            showLabel={false}
            buttonClassName="h-4 px-1 rounded-full text-[10px]"
            activeClassName="text-red-500"
            hoverClassName=""
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete this reply?
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
