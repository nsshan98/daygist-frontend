"use client";

import { Button } from "@/components/atoms/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useGetCart, useCartMutations } from "../hooks/cart-query";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({ productId, stock, className }: AddToCartButtonProps) {
  const { data } = useGetCart();
  const { useAddToCart, useUpdateCartQty, useRemoveFromCart } = useCartMutations();
  const addToCart = useAddToCart();
  const updateQty = useUpdateCartQty();
  const removeItem = useRemoveFromCart();

  const isOutOfStock = stock === 0;
  const cartItem = data?.data?.find((item) => item.productId === productId);
  const qty = cartItem?.qty ?? 0;
  const isInCart = qty > 0;
  const isMaxStock = qty >= stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart.mutate({ productId, qty: 1 });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isMaxStock) return;
    updateQty.mutate({ productId, type: "inc" });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (qty <= 1) {
      removeItem.mutate(productId);
    } else {
      updateQty.mutate({ productId, type: "dec" });
    }
  };

  if (isOutOfStock) {
    return (
      <Button size="sm" variant="secondary" className={className} disabled>
        <ShoppingCart className="w-4 h-4" />
        Out of Stock
      </Button>
    );
  }

  if (isInCart) {
    return (
      <div
        className={`flex items-center justify-center gap-1 ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shrink-0"
          onClick={handleDecrement}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">
          {qty}
        </span>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shrink-0"
          disabled={isMaxStock}
          onClick={handleIncrement}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className={className}
      disabled={addToCart.isPending}
      onClick={handleAdd}
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </Button>
  );
}
