"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Card, CardContent } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Loader2, ShoppingBag, Package, ArrowLeft, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { placeOrderSchema, PlaceOrderSchemaType } from "@/schema/order-schema";
import { useGetCart } from "@/features/marketplace/hooks/cart-query";
import { usePlaceOrder } from "../hooks/order-query";
import { MediaImage } from "@/features/profile/components/media-image";

export function CheckoutForm() {
  const router = useRouter();
  const { data: cartData, isLoading: cartLoading } = useGetCart();
  const { placeOrderMutation } = usePlaceOrder();

  const items = cartData?.data ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.finalPrice ?? 0) * item.qty,
    0
  );
  const shippingFee = items.length > 0 ? 60 : 0;
  const total = subtotal + shippingFee;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const form = useForm<PlaceOrderSchemaType>({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      paymentMethod: "Cash one delivery",
    },
    resolver: zodResolver(placeOrderSchema),
  });

  const onSubmit = (data: PlaceOrderSchemaType) => {
    if (items.length === 0) return;

    placeOrderMutation.mutate(
      {
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          variant: "Default",
        })),
        address: {
          name: data.name,
          phone: data.phone,
          address: data.address,
        },
        paymentMethod: data.paymentMethod,
      },
      {
        onSuccess: (response) => {
          router.push(`/orders/${response.data._id}`);
        },
      }
    );
  };

  if (cartLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] lg:col-span-2" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-none">
        <CardContent className="py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add some products before checking out.
          </p>
          <Button onClick={() => router.push("/marketplace")}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 w-fit -ml-2"
          onClick={() => router.push("/marketplace")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cart</span>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium text-foreground">Shipping</span>
            <span className="text-muted-foreground">›</span>
            <span className="text-muted-foreground">Payment</span>
          </div>
          <span className="text-sm text-muted-foreground">Step 2 of 3</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Shipping Address */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <h2 className="text-base font-semibold">Shipping Address</h2>
                  <Separator />

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+880 ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="House #, Road #, Area, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Payment Method</h3>
                    <Separator />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label
                              className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "Cash one delivery"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-accent/50"
                              }`}
                            >
                              <input
                                type="radio"
                                className="accent-primary"
                                checked={field.value === "Cash one delivery"}
                                onChange={() => field.onChange("Cash one delivery")}
                              />
                              <div>
                                <span className="text-sm font-medium">Cash on Delivery</span>
                                <p className="text-xs text-muted-foreground">Pay when you receive</p>
                              </div>
                            </label>
                            <label
                              className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "BKASH"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-accent/50"
                              }`}
                            >
                              <input
                                type="radio"
                                className="accent-primary"
                                checked={field.value === "BKASH"}
                                onChange={() => field.onChange("BKASH")}
                              />
                              <div>
                                <span className="text-sm font-medium">BKASH</span>
                                <p className="text-xs text-muted-foreground">Pay via BKASH</p>
                              </div>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mobile: Place Order Button */}
              <Button
                type="submit"
                className="w-full lg:hidden"
                size="lg"
                disabled={placeOrderMutation.isPending}
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — ৳${total.toLocaleString()}`
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Cart ({totalQty} Item{totalQty !== 1 ? "s" : ""})
              </h2>
              <Separator />

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.product?.thumbnail?.key ? (
                        <MediaImage
                          mediaKey={item.product.thumbnail.key}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.product?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      &#x09F3;{((item.product?.finalPrice ?? 0) * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>&#x09F3;{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>&#x09F3;{shippingFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>&#x09F3;{total.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              {/* Desktop: Place Order Button */}
              <Button
                type="submit"
                className="w-full hidden lg:flex"
                size="lg"
                disabled={placeOrderMutation.isPending}
                form="checkout-form"
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — ৳${total.toLocaleString()}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
