// ===============================|| SELLER TYPES ||============================== //

export type SellerStatus = "pending" | "approved" | "rejected";

export type BusinessType = "individual" | "business";

export interface SellerImage {
  key: string;
  url: string;
  provider?: string;
}

export interface SellerProfile {
  _id: string;
  userId: string;
  shopName: string;
  phone: string;
  address: string;
  district: string;
  businessType: BusinessType;
  nidNumber?: string;
  nidFrontImage?: SellerImage;
  nidBackImage?: SellerImage;
  tradeLicense?: string;
  logo?: SellerImage;
  banner?: SellerImage;
  description?: string;
  acceptedTerms: boolean;
  status: SellerStatus;
  reason?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStats {
  productCount: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  walletBalance: number;
}

export interface SellerMeResponse {
  success: boolean;
  data: SellerProfile | null;
  status: SellerStats;
  message?: string;
}

export interface SellerApplicationPayload {
  shopName: string;
  phone: string;
  address: string;
  district: string;
  businessType: BusinessType;
  nidNumber?: string;
  nidFrontImage?: SellerImage;
  nidBackImage?: SellerImage;
  tradeLicense?: string;
  logo?: SellerImage;
  banner?: SellerImage;
  description?: string;
  acceptedTerms: boolean;
}

export interface SellerApplicationResponse {
  success: boolean;
  data: SellerProfile;
  message: string;
}
