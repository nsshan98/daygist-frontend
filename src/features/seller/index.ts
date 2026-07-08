// ===============================|| SELLER FEATURE EXPORTS ||============================== //

// Component exports
export { SellerApplicationDialog } from "./components/seller-application-dialog";
export { SellerDashboard } from "./components/seller-dashboard";
export { SellerProductList } from "./components/seller-product-list";
export { CreateProductDialog } from "./components/create-product-dialog";
export { EditProductDialog } from "./components/edit-product-dialog";
export { BoostProductDialog } from "./components/boost-product-dialog";
export { SellerOrderList } from "./components/seller-order-list";
export { SellerOrderDetail } from "./components/seller-order-detail";

// Hook exports
export {
  useApplySeller,
  useSellerProfile,
  useGetSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
  useGetBoostPricing,
  usePayFee,
} from "./hooks/seller-query";

export {
  useGetSellerOrders,
  useGetSellerOrder,
  useUpdateOrderStatus,
} from "./hooks/order-query";

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
  BoostPricingTier,
  BoostPricingResponse,
  PayFeePayload,
  PayFeeResponse,
} from "@/types/product.types";

export type {
  OrderStatus,
  SellerOrder,
  SellerOrderListResponse,
  SellerOrderDetailResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
} from "@/types/order.types";
