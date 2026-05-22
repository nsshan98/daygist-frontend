import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConversationsResponse, MessagesResponse, ChatMessage } from "@/types";

export interface SendMessagePayload {
  conversationId: string;
  text?: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'voice';
  media?: {
    url: string;
    key: string;
    provider: string;
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

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await axiosClient.post<{ success: boolean; data: ChatMessage }>(
        `/chat/messages/send`,
        payload
      );
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      // Also invalidate conversations list to update last message
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
