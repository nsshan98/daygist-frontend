"use client";

import { useState, useEffect, useRef } from "react";
import { X, Minus, Send, Mic, Image as ImageIcon, Smile, Phone, Video, Info, Loader2, Reply as ReplyIcon, Pencil, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Input } from "@/components/atoms/input";
import { useGetMessages, useSendMessage, useEditMessage, useDeleteMessage, useReactToMessage, useUpdateConversationStatus, useMarkMessagesAsSeen } from "../hooks/chat-query";
import { useUploadImage, useUploadVoice } from "@/components/features/home/hooks/upload-query";
import { useChatStore } from "../stores/chat-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ChatMessageItem } from "./chat-message-item";
import { VoiceRecorder } from "./voice-recorder";
import { useSocket } from "../context/socket-context";
import { useGetUserProfile } from "@/components/features/profile/hooks/profile-query";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Conversation, ChatMessage } from "@/types";

interface ChatWindowProps {
  conversation: Conversation;
}

const ChatWindow = ({ conversation }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;
  
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
  const updateStatusMutation = useUpdateConversationStatus();
  const markAsSeenMutation = useMarkMessagesAsSeen();
  const { uploadImageMutation } = useUploadImage();
  const { uploadVoiceMutation } = useUploadVoice();

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const messages = data?.pages ? [...data.pages].reverse().flatMap((page) => page.data) : [];
  const participant = conversation.participants.find(p => p._id !== currentUser?._id) || conversation.participants[0];
  const isOnline = participant ? onlineUsers.includes(participant._id) : false;
  
  const isReceivedRequest = conversation.status === "requested" && conversation.requestedBy !== currentUser?._id;
  const isSentRequest = conversation.status === "requested" && conversation.requestedBy === currentUser?._id;

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleReceiveMessage = (data: { conversationId: string; message: ChatMessage }) => {
      if (data.conversationId === conversation._id) {
        queryClient.setQueryData(["messages", conversation._id], (old: any) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const lastPageIndex = newPages.length - 1;
          newPages[lastPageIndex] = {
            ...newPages[lastPageIndex],
            data: [...newPages[lastPageIndex].data, data.message],
          };
          return { ...old, pages: newPages };
        });
        
        if (!minimized) {
          socket.emit("mark-seen", {
            senderId: participant?._id,
            conversationId: conversation._id,
            messageIds: [data.message._id],
            seenBy: currentUser._id,
          });
        }
      }
    };

    const handleTyping = (data: { conversationId: string; senderId: string }) => {
      if (data.conversationId === conversation._id && data.senderId !== currentUser._id) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data: { conversationId: string; senderId: string }) => {
      if (data.conversationId === conversation._id && data.senderId !== currentUser._id) {
        setOtherUserTyping(false);
      }
    };

    const handleMessageSeen = (data: { conversationId: string; messageIds: string[]; seenBy: string }) => {
      if (data.conversationId === conversation._id) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversation._id] });
      }
    };

    const handleReactionUpdated = (data: { conversationId: string; messageId: string; reactions: any[] }) => {
      if (data.conversationId === conversation._id) {
        queryClient.setQueryData(["messages", conversation._id], (old: any) => {
          if (!old) return old;
          
          const newPages = old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((msg: ChatMessage) => 
              msg._id === data.messageId 
                ? { ...msg, reactions: data.reactions } 
                : msg
            )
          }));
          
          return { ...old, pages: newPages };
        });
      }
    };

    const handleMessageSentRealtime = (data: { conversationId: string; messageId: string; deliveredToSocket: boolean }) => {
      if (data.conversationId === conversation._id) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversation._id] });
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("message-seen", handleMessageSeen);
    socket.on("message-reaction-updated", handleReactionUpdated);
    socket.on("message-sent-realtime", handleMessageSentRealtime);

    // Explicitly check online status of the participant when window opens
    if (participant?._id) {
      socket.emit("check-user-online", { userId: participant._id });
    }

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("message-seen", handleMessageSeen);
      socket.off("message-reaction-updated", handleReactionUpdated);
      socket.off("message-sent-realtime", handleMessageSentRealtime);
    };
  }, [socket, conversation._id, currentUser, queryClient, participant?._id, minimized]);

  useEffect(() => {
    if (!minimized && messages.length > 0 && currentUser) {
      const unseenMessages = messages.filter(
        msg => msg.sender._id !== currentUser._id && !msg.seen
      );

      if (unseenMessages.length > 0) {
        markAsSeenMutation.mutate(conversation._id);
        
        if (socket && participant) {
          socket.emit("mark-seen", {
            senderId: participant._id,
            conversationId: conversation._id,
            messageIds: unseenMessages.map(m => m._id),
            seenBy: currentUser._id,
          });
        }
      }
    }
  }, [minimized, messages.length, conversation._id, currentUser, socket, participant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!socket || !currentUser || !participant) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        receiverId: participant._id,
        conversationId: conversation._id,
        senderId: currentUser._id,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", {
        receiverId: participant._id,
        conversationId: conversation._id,
        senderId: currentUser._id,
      });
    }, 2000);
  };

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
      const response = await reactToMessageMutation.mutateAsync({
        messageId: msgId,
        emoji,
      });

      if (socket && participant && response.success) {
        socket.emit("message-reaction", {
          conversationId: conversation._id,
          messageId: msgId,
          receiverId: participant._id,
          reactions: response.data.reactions,
        });
      }
    } catch (error) {
      toast.error("Failed to react to message");
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !isUploading) return;

    const currentMessage = message.trim();
    setMessage("");
    setReplyingTo(null);

    try {
      if (editingMessage) {
        await editMessageMutation.mutateAsync({
          messageId: editingMessage._id,
          text: currentMessage,
        });
        setEditingMessage(null);
      } else {
        const payload: any = {
          conversationId: conversation._id,
          text: currentMessage,
          messageType: 'text',
        };

        if (replyingTo) {
          payload.replyTo = {
            message: replyingTo._id,
            text: replyingTo.text || (replyingTo.messageType === 'voice' ? 'Voice message' : 'Media'),
            sender: replyingTo.sender._id
          };
        }

        const response = await sendMessageMutation.mutateAsync(payload);

        if (socket && participant && response.success) {
          socket.emit("send-message", {
            receiverId: participant._id,
            conversationId: conversation._id,
            message: response.data,
          });
          
          setIsTyping(false);
          socket.emit("stop-typing", {
            receiverId: participant._id,
            conversationId: conversation._id,
            senderId: currentUser?._id,
          });
        }
      }
    } catch (error) {
      // Restore message on error if needed, but usually better to just toast
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

      const response = await sendMessageMutation.mutateAsync(payload);

      if (socket && participant && response.success) {
        socket.emit("send-message", {
          receiverId: participant._id,
          conversationId: conversation._id,
          message: response.data,
        });
      }
      
      setReplyingTo(null);
    } catch (error) {
      toast.error("Failed to upload/send image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVoiceUpload = async (blob: Blob, duration: number) => {
    setIsUploading(true);
    try {
      const file = new File([blob], `voice_${Date.now()}.m4a`, { type: "audio/m4a" });
      const uploadResult = await uploadVoiceMutation.mutateAsync(file);
      
      const payload: any = {
        conversationId: conversation._id,
        messageType: 'voice',
        media: {
          url: uploadResult.url,
          key: uploadResult.key,
          provider: uploadResult.provider,
        },
        mediaMeta: {
          duration,
          size: file.size,
          mimeType: file.type
        }
      };

      if (replyingTo) {
        payload.replyTo = {
          message: replyingTo._id,
          text: replyingTo.text || (replyingTo.messageType === 'voice' ? 'Voice message' : 'Media'),
          sender: replyingTo.sender._id
        };
      }

      const response = await sendMessageMutation.mutateAsync(payload);

      if (socket && participant && response.success) {
        socket.emit("send-message", {
          receiverId: participant._id,
          conversationId: conversation._id,
          message: response.data,
        });
      }

      setReplyingTo(null);
      setIsRecording(false);
    } catch (error) {
      toast.error("Failed to upload/send voice message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({
        conversationId: conversation._id,
        status,
      });
      toast.success(status === 'approved' ? "Message request accepted" : "Message request rejected");
      if (status === 'rejected') {
        removeWindow(conversation._id);
      }
    } catch (error) {
      toast.error("Failed to update request status");
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
      <div className="flex items-center justify-between p-3 border-b border-border bg-card rounded-t-xl shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded-lg transition-colors flex-1 min-w-0">
          <div className="relative">
            <Avatar className="w-9 h-9">
              <AvatarImage src={participant?.avatar?.url || ""} />
              <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-tight">{participant?.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {isOnline ? "Active now" : "Offline"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => minimizeWindow(conversation._id)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => removeWindow(conversation._id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 no-scrollbar bg-accent/5"
      >
        <div ref={topRef} className="h-1 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isReceivedRequest && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">Message Request</p>
              <p className="text-xs text-muted-foreground">
                {participant?.name} wants to connect with you. They won't know you've seen this until you accept.
              </p>
            </div>
          </div>
        ) : isSentRequest && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Send className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">Request Sent</p>
              <p className="text-xs text-muted-foreground">
                You've sent a message request to {participant?.name}.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id !== participant?._id;
            const showAvatar = !isMe && (idx === 0 || messages[idx-1]?.sender._id !== msg.sender._id);
            const isLast = idx === messages.length - 1;
            
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
                isLast={isLast}
              />
            );
          })
        )}

        {otherUserTyping && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={participant?.avatar?.url || ""} />
              <AvatarFallback className="text-[10px]">{participant?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-muted/50 rounded-2xl px-3 py-2 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {isReceivedRequest ? (
        <div className="p-4 border-t border-border bg-card space-y-3">
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full rounded-xl font-bold h-10" 
              onClick={() => handleUpdateStatus('approved')}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
            </Button>
            <Button 
              variant="secondary" 
              className="w-full rounded-xl font-bold h-10" 
              onClick={() => handleUpdateStatus('rejected')}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Request"}
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground">
            If you delete this request, they won't be able to message you again until you connect.
          </p>
        </div>
      ) : isSentRequest ? (
        <div className="p-4 border-t border-border bg-card text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Message request sent. Waiting for {participant?.name} to accept.
          </p>
        </div>
      ) : (
        <div className="p-3 border-t border-border flex flex-col gap-2 bg-card">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload}
          />
        
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
          {isRecording ? (
            <VoiceRecorder 
              onStop={handleVoiceUpload} 
              onCancel={() => setIsRecording(false)} 
              isUploading={isUploading}
            />
          ) : (
            <>
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
                  onChange={handleInputChange}
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:bg-primary/10"
                  onClick={() => setIsRecording(true)}
                  disabled={isUploading}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ChatWindow;
