import { axiosClient } from "@/lib/api/axios-client";
import {
  CartResponse,
  AddToCartPayload,
  AddToCartResponse,
  RemoveFromCartResponse,
  UpdateCartQtyPayload,
  UpdateCartQtyResponse,
} from "@/types/cart.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ===============================|| GET CART ||============================== //

const useGetCart = () => {
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async (): Promise<CartResponse> => {
      const { data } = await axiosClient.get("/e-commerce/cart");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return cartQuery;
};

// ===============================|| ADD TO CART ||============================== //

const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
      const { data } = await axiosClient.post("/e-commerce/cart/add", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    },
  });
};

// ===============================|| REMOVE FROM CART ||============================== //

const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<RemoveFromCartResponse> => {
      const { data } = await axiosClient.delete(
        `/e-commerce/cart/remove/${productId}?variant=Default`
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Removed from cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to remove from cart");
    },
  });
};

// ===============================|| UPDATE CART QTY ||============================== //

const useUpdateCartQty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCartQtyPayload): Promise<UpdateCartQtyResponse> => {
      const { data } = await axiosClient.patch("/e-commerce/cart/qty", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
  });
};

// ===============================|| CART HOOKS EXPORT ||============================== //

export { useGetCart, useAddToCart, useRemoveFromCart, useUpdateCartQty };
