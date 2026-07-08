import { axiosClient } from "@/lib/api/axios-client";
import {
  SellerApplicationPayload,
  SellerMeResponse,
  SellerApplicationResponse,
} from "@/types/seller.types";
import {
  CreateProductPayload,
  UpdateProductPayload,
  SellerProductListResponse,
  SellerProductCreateResponse,
  SellerProductUpdateResponse,
  SellerProductDeleteResponse,
  ProductStatus,
  BoostPricingResponse,
  PayFeePayload,
  PayFeeResponse,
} from "@/types/product.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ===============================|| SELLER APPLICATION ||============================== //

const useApplySeller = () => {
  const queryClient = useQueryClient();

  const applySellerMutation = useMutation({
    mutationFn: async (data: SellerApplicationPayload): Promise<SellerApplicationResponse> => {
      const { data: response } = await axiosClient.post("/e-commerce/seller/request", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Seller application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to submit seller application";
      toast.error(message);
    },
  });

  return { applySellerMutation };
};

// ===============================|| SELLER PROFILE & DASHBOARD ||============================== //

const useSellerProfile = () => {
  const sellerProfileQuery = useQuery({
    queryKey: ["seller-profile"],
    queryFn: async (): Promise<SellerMeResponse> => {
      const { data } = await axiosClient.get("/e-commerce/seller/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return sellerProfileQuery;
};

// ===============================|| SELLER PRODUCTS ||============================== //

const useGetSellerProducts = (status?: ProductStatus | "all", page = 1, limit = 20) => {
  const sellerProductsQuery = useQuery({
    queryKey: ["seller-products", status, page, limit],
    queryFn: async (): Promise<SellerProductListResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status && status !== "all") params.set("status", status);
      const { data } = await axiosClient.get(`/e-commerce/seller/products?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return sellerProductsQuery;
};

const useCreateSellerProduct = () => {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductPayload): Promise<SellerProductCreateResponse> => {
      const { data: response } = await axiosClient.post("/e-commerce/seller/products", data, {
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to create product";
      toast.error(message);
    },
  });

  return { createProductMutation };
};

const useUpdateSellerProduct = () => {
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductPayload;
    }): Promise<SellerProductUpdateResponse> => {
      const { data: response } = await axiosClient.patch(`/e-commerce/seller/products/${id}`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to update product";
      toast.error(message);
    },
  });

  return { updateProductMutation };
};

const useDeleteSellerProduct = () => {
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string): Promise<SellerProductDeleteResponse> => {
      const { data } = await axiosClient.delete(`/e-commerce/seller/products/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to delete product";
      toast.error(message);
    },
  });

  return { deleteProductMutation };
};

// ===============================|| BOOST PRICING ||============================== //

const useGetBoostPricing = () => {
  const boostPricingQuery = useQuery({
    queryKey: ["boost-pricing"],
    queryFn: async (): Promise<BoostPricingResponse> => {
      const { data } = await axiosClient.get("/boost-pricing");
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return boostPricingQuery;
};

// ===============================|| PAY FEE ||============================== //

const usePayFee = () => {
  const queryClient = useQueryClient();

  const payFeeMutation = useMutation({
    mutationFn: async ({
      productId,
      payload,
    }: {
      productId: string;
      payload: PayFeePayload;
    }): Promise<PayFeeResponse> => {
      const { data: response } = await axiosClient.post(
        `/e-commerce/pay-fee/${productId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Payment successful!");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Payment failed";
      toast.error(message);
    },
  });

  return { payFeeMutation };
};

// ===============================|| SELLER HOOKS EXPORT ||============================== //

export {
  useApplySeller,
  useSellerProfile,
  useGetSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
  useGetBoostPricing,
  usePayFee,
};
