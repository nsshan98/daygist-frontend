// ===============================|| MONETIZATION TYPES ||============================== //
// All monetization-related types: models, API requests, and API responses

export interface MonetizationUser {
  isMonetization: boolean;
  monetizationStatus: "none" | "pending" | "approved" | "rejected";
}

export interface MonetizationWallet {
  available: number;
  pending: number;
  totalEarned: number;
}

export interface MonetizationApp {
  _id: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface MonetizationData {
  user: MonetizationUser;
  wallet: MonetizationWallet;
  lastWithdraw: string | null;
  app: MonetizationApp | null;
}

export interface MonetizationResponse {
  ok: boolean;
  data: MonetizationData;
}

export interface ApplyMonetizationPayload {
  fullAddress: {
    country: string;
    city: string;
    area: string;
    postalCode: string;
  };
  nidFront: File;
  nidBack: File;
}

export interface ApplyMonetizationResponse {
  ok: boolean;
  message: string;
  data?: {
    app: MonetizationApp;
  };
}
