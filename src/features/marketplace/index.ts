// ===============================|| MARKETPLACE FEATURE EXPORTS ||============================== //

// Component exports
export { ProductCard } from "./components/product-card";
export { MarketplaceContent } from "./components/marketplace-content";

// Hook exports
export {
  useGetProducts,
  useGetFeaturedProducts,
  useGetTopSellingProducts,
  useGetNewArrivals,
  useGetProduct,
  useGetRelatedProducts,
} from "./hooks/product-query";

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
