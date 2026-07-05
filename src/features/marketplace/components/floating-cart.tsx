"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";
import { MediaImage } from "@/features/profile/components/media-image";
import { useGetCart, useUpdateCartQty, useRemoveFromCart } from "../hooks/cart-query";

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useGetCart();
  const updateQty = useUpdateCartQty();
  const removeItem = useRemoveFromCart();

  const items = data?.data ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.finalPrice ?? 0) * item.qty,
    0
  );

  const handleIncrement = (productId: string) => {
    updateQty.mutate({ productId, type: "inc" });
  };

  const handleDecrement = (productId: string, qty: number) => {
    if (qty <= 1) {
      removeItem.mutate(productId);
    } else {
      updateQty.mutate({ productId, type: "dec" });
    }
  };

  const handleRemove = (productId: string) => {
    removeItem.mutate(productId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Panel */}
      {isOpen && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[80vh]">
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">My Cart</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-base font-semibold mb-1">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Add some products to get started
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                        {item.product?.thumbnail?.key ? (
                          <MediaImage
                            mediaKey={item.product.thumbnail.key}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium line-clamp-1">
                          {item.product?.title}
                        </h4>
                        {item.seller?.shopName && (
                          <p className="text-[10px] text-muted-foreground">
                            {item.seller.shopName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-bold">
                            &#x09F3;{item.product?.finalPrice?.toLocaleString()}
                          </span>
                          {item.product?.discountPercent > 0 && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              &#x09F3;{item.product?.price?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="size-5"
                              disabled={updateQty.isPending || removeItem.isPending}
                              onClick={() => handleDecrement(item.productId, item.qty)}
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.qty}
                            </span>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="size-5"
                              disabled={updateQty.isPending || removeItem.isPending}
                              onClick={() => handleIncrement(item.productId)}
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 text-destructive hover:text-destructive"
                            disabled={removeItem.isPending}
                            onClick={() => handleRemove(item.productId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">
                    &#x09F3;{totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button className="w-full" size="sm">
                  Checkout ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Icon Button - hidden when panel is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -left-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background">
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </button>
      )}
    </>
  );
}
