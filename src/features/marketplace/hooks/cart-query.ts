import { useRef } from "react";
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

const DEBOUNCE_MS = 500;

// ===============================|| GET CART ||============================== //

const useGetCart = () => {
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async (): Promise<CartResponse> => {
      const { data } = await axiosClient.get("/e-commerce/cart");
      return data;
    },
    staleTime: 0,
  });

  return cartQuery;
};

// ===============================|| CART MUTATIONS ||============================== //

const useCartMutations = () => {
  const queryClient = useQueryClient();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingQtyRef = useRef<Map<string, number>>(new Map());

  const fetchCart = async (): Promise<CartResponse> => {
    const { data } = await axiosClient.get("/e-commerce/cart");
    return data;
  };

  const flushQty = async (productId: string) => {
    const qty = pendingQtyRef.current.get(productId);
    if (qty === undefined) return;
    pendingQtyRef.current.delete(productId);

    try {
      if (qty <= 0) {
        await axiosClient.delete(
          `/e-commerce/cart/remove/${productId}?variant=Default`
        );
      } else {
        await axiosClient.patch("/e-commerce/cart/qty", {
          productId,
          type: "set",
          qty,
          variant: "Default",
        });
      }
      const cartData = await fetchCart();
      queryClient.setQueryData(["cart"], cartData);
    } catch {
      toast.error("Failed to update cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  };

  const debounceFlush = (productId: string) => {
    const existing = timersRef.current.get(productId);
    if (existing) clearTimeout(existing);
    timersRef.current.set(
      productId,
      setTimeout(() => {
        timersRef.current.delete(productId);
        flushQty(productId);
      }, DEBOUNCE_MS)
    );
  };

  // ---- Add to Cart ---- //
  const useAddToCart = () => {
    return useMutation({
      mutationFn: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
        // No API call here — handled by debounced flush
        return {} as AddToCartResponse;
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        const currentQty =
          previous?.data.find((i) => i.productId === payload.productId)?.qty ?? 0;
        const newQty = currentQty + payload.qty;

        pendingQtyRef.current.set(payload.productId, newQty);

        // Optimistic: bump qty if already in cart
        queryClient.setQueryData<CartResponse>(["cart"], (old) => {
          if (!old) return old;
          const existing = old.data.find((i) => i.productId === payload.productId);
          if (existing) {
            return {
              ...old,
              data: old.data.map((i) =>
                i.productId === payload.productId
                  ? { ...i, qty: newQty }
                  : i
              ),
            };
          }
          return old;
        });

        debounceFlush(payload.productId);
        return { previous };
      },
      onSuccess: () => {
        toast.success("Added to cart");
      },
      onError: (_error, _payload, context) => {
        if (context?.previous) {
          queryClient.setQueryData(["cart"], context.previous);
        }
        toast.error("Failed to add to cart");
      },
    });
  };

  // ---- Update Quantity ---- //
  const useUpdateCartQty = () => {
    return useMutation({
      mutationFn: async (payload: UpdateCartQtyPayload): Promise<UpdateCartQtyResponse> => {
        // No API call here — handled by debounced flush
        return {} as UpdateCartQtyResponse;
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        const currentQty =
          pendingQtyRef.current.get(payload.productId) ??
          previous?.data.find((i) => i.productId === payload.productId)?.qty ??
          0;

        let newQty: number;
        if (payload.type === "inc") {
          newQty = currentQty + 1;
        } else if (payload.type === "dec") {
          newQty = Math.max(0, currentQty - 1);
        } else if (payload.type === "set") {
          newQty = payload.qty ?? 0;
        } else {
          newQty = 0;
        }

        pendingQtyRef.current.set(payload.productId, newQty);

        // Optimistic: update locally
        queryClient.setQueryData<CartResponse>(["cart"], (old) => {
          if (!old) return old;
          if (newQty <= 0) {
            return { ...old, data: old.data.filter((i) => i.productId !== payload.productId) };
          }
          return {
            ...old,
            data: old.data.map((i) =>
              i.productId === payload.productId ? { ...i, qty: newQty } : i
            ),
          };
        });

        debounceFlush(payload.productId);
        return { previous };
      },
      onError: (_error, _payload, context) => {
        if (context?.previous) {
          queryClient.setQueryData(["cart"], context.previous);
        }
        toast.error("Failed to update cart");
      },
    });
  };

  // ---- Remove from Cart ---- //
  const useRemoveFromCart = () => {
    return useMutation({
      mutationFn: async (productId: string): Promise<RemoveFromCartResponse> => {
        // No API call here — handled by debounced flush
        return {} as RemoveFromCartResponse;
      },
      onMutate: async (productId) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        pendingQtyRef.current.set(productId, 0);

        // Optimistic: remove immediately
        queryClient.setQueryData<CartResponse>(["cart"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((i) => i.productId !== productId),
          };
        });

        debounceFlush(productId);
        return { previous };
      },
      onSuccess: () => {
        toast.success("Removed from cart");
      },
      onError: (_error, _productId, context) => {
        if (context?.previous) {
          queryClient.setQueryData(["cart"], context.previous);
        }
        toast.error("Failed to remove from cart");
      },
    });
  };

  return { useAddToCart, useUpdateCartQty, useRemoveFromCart };
};

// ===============================|| CART HOOKS EXPORT ||============================== //

export { useGetCart, useCartMutations };
