// ===============================|| PRODUCT TYPES ||============================== //

export interface ProductImage {
  key: string;
  url: string;
  provider: string;
  type: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductShippingZone {
  name: string;
  districts: string[];
  fee: number;
  etaMinDays: number;
  etaMaxDays: number;
}

export interface ProductShipping {
  freeShipping: boolean;
  feeType: string;
  fee: number;
  zones: ProductShippingZone[];
  handlingTimeDays: number;
  codAvailable: boolean;
  returnable: boolean;
  warrantyText: string;
}

export interface Product {
  _id: string;
  sellerId: string;
  shopId: string | null;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryPath: string[];
  brand: string;
  location: string;
  country: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  status: string;
  images: ProductImage[];
  thumbnail: ProductImage;
  variants: ProductVariant[];
  shipping: ProductShipping;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  orderCount: number;
  viewsCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  isBoosted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  items: Product[];
}

export interface ProductSectionResponse {
  success: boolean;
  data: Product[];
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface ProductByIdsPayload {
  ids: string[];
}

export interface ProductByIdsResponse {
  success: boolean;
  data: Product[];
  count: number;
}

export interface ProductRelatedResponse {
  success: boolean;
  data: Product[];
  meta: {
    limit: number;
    count: number;
  };
}

export type ProductSort = "relevance" | "newest" | "price_low" | "price_high" | "top_rated";

export interface ProductFilters {
  q: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: ProductSort;
  page: number;
  limit: number;
}

// ===============================|| SELLER PRODUCT TYPES ||============================== //

export type ProductStatus = "draft" | "active" | "out_of_stock" | "pending" | "blocked";

export interface CreateProductPayload {
  title: string;
  description?: string;
  price: number;
  discountPercent?: number;
  stock?: number;
  status?: "draft" | "active";
  categoryId: string;
  categoryPath: string[];
  brand?: string;
  location?: string;
  country?: string;
  images: ProductImage[];
  thumbnail?: ProductImage;
  variants?: ProductVariant[];
  shopId?: string;
  shipping?: ProductShipping;
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  discountPercent?: number;
  stock?: number;
  status?: ProductStatus;
  brand?: string;
  location?: string;
  country?: string;
  images?: ProductImage[];
  thumbnail?: ProductImage;
  variants?: ProductVariant[];
  shipping?: ProductShipping;
}

export interface SellerProductListResponse {
  success: boolean;
  items: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SellerProductCreateResponse {
  success: boolean;
  data: Product;
  message: string;
}

export interface SellerProductUpdateResponse {
  success: boolean;
  data: Product;
}

export interface SellerProductDeleteResponse {
  success: boolean;
  message: string;
}

// ===============================|| BOOST PRICING TYPES ||============================== //

export interface BoostPricingTier {
  _id: string;
  tier: "basic" | "regular" | "pro";
  defaultDays: number;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoostPricingResponse {
  success: boolean;
  data: BoostPricingTier[];
}

// ===============================|| PAY FEE TYPES ||============================== //

export interface PayFeePayload {
  feeType: "upload" | "boost";
  uploadFeeCost?: number;
  tier?: "basic" | "regular" | "pro";
}

export interface PayFeeResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    feeType: "upload" | "boost";
    cost: number;
    boost: {
      tier: string;
      days: number;
      startAt: string;
      endAt: string;
    } | null;
    uploadFeePaid: boolean;
    status: string;
  };
}
