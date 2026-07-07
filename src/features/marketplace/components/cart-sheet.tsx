"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/atoms/sheet";
import { Skeleton } from "@/components/atoms/skeleton";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { MediaImage } from "@/features/profile/components/media-image";
import { useCartStore } from "../stores/cart-store";
import { useGetCart, useCartMutations } from "../hooks/cart-query";

export function CartSheet() {
  const router = useRouter();
  const { isCartOpen, closeCart } = useCartStore();
  const { data, isLoading } = useGetCart();
  const { useUpdateCartQty, useRemoveFromCart } = useCartMutations();
  const updateQty = useUpdateCartQty();
  const removeItem = useRemoveFromCart();

  const items = data?.data ?? [];
  const productCount = items.length;
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
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Cart
            {productCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({productCount} product{productCount !== 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex gap-3 p-3 rounded-lg border"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.product?.thumbnail?.key ? (
                      <MediaImage
                        mediaKey={item.product.thumbnail.key}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {item.product?.title}
                    </h4>
                    {item.seller?.shopName && (
                      <p className="text-xs text-muted-foreground">
                        {item.seller.shopName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold">
                        &#x09F3;{item.product?.finalPrice?.toLocaleString()}
                      </span>
                      {item.product?.discountPercent > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          &#x09F3;{item.product?.price?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleDecrement(item.productId, item.qty)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          disabled={item.qty >= (item.product?.stock ?? 0)}
                          onClick={() => handleIncrement(item.productId)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">
                &#x09F3;{totalPrice.toLocaleString()}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                closeCart();
                router.push("/orders/checkout");
              }}
            >
              Checkout ({productCount} product{productCount !== 1 ? "s" : ""})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
