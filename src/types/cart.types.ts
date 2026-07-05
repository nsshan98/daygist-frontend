// ===============================|| CART TYPES ||============================== //

import { Product } from "./product.types";

export interface CartSeller {
  sellerId: string;
  name: string;
  avatar: { url: string; key: string };
  shopId: string;
  shopName: string;
  shopLogo: { key: string; url: string };
  ratingAvg: number;
  ratingCount: number;
}

export interface CartItem {
  productId: string;
  qty: number;
  product: Product;
  seller: CartSeller;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface AddToCartPayload {
  productId: string;
  qty: number;
}

export interface AddToCartResponse {
  _id: string;
  userId: string;
  items: { productId: string; sellerId: string; qty: number; _id: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface RemoveFromCartResponse {
  success: boolean;
  message: string;
  data: { items: { productId: string; sellerId: string; qty: number; _id: string }[] };
}

export interface UpdateCartQtyPayload {
  productId: string;
  type: "inc" | "dec" | "set" | "remove";
  qty?: number;
  variant?: string;
}

export interface UpdateCartQtyResponse {
  success: boolean;
  message: string;
  data: { items: { productId: string; sellerId: string; qty: number; _id: string }[] };
}
