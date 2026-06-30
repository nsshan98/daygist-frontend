"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Star, ShoppingCart } from "lucide-react";
import { MediaImage } from "@/features/profile/components/media-image";
import { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPercent > 0;

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer p-0 gap-0">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.thumbnail?.key ? (
          <MediaImage
            mediaKey={product.thumbnail.key}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            fallback={
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <ShoppingCart className="w-12 h-12" />
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none text-xs font-bold px-2 py-1">
            -{product.discountPercent}%
          </Badge>
        )}

        {/* Stock badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white border-none text-xs px-2 py-1">
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge className="absolute top-2 right-2 bg-gray-500 text-white border-none text-xs px-2 py-1">
            Out of stock
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 space-y-2">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Rating & Sold */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.ratingAvg > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
              {product.ratingCount > 0 && (
                <span>({product.ratingCount})</span>
              )}
            </div>
          )}
          {product.soldCount > 0 && (
            <span>{product.soldCount} sold</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              &#x09F3;{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-base font-bold text-primary">
            &#x09F3;{product.finalPrice.toLocaleString()}
          </span>
        </div>

        {/* Location */}
        {product.location && (
          <p className="text-xs text-muted-foreground">{product.location}</p>
        )}
      </CardContent>
    </Card>
  );
}
