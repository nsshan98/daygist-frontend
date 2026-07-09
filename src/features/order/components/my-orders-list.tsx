"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { ChevronLeft, ChevronRight, Package, Eye } from "lucide-react";
import { useGetMyOrders } from "../hooks/order-query";
import { OrderStatus, BuyerOrder } from "@/types/order.types";
import { ORDER_STATUS_FILTERS, ORDER_STATUS_COLORS } from "@/lib/constants";

export function MyOrdersList() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetMyOrders(statusFilter, page, 20);
  const orders = data?.orders ?? [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-4">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUS_FILTERS.map((s) => (
          <Badge
            key={s.value}
            variant={statusFilter === s.value ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5 text-sm"
            onClick={() => {
              setStatusFilter(s.value);
              setPage(1);
            }}
          >
            {s.label}
          </Badge>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-none">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {statusFilter === "all"
                ? "No orders yet"
                : `No ${statusFilter} orders`}
            </h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "Your orders will appear here after you place one."
                : "No orders match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: BuyerOrder }) {
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Link href={`/orders/${order._id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <Badge
                  className={`capitalize text-xs ${ORDER_STATUS_COLORS[order.status] || ""}`}
                  variant="secondary"
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalQty} item{totalQty !== 1 ? "s" : ""} · {order.paymentMethod}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-lg font-bold">
                &#x09F3;{order.total.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                View
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
