import { axiosClient } from "@/lib/axios-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Notification, NotificationsResponse, MarkAllSeenResponse } from "@/types";

// ===============================|| GET NOTIFICATIONS ||============================== //
const useGetNotifications = (cursor?: { createdAt: string; _id: string } | null) => {
  const notificationsQuery = useQuery({
    queryKey: ["notifications", cursor],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cursor) {
        params.set("cursor", JSON.stringify(cursor));
      }
      
      const { data } = await axiosClient.get<NotificationsResponse>(
        `/notification?${params.toString()}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
  return { notificationsQuery };
};

// ===============================|| MARK ALL SEEN ||============================== //
const useMarkAllSeen = () => {
  const queryClient = useQueryClient();
  
  const markAllSeenMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosClient.post<MarkAllSeenResponse>("/notification/mark-all-seen");
      return data;
    },
    onSuccess: () => {
      toast.success("All notifications marked as seen");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  return { markAllSeenMutation };
};

export { useGetNotifications, useMarkAllSeen };
