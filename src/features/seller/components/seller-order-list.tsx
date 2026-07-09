"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { ChevronLeft, ChevronRight, Package, Eye } from "lucide-react";
import { useGetSellerOrders } from "../hooks/order-query";
import { OrderStatus, SellerOrder } from "@/types/order.types";
import { SellerOrderDetail } from "./seller-order-detail";
import { ORDER_STATUS_FILTERS, ORDER_STATUS_COLORS } from "@/lib/constants";

export function SellerOrderList() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useGetSellerOrders(statusFilter, page, 20);
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
            <Skeleton key={i} className="h-16 w-full" />
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
                ? "Orders from customers will appear here."
                : "No orders match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Orders Table */}
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onView={() => setSelectedOrderId(order._id)}
                  />
                ))}
              </TableBody>
            </Table>
          </Card>

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

      {/* Order Detail Sheet */}
      <SellerOrderDetail
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      />
    </div>
  );
}

function OrderRow({
  order,
  onView,
}: {
  order: SellerOrder;
  onView: () => void;
}) {
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <TableRow className="cursor-pointer" onClick={onView}>
      <TableCell className="font-mono text-xs">
        #{order._id.slice(-8).toUpperCase()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{order.userId.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-center text-sm">{totalQty}</TableCell>
      <TableCell className="text-right text-sm font-semibold">
        &#x09F3;{order.total.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge
          className={`capitalize text-xs ${ORDER_STATUS_COLORS[order.status] || ""}`}
          variant="secondary"
        >
          {order.status}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
