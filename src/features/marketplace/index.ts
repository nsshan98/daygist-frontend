// ===============================|| MARKETPLACE FEATURE EXPORTS ||============================== //

// Component exports
export { ProductCard } from "./components/product-card";
export { MarketplaceContent } from "./components/marketplace-content";
export { AddToCartButton } from "./components/add-to-cart-button";
export { FloatingCart } from "./components/floating-cart";
export { ProductDetail } from "./components/product-detail";

// Hook exports
export {
  useGetProducts,
  useGetFeaturedProducts,
  useGetTopSellingProducts,
  useGetNewArrivals,
  useGetProduct,
  useGetRelatedProducts,
} from "./hooks/product-query";

export {
  useGetCart,
  useCartMutations,
} from "./hooks/cart-query";

// Store exports
export { useCartStore } from "./stores/cart-store";

// Type re-exports
export type {
  Product,
  ProductImage,
  ProductVariant,
  ProductShipping,
  ProductListResponse,
  ProductSectionResponse,
  ProductDetailResponse,
  ProductRelatedResponse,
  ProductFilters,
  ProductSort,
} from "@/types/product.types";

export type {
  CartItem,
  CartSeller,
  CartResponse,
  AddToCartPayload,
  UpdateCartQtyPayload,
} from "@/types/cart.types";
