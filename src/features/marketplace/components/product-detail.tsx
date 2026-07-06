"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Separator } from "@/components/atoms/separator";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { MediaImage } from "@/features/profile/components/media-image";
import { useGetProduct, useGetRelatedProducts } from "../hooks/product-query";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductCard } from "./product-card";

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const { data, isLoading, error } = useGetProduct(productId);
  const { data: relatedData } = useGetRelatedProducts(productId, 8);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/marketplace">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const product = data.data;
  const hasDiscount = product.discountPercent > 0;
  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const relatedProducts = relatedData?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Back Link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Marketplace
      </Link>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {images[selectedImageIndex]?.key ? (
              <MediaImage
                mediaKey={images[selectedImageIndex].key}
                alt={product.title}
                className="w-full h-full object-contain"
                fallback={
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    <ShoppingCart className="w-24 h-24" />
                  </div>
                }
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <ShoppingCart className="w-24 h-24" />
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Discount badge */}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none text-sm font-bold px-3 py-1">
                -{product.discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === idx
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {img?.key ? (
                    <MediaImage
                      mediaKey={img.key}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full bg-muted" />
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Title */}
          <div className="space-y-2">
            {product.brand && (
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold">{product.title}</h1>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 text-sm">
            {product.ratingAvg > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{product.ratingAvg.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({product.ratingCount} {product.ratingCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
            {product.soldCount > 0 && (
              <span className="text-muted-foreground">
                {product.soldCount} sold
              </span>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                &#x09F3;{product.finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  &#x09F3;{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600 font-medium">
                You save &#x09F3;{(product.price - product.finalPrice).toLocaleString()} ({product.discountPercent}%)
              </p>
            )}
          </div>

          <Separator />

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {product.variants.map((variant) => (
                <div key={variant.name} className="space-y-2">
                  <p className="text-sm font-medium">
                    {variant.name}:{" "}
                    <span className="text-muted-foreground">
                      {selectedVariants[variant.name] || "Select"}
                    </span>
                </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <Button
                        key={option}
                        variant={
                          selectedVariants[variant.name] === option
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variant.name]: option,
                          }))
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Availability:</span>
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-green-600">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3">
            <AddToCartButton
              productId={product._id}
              stock={product.stock}
              className="flex-1 h-11"
            />
          </div>

          <Separator />

          {/* Shipping Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>
                  {product.shipping?.freeShipping
                    ? "Free Shipping"
                    : `Shipping: &#x09F3;${product.shipping?.fee?.toLocaleString() || 0}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span>
                  {product.shipping?.returnable ? "Returnable" : "Non-returnable"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>
                  {product.shipping?.codAvailable ? "COD Available" : "Prepaid Only"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{product.location || "Bangladesh"}</span>
              </div>
            </div>
            {product.shipping?.handlingTimeDays && (
              <p className="text-sm text-muted-foreground">
                Handling time: {product.shipping.handlingTimeDays}{" "}
                {product.shipping.handlingTimeDays === 1 ? "day" : "days"}
              </p>
            )}
            {product.shipping?.warrantyText && (
              <p className="text-sm text-muted-foreground">
                Warranty: {product.shipping.warrantyText}
              </p>
            )}
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-xl font-bold">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
