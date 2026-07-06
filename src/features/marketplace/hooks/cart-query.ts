import { useRef } from "react";
import { axiosClient } from "@/lib/api/axios-client";
import {
  CartResponse,
  CartSeller,
  AddToCartPayload,
  AddToCartResponse,
  RemoveFromCartResponse,
  UpdateCartQtyPayload,
  UpdateCartQtyResponse,
} from "@/types/cart.types";
import { Product } from "@/types/product.types";
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
    staleTime: 1000 * 60 * 2,
  });

  return cartQuery;
};

// ===============================|| CART MUTATIONS (Optimistic + Debounced) ||============================== //

const useCartMutations = () => {
  const queryClient = useQueryClient();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingQtyRef = useRef<Map<string, number>>(new Map());

  const flushDebounced = (key: string, fn: () => Promise<void>) => {
    const existing = timersRef.current.get(key);
    if (existing) clearTimeout(existing);
    timersRef.current.set(
      key,
      setTimeout(() => {
        timersRef.current.delete(key);
        fn();
      }, DEBOUNCE_MS)
    );
  };

  // ---- Add to Cart ---- //
  const useAddToCart = () => {
    return useMutation({
      mutationFn: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
        const { data } = await axiosClient.post("/e-commerce/cart/add", payload);
        return data;
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        queryClient.setQueryData<CartResponse>(["cart"], (old) => {
          if (!old) return old;
          const existing = old.data.find((i) => i.productId === payload.productId);
          if (existing) {
            const newQty = existing.qty + payload.qty;
            pendingQtyRef.current.set(payload.productId, newQty);
            return {
              ...old,
              data: old.data.map((i) =>
                i.productId === payload.productId ? { ...i, qty: newQty } : i
              ),
            };
          }
          pendingQtyRef.current.set(payload.productId, payload.qty);
          return {
            ...old,
            data: [
              ...old.data,
              {
                productId: payload.productId,
                qty: payload.qty,
                product: {} as Product,
                seller: {} as CartSeller,
              },
            ],
          };
        });

        flushDebounced(`add-${payload.productId}`, async () => {
          const qty = pendingQtyRef.current.get(payload.productId);
          if (qty === undefined) return;
          pendingQtyRef.current.delete(payload.productId);
          try {
            await axiosClient.patch("/e-commerce/cart/qty", {
              productId: payload.productId,
              type: "set",
              qty,
              variant: "Default",
            });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
          } catch {
            queryClient.setQueryData(["cart"], previous);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.error("Failed to add to cart");
          }
        });

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
        const { data } = await axiosClient.patch("/e-commerce/cart/qty", payload);
        return data;
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        const currentQty = pendingQtyRef.current.get(payload.productId)
          ?? previous?.data.find((i) => i.productId === payload.productId)?.qty
          ?? 0;

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

        flushDebounced(`qty-${payload.productId}`, async () => {
          const qty = pendingQtyRef.current.get(payload.productId);
          if (qty === undefined) return;
          pendingQtyRef.current.delete(payload.productId);
          if (qty <= 0) {
            try {
              await axiosClient.delete(
                `/e-commerce/cart/remove/${payload.productId}?variant=Default`
              );
              queryClient.invalidateQueries({ queryKey: ["cart"] });
            } catch {
              queryClient.setQueryData(["cart"], previous);
              queryClient.invalidateQueries({ queryKey: ["cart"] });
              toast.error("Failed to update cart");
            }
          } else {
            try {
              await axiosClient.patch("/e-commerce/cart/qty", {
                productId: payload.productId,
                type: "set",
                qty,
                variant: "Default",
              });
              queryClient.invalidateQueries({ queryKey: ["cart"] });
            } catch {
              queryClient.setQueryData(["cart"], previous);
              queryClient.invalidateQueries({ queryKey: ["cart"] });
              toast.error("Failed to update cart");
            }
          }
        });

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
        const { data } = await axiosClient.delete(
          `/e-commerce/cart/remove/${productId}?variant=Default`
        );
        return data;
      },
      onMutate: async (productId) => {
        await queryClient.cancelQueries({ queryKey: ["cart"] });
        const previous = queryClient.getQueryData<CartResponse>(["cart"]);

        pendingQtyRef.current.delete(productId);

        queryClient.setQueryData<CartResponse>(["cart"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((i) => i.productId !== productId),
          };
        });

        flushDebounced(`remove-${productId}`, async () => {
          try {
            await axiosClient.delete(
              `/e-commerce/cart/remove/${productId}?variant=Default`
            );
            queryClient.invalidateQueries({ queryKey: ["cart"] });
          } catch {
            queryClient.setQueryData(["cart"], previous);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.error("Failed to remove from cart");
          }
        });

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
