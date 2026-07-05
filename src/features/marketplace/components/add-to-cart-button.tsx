"use client";

import { Button } from "@/components/atoms/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useAddToCart } from "../hooks/cart-query";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({ productId, stock, className }: AddToCartButtonProps) {
  const addToCart = useAddToCart();

  const isOutOfStock = stock === 0;
  const isAdding = addToCart.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock || isAdding) return;
    addToCart.mutate({ productId, qty: 1 });
  };

  return (
    <Button
      size="sm"
      variant={addToCart.isSuccess ? "default" : "secondary"}
      className={className}
      disabled={isOutOfStock || isAdding}
      onClick={handleClick}
    >
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : addToCart.isSuccess ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : addToCart.isSuccess ? "Added" : "Add to Cart"}
    </Button>
  );
}
