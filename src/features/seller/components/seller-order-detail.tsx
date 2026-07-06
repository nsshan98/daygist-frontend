"use client";

import { Badge } from "@/components/atoms/badge";
import { Card, CardContent } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/atoms/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Skeleton } from "@/components/atoms/skeleton";
import { Loader2, MapPin, Phone, User, Package } from "lucide-react";
import { useGetSellerOrder, useUpdateOrderStatus } from "../hooks/order-query";
import { OrderStatus } from "@/types/order.types";

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

interface SellerOrderDetailProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SellerOrderDetail({ orderId, open, onOpenChange }: SellerOrderDetailProps) {
  const { data: order, isLoading } = useGetSellerOrder(orderId || "");
  const { updateStatusMutation } = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!orderId || !order) return;
    updateStatusMutation.mutate(
      { id: orderId, data: { status: newStatus } },
      { onSuccess: () => {} }
    );
  };

  const transitions = order ? VALID_TRANSITIONS[order.status] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            {orderId ? `#${orderId.slice(-8).toUpperCase()}` : ""}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : order ? (
          <div className="space-y-4 p-4">
            {/* Status & Update */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge className={`capitalize ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status}
                  </Badge>
                </div>
                {transitions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Update to:</span>
                    <Select
                      onValueChange={(val) => handleStatusChange(val as OrderStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {transitions.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updateStatusMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Buyer Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Buyer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.userId.name}</span>
                    <span className="text-muted-foreground">@{order.userId.username}</span>
                  </div>
                  {order.userId.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.userId.phone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{order.address.name}</p>
                      <p>{order.address.phone}</p>
                      <p className="text-muted-foreground">{order.address.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product?.title || `Product ${idx + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant && `${item.variant} · `}Qty: {item.qty} · &#x09F3;{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment & Totals */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Payment</h4>
                <div className="text-sm text-muted-foreground">
                  {order.paymentMethod}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>&#x09F3;{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>&#x09F3;{order.shippingFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>&#x09F3;{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground text-center">
              Created: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Order not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
