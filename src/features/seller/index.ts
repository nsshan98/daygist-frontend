// ===============================|| SELLER FEATURE EXPORTS ||============================== //

// Component exports
export { SellerApplicationDialog } from "./components/seller-application-dialog";
export { SellerDashboard } from "./components/seller-dashboard";
export { SellerProductList } from "./components/seller-product-list";
export { CreateProductDialog } from "./components/create-product-dialog";
export { EditProductDialog } from "./components/edit-product-dialog";

// Hook exports
export {
  useApplySeller,
  useSellerProfile,
  useGetSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
} from "./hooks/seller-query";

// Type re-exports
export type {
  SellerStatus,
  BusinessType,
  SellerImage,
  SellerProfile,
  SellerStats,
  SellerMeResponse,
  SellerApplicationPayload,
  SellerApplicationResponse,
} from "@/types/seller.types";

export type {
  ProductStatus,
  CreateProductPayload,
  UpdateProductPayload,
  SellerProductListResponse,
  SellerProductCreateResponse,
  SellerProductUpdateResponse,
  SellerProductDeleteResponse,
} from "@/types/product.types";
