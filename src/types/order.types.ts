// ===============================|| ORDER TYPES ||============================== //

import { ProductImage } from "./product.types";

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "Cash one delivery" | "BKASH";

export interface OrderAddress {
  name: string;
  phone: string;
  address: string;
}

export interface OrderUser {
  _id: string;
  name: string;
  username: string;
  profilePic: string;
  regNumber: string;
  phone?: string;
}

export interface OrderProduct {
  _id: string;
  title: string;
  thumbnail: ProductImage;
  finalPrice: number;
  price: number;
  discountPercent: number;
}

export interface OrderItem {
  productId: string;
  qty: number;
  price: number;
  variant: string;
  product?: OrderProduct;
}

// ===============================|| BUYER ORDER TYPES ||============================== //

export interface PlaceOrderItem {
  productId: string;
  qty: number;
  variant?: string;
}

export interface PlaceOrderPayload {
  items: PlaceOrderItem[];
  address: OrderAddress;
  paymentMethod?: PaymentMethod;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    userId: string;
    sellerId: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    address: OrderAddress;
    paymentMethod: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BuyerOrder {
  _id: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: OrderAddress;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerOrderListResponse {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  orders: BuyerOrder[];
}

export type BuyerOrderDetailResponse = BuyerOrder;

// ===============================|| SELLER ORDER TYPES ||============================== //

export interface SellerOrder {
  _id: string;
  userId: OrderUser;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: OrderAddress;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderListResponse {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  orders: SellerOrder[];
}

export type SellerOrderDetailResponse = SellerOrder;

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  orderId: string;
  status: OrderStatus;
}
