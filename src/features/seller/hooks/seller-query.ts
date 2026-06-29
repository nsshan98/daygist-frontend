import { axiosClient } from "@/lib/api/axios-client";
import { SellerApplicationPayload, SellerMeResponse, SellerApplicationResponse } from "@/types/seller.types";
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return sellerProfileQuery;
};

// ===============================|| SELLER HOOKS EXPORT ||============================== //

export { useApplySeller, useSellerProfile };
