"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { MediaImage } from "@/features/profile/components/media-image";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useGetSellerProducts, useDeleteSellerProduct } from "../hooks/seller-query";
import { Product, ProductStatus } from "@/types/product.types";
import { EditProductDialog } from "./edit-product-dialog";

const STATUS_FILTERS: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "pending", label: "Pending" },
  { value: "blocked", label: "Blocked" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  out_of_stock: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function SellerProductList() {
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useGetSellerProducts(statusFilter, page, 20);
  const { deleteProductMutation } = useDeleteSellerProduct();

  const products = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProductMutation.mutate(deletingProduct._id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
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
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0 gap-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-none">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {statusFilter === "all"
                ? "No products yet"
                : `No ${statusFilter.replace("_", " ")} products`}
            </h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "You haven't listed any products yet. Start selling!"
                : "No products match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <SellerProductCard
                key={product._id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => setDeletingProduct(product)}
              />
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

      {/* Edit Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => { if (!open) setDeletingProduct(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{deletingProduct?.title}&rdquo; from your listings.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeletingProduct(null)}
              disabled={deleteProductMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SellerProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasDiscount = product.discountPercent > 0;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted">
        {product.thumbnail?.key ? (
          <MediaImage
            mediaKey={product.thumbnail.key}
            alt={product.title}
            className="w-full h-full object-cover"
            fallback={
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <Package className="w-10 h-10" />
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            <Package className="w-10 h-10" />
          </div>
        )}
        {/* Status badge */}
        <Badge
          className={`absolute top-2 left-2 text-xs capitalize ${STATUS_COLORS[product.status] || STATUS_COLORS.draft}`}
          variant="secondary"
        >
          {product.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-3 space-y-2">
        <h3 className="text-sm font-semibold line-clamp-1">{product.title}</h3>

        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              &#x09F3;{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-base font-bold">
            &#x09F3;{product.finalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Stock: {product.stock}</span>
          <span>&middot;</span>
          <span>{product.soldCount} sold</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
