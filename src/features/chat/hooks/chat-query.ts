import { axiosClient } from "@/lib/api/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConversationsResponse, MessagesResponse, ChatMessage } from "@/types";
import { useGetUserProfile } from "@/features/profile/hooks/profile-query";

export interface SendMessagePayload {
  conversationId: string;
  text?: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'voice';
  media?: {
    url: string;
    key: string;
    provider: string;
  };
  mediaMeta?: {
    duration?: number;
    size?: number;
    mimeType?: string;
  };
  replyTo?: {
    message: string;
    text: string;
    sender: string;
  } | null;
}

export const useGetConversations = (status?: string) => {
  return useInfiniteQuery({
    queryKey: ["conversations", status],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set("page", pageParam.toString());
      params.set("limit", "20");
      if (status && status !== "all") {
        params.set("status", status);
      }

      const { data } = await axiosClient.get<ConversationsResponse>(
        `/chat/conversations/my?${params.toString()}`
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

export const useGetMessages = (conversationId: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosClient.get<MessagesResponse>(
        `/chat/messages/${conversationId}?page=${pageParam}&limit=20`
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { showUserProfileQuery } = useGetUserProfile();
  const currentUser = showUserProfileQuery.data?.data;

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await axiosClient.post<{ success: boolean; data: ChatMessage }>(
        `/chat/messages/send`,
        payload
      );
      return data;
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages", newMessage.conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["messages", newMessage.conversationId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["messages", newMessage.conversationId], (old: any) => {
        if (!old) return old;
        
        const newPages = [...old.pages];
        const lastPageIndex = newPages.length - 1;
        
        if (lastPageIndex < 0) return old;

        // Create a temporary message object
        const tempMessage: ChatMessage = {
          _id: `temp-${Date.now()}`,
          conversationId: newMessage.conversationId,
          text: newMessage.text || "",
          messageType: newMessage.messageType || "text",
          media: newMessage.media ? {
            url: newMessage.media.url,
            key: newMessage.media.key,
            provider: newMessage.media.provider,
          } : { url: "", key: "", provider: "wasabi" },
          mediaMeta: {
            duration: newMessage.mediaMeta?.duration || 0,
            size: newMessage.mediaMeta?.size || 0,
            mimeType: newMessage.mediaMeta?.mimeType || "",
          },
          sender: currentUser ? {
            _id: currentUser._id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            username: currentUser.username,
            isOnline: true,
          } as any : { _id: "me", name: "Me", username: "me", avatar: { url: null, key: null, provider: "wasabi" } } as any,
          receiver: {} as any, // Temporary receiver info
          seen: false,
          delivered: false,
          seenAt: null,
          deliveredAt: null,
          isDeleted: false,
          reactions: [],
          replyTo: newMessage.replyTo || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
        };

        newPages[lastPageIndex] = {
          ...newPages[lastPageIndex],
          data: [...newPages[lastPageIndex].data, tempMessage],
        };
        
        return { ...old, pages: newPages };
      });

      return { previousMessages };
    },
    onError: (err, newMessage, context: any) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", newMessage.conversationId],
          context.previousMessages
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useMarkMessagesAsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data } = await axiosClient.patch<{
        success: boolean;
        message: string;
        data: {
          conversationId: string;
          updatedCount: number;
          messageIds: string[];
        };
      }>(`/chat/messages/seen/${conversationId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, text }: { messageId: string; text: string }) => {
      const { data } = await axiosClient.patch<{ success: boolean; data: ChatMessage }>(
        `/chat/message/${messageId}`,
        { text }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data } = await axiosClient.delete<{ success: boolean }>(
        `/chat/message/${messageId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useReactToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const { data } = await axiosClient.patch<{ success: boolean; data: ChatMessage }>(
        `/chat/reaction/${messageId}`,
        { emoji }
      );
      return data;
    },
    onSuccess: (response) => {
      const updatedMessage = response.data;
      queryClient.setQueryData(["messages", updatedMessage.conversationId], (old: any) => {
        if (!old) return old;
        
        const newPages = old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: ChatMessage) => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        }));
        
        return { ...old, pages: newPages };
      });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otherUserId, type = "general" }: { otherUserId: string; type?: string }) => {
      const { data } = await axiosClient.post<{ success: boolean; data: any }>(
        `/chat/conversations/create-or-get`,
        { otherUserId, type }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: 'approved' | 'rejected' }) => {
      const { data } = await axiosClient.patch<{ success: boolean; data: any }>(
        `/chat/conversations/accept/${conversationId}?status=${status}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useCheckExistingConversation = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["check-existing-conversation", userId],
    queryFn: async () => {
      const { data } = await axiosClient.get<{
        success: boolean;
        exists: boolean;
        message: string;
        conversationId?: string;
      }>(`/chat/conversations/${userId}/checkExisting`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!userId,
  });
};
