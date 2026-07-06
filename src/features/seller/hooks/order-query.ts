import { axiosClient } from "@/lib/api/axios-client";
import {
  OrderStatus,
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
} from "@/types/order.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ===============================|| SELLER ORDERS ||============================== //

const useGetSellerOrders = (status?: OrderStatus | "all", page = 1, limit = 20) => {
  const sellerOrdersQuery = useQuery({
    queryKey: ["seller-orders", status, page, limit],
    queryFn: async (): Promise<SellerOrderListResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status && status !== "all") params.set("status", status);
      const { data } = await axiosClient.get(`/e-commerce/seller/orders?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return sellerOrdersQuery;
};

const useGetSellerOrder = (id: string) => {
  const sellerOrderQuery = useQuery({
    queryKey: ["seller-order", id],
    queryFn: async (): Promise<SellerOrderDetailResponse> => {
      const { data } = await axiosClient.get(`/e-commerce/seller/orders/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return sellerOrderQuery;
};

const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderStatusPayload;
    }): Promise<UpdateOrderStatusResponse> => {
      const { data: response } = await axiosClient.patch(
        `/e-commerce/seller/orders/${id}/status`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );
      return response;
    },
    onSuccess: (response) => {
      toast.success(`Order status updated to ${response.status}`);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", response.orderId] });
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to update order status";
      toast.error(message);
    },
  });

  return { updateStatusMutation };
};

// ===============================|| ORDER HOOKS EXPORT ||============================== //

export { useGetSellerOrders, useGetSellerOrder, useUpdateOrderStatus };
