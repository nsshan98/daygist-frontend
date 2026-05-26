"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MessageCircle, Loader2, Search, MoreHorizontal, Maximize2, Edit3, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { useGetConversations, useUpdateConversationStatus } from "../hooks/chat-query";
import { useChatStore } from "../stores/chat-store";
import { useSocket } from "../context/socket-context";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserProfile } from "@/components/features/profile/hooks/profile-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/atoms/input";
import type { Conversation } from "@/types";

const ChatDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "general" | "marketplace" | "pending" | "requested">("all");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetConversations(activeTab);

  const router = useRouter();
  const { addWindow } = useChatStore();
  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const conversations = data?.pages.flatMap((page) => page.data) || [];
  
  const filteredConversations = useMemo(() => {
    if (activeTab === "all") {
      return conversations.filter(c => c.status !== "requested");
    }
    
    if (activeTab === "requested") {
      // Sent requests: status is requested AND requestedBy IS current user
      return conversations.filter(c => c.status === "requested" && c.requestedBy === currentUser?._id);
    }
    
    if (activeTab === "pending") {
      // Incoming requests: status is requested AND requestedBy is NOT current user
      return conversations.filter(c => c.status === "requested" && c.requestedBy !== currentUser?._id);
    }
    
    return conversations.filter(c => 
      c.status !== "requested" && 
      ((c as any).status === activeTab || c.type === activeTab)
    );
  }, [conversations, activeTab, currentUser?._id]);

  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.myUnreadCount || 0), 0);

  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleReceiveMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("conversation-updated", handleConversationUpdate);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, queryClient]);

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

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updateStatusMutation = useUpdateConversationStatus();

  const handleUpdateStatus = async (e: React.MouseEvent, conversationId: string, status: 'approved' | 'rejected') => {
    e.stopPropagation();
    try {
      await updateStatusMutation.mutateAsync({
        conversationId,
        status,
      });
      toast.success(status === 'approved' ? "Message request accepted" : "Message request rejected");
    } catch (error) {
      toast.error("Failed to update request status");
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    addWindow(conversation);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer">
          <MessageCircle className="w-6 h-6" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-card">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] mt-2 rounded-2xl shadow-xl border border-border overflow-hidden p-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Chats</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Messenger" 
              className="pl-9 bg-muted/50 border-none rounded-full h-9 focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "All" },
              { id: "general", label: "General" },
              { id: "marketplace", label: "Marketplace" },
              { id: "pending", label: "Pending" },
              { id: "requested", label: "Requested" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "rounded-full px-4 h-8 text-sm font-medium transition-colors",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
          {isLoading && filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">No messages yet</p>
              <p className="text-muted-foreground text-sm">When you start a conversation, it will show up here.</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredConversations.map((conversation) => {
                const participant = conversation.participants.find(p => p._id !== currentUser?._id) || conversation.participants[0];
                if (!participant) return null;

                const isSentRequestTab = activeTab === "requested";

                return (
                  <button
                    key={conversation._id}
                    onClick={() => !isSentRequestTab && handleConversationClick(conversation)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left relative group",
                      isSentRequestTab ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-14 h-14 border border-border">
                        <AvatarImage src={participant.avatar?.url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {participant.isOnline && (
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[15px] font-semibold text-foreground truncate">
                          {participant.name}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
                          {activeTab === "pending" && <span className="ml-1 text-[10px] uppercase font-bold text-blue-500">New</span>}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={cn(
                          "text-sm truncate",
                          conversation.myUnreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground"
                        )}>
                          {conversation.lastMessage || (
                            conversation.status === 'requested' 
                              ? (conversation.requestedBy === currentUser?._id ? "You sent a message request" : "Sent you a message request")
                              : "No messages yet"
                          )}
                        </p>
                        {conversation.myUnreadCount > 0 && (
                          <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>

                    {/* Quick Actions for Requested/Rejected */}
                    {activeTab === "pending" && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-green-500"
                          onClick={(e) => handleUpdateStatus(e, conversation._id, 'approved')}
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-red-500"
                          onClick={(e) => handleUpdateStatus(e, conversation._id, 'rejected')}
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                        </Button>
                      </div>
                    )}
                  </button>
                );
              })}
              
              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
              </div>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full text-primary font-semibold hover:bg-primary/5 rounded-xl h-10"
            onClick={() => {
              router.push("/messages");
              setIsOpen(false);
            }}
          >
            See all in Messenger
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatDropdown;
