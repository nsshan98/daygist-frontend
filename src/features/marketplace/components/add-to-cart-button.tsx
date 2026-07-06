"use client";

import { Button } from "@/components/atoms/button";
import { ShoppingCart, Check } from "lucide-react";
import { useGetCart, useCartMutations } from "../hooks/cart-query";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({ productId, stock, className }: AddToCartButtonProps) {
  const { data } = useGetCart();
  const { useAddToCart } = useCartMutations();
  const addToCart = useAddToCart();

  const isOutOfStock = stock === 0;
  const isInCart = data?.data?.some((item) => item.productId === productId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart.mutate({ productId, qty: 1 });
  };

  return (
    <Button
      size="sm"
      variant={isInCart ? "default" : "secondary"}
      className={className}
      disabled={isOutOfStock}
      onClick={handleClick}
    >
      {isInCart ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {isOutOfStock ? "Out of Stock" : isInCart ? "Added" : "Add to Cart"}
    </Button>
  );
}
