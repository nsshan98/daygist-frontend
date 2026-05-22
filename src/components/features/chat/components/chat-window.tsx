"use client";

import { useState, useEffect, useRef } from "react";
import { X, Minus, Send, Mic, Image as ImageIcon, Smile, Phone, Video, Info, Loader2, Reply as ReplyIcon, Pencil } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Input } from "@/components/atoms/input";
import { useGetMessages, useSendMessage, useEditMessage, useDeleteMessage, useReactToMessage } from "../hooks/chat-query";
import { useUploadImage } from "@/components/features/home/hooks/upload-query";
import { useChatStore } from "../stores/chat-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ChatMessageItem } from "./chat-message-item";
import { toast } from "sonner";
import type { Conversation, ChatMessage } from "@/types";

interface ChatWindowProps {
  conversation: Conversation;
}

const ChatWindow = ({ conversation }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { removeWindow, minimizeWindow, isMinimized } = useChatStore();
  const minimized = isMinimized[conversation._id];
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetMessages(conversation._id);

  const sendMessageMutation = useSendMessage();
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const reactToMessageMutation = useReactToMessage();
  const { uploadImageMutation } = useUploadImage();

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const messages = data?.pages ? [...data.pages].reverse().flatMap((page) => page.data) : [];
  const participant = conversation.participants[0];

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (topRef.current) {
      observerRef.current.observe(topRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!isLoading && scrollRef.current && !isFetchingNextPage) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading, isFetchingNextPage, messages.length]);

  const handleReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    setEditingMessage(null);
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setMessage(msg.text);
    setReplyingTo(null);
  };

  const handleDelete = async (msgId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(msgId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleReact = async (msgId: string, emoji: string) => {
    try {
      await reactToMessageMutation.mutateAsync({
        messageId: msgId,
        emoji,
      });
    } catch (error) {
      toast.error("Failed to react to message");
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !isUploading) return;

    try {
      if (editingMessage) {
        await editMessageMutation.mutateAsync({
          messageId: editingMessage._id,
          text: message.trim(),
        });
        setEditingMessage(null);
      } else {
        const payload: any = {
          conversationId: conversation._id,
          text: message.trim(),
          messageType: 'text',
        };

        if (replyingTo) {
          payload.replyTo = {
            message: replyingTo._id,
            text: replyingTo.text || (replyingTo.messageType === 'voice' ? 'Voice message' : 'Media'),
            sender: replyingTo.sender._id
          };
        }

        await sendMessageMutation.mutateAsync(payload);
      }

      setMessage("");
      setReplyingTo(null);
    } catch (error) {
      toast.error(editingMessage ? "Failed to edit message" : "Failed to send message");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10MB)");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadImageMutation.mutateAsync(file);
      
      const payload: any = {
        conversationId: conversation._id,
        messageType: 'image',
        media: {
          url: uploadResult.url,
          key: uploadResult.key,
          provider: uploadResult.provider,
        },
      };

      if (replyingTo) {
        payload.replyTo = {
          message: replyingTo._id,
          text: replyingTo.text || (replyingTo.messageType === 'voice' ? 'Voice message' : 'Media'),
          sender: replyingTo.sender._id
        };
      }

      await sendMessageMutation.mutateAsync(payload);
      
      setReplyingTo(null);
    } catch (error) {
      toast.error("Failed to upload/send image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (minimized) {
    return (
      <div className="w-48 bg-card border border-border rounded-t-lg shadow-2xl flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
           onClick={() => minimizeWindow(conversation._id)}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={participant?.avatar?.url || ""} />
            <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold truncate">{participant?.name}</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
            e.stopPropagation();
            removeWindow(conversation._id);
          }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] bg-card border border-border rounded-t-xl shadow-2xl flex flex-col h-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card rounded-t-xl shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded-lg transition-colors flex-1 min-w-0">
          <div className="relative">
            <Avatar className="w-9 h-9">
              <AvatarImage src={participant?.avatar?.url || ""} />
              <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {participant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-tight">{participant?.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {participant?.isOnline ? "Active now" : "Offline"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => minimizeWindow(conversation._id)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => removeWindow(conversation._id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar bg-accent/5"
      >
        <div ref={topRef} className="h-1 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id !== participant?._id;
            const showAvatar = !isMe && (idx === 0 || messages[idx-1]?.sender._id !== msg.sender._id);
            
            // Handle replyTo being either an ID or an object
            let repliedMessage: any = null;
            if (msg.replyTo) {
              if (typeof msg.replyTo === 'string') {
                repliedMessage = messages.find(m => m._id === msg.replyTo);
              } else {
                repliedMessage = msg.replyTo;
              }
            }
            
            return (
              <ChatMessageItem
                key={msg._id}
                message={msg}
                isMe={isMe}
                showAvatar={showAvatar}
                participant={participant}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                repliedMessage={repliedMessage}
              />
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex flex-col gap-2 bg-card">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload}
        />
        
        {/* Reply Preview */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <ReplyIcon className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-col truncate">
                <span className="font-semibold">Replying to {replyingTo.sender.name}</span>
                <span className="text-muted-foreground truncate">{replyingTo.text || "Media"}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setReplyingTo(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Edit Preview */}
        {editingMessage && (
          <div className="flex items-center justify-between bg-primary/5 px-3 py-2 rounded-lg text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Pencil className="h-3 w-3 text-primary" />
              <div className="flex flex-col truncate">
                <span className="font-semibold text-primary">Editing message</span>
                <span className="text-muted-foreground truncate">{editingMessage.text}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
              setEditingMessage(null);
              setMessage("");
            }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Smile className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Aa"
              className="h-9 rounded-full bg-muted/50 border-none focus-visible:ring-1 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  handleSend();
                }
              }}
              disabled={isUploading}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2 text-primary hover:bg-transparent"
              disabled={!message.trim() || isUploading}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!message.trim() && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
