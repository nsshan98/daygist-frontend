import { axiosClient } from "@/lib/api/axios-client";
import {
  OrderStatus,
  PlaceOrderPayload,
  PlaceOrderResponse,
  BuyerOrderListResponse,
  BuyerOrderDetailResponse,
} from "@/types/order.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ===============================|| PLACE ORDER ||============================== //

const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  const placeOrderMutation = useMutation({
    mutationFn: async (payload: PlaceOrderPayload): Promise<PlaceOrderResponse> => {
      const { data } = await axiosClient.post("/e-commerce/orders", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Order placed successfully");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to place order";
      toast.error(message);
    },
  });

  return { placeOrderMutation };
};

// ===============================|| GET MY ORDERS ||============================== //

const useGetMyOrders = (status?: OrderStatus | "all", page = 1, limit = 20) => {
  const myOrdersQuery = useQuery({
    queryKey: ["my-orders", status, page, limit],
    queryFn: async (): Promise<BuyerOrderListResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status && status !== "all") params.set("status", status);
      const { data } = await axiosClient.get(`/e-commerce/orders?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return myOrdersQuery;
};

// ===============================|| GET MY ORDER DETAIL ||============================== //

const useGetMyOrderDetail = (id: string) => {
  const myOrderDetailQuery = useQuery({
    queryKey: ["my-order", id],
    queryFn: async (): Promise<BuyerOrderDetailResponse> => {
      const { data } = await axiosClient.get(`/e-commerce/orders/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return myOrderDetailQuery;
};

// ===============================|| BUYER ORDER HOOKS EXPORT ||============================== //

export { usePlaceOrder, useGetMyOrders, useGetMyOrderDetail };
