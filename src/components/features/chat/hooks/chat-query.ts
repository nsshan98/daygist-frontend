import { axiosClient } from "@/lib/axios-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ConversationsResponse } from "@/types";

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
