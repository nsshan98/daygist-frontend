"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Separator } from "@/components/atoms/separator";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Package,
  CreditCard,
  Clock,
} from "lucide-react";
import { useGetMyOrderDetail } from "../hooks/order-query";
import { MediaImage } from "@/features/profile/components/media-image";

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_STEPS = ["placed", "processing", "shipped", "delivered"] as const;

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const { data: order, isLoading } = useGetMyOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Order not found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 w-fit"
        onClick={() => router.push("/orders")}
      >
        <ArrowLeft className="w-4 h-4" />
        My Orders
      </Button>

      {/* Order Header */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order Details</h2>
              <p className="text-sm text-muted-foreground font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <Badge className={`capitalize text-sm ${STATUS_COLORS[order.status] || ""}`}>
              {order.status}
            </Badge>
          </div>

          {/* Status Progress */}
          {isCancelled ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="w-4 h-4" />
              This order has been cancelled
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 capitalize">
                      {step}
                    </span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Delivery Address
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{order.address.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{order.address.phone}</span>
            </div>
            <p className="text-muted-foreground pl-5.5">{order.address.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Items ({order.items.length})
          </h4>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
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
                    {item.product?.title || `Product ${idx + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant && `${item.variant} · `}Qty: {item.qty}
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0">
                  &#x09F3;{(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Summary
          </h4>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-foreground">{order.paymentMethod}</span>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>&#x09F3;{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span>&#x09F3;{order.shippingFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>&#x09F3;{order.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
        <p>Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
