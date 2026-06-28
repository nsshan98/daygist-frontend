import { axiosClient } from "@/lib/api/axios-client";
import { SellerApplicationSchemaType } from "@/schema/seller-schema";
import { useMutation, useQuery } from "@tanstack/react-query";

// ===============================|| SELLER APPLICATION ||============================== //

const useApplySeller = () => {
  const applySellerMutation = useMutation({
    mutationFn: async (data: SellerApplicationSchemaType) => {
      return axiosClient.post("/e-commerce/seller/request", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (response) => {
      console.log("Seller application submitted successfully:", response.data);
    },
    onError: (error) => {
      console.error("Seller application error:", error);
    },
  });
  return { applySellerMutation };
};

// ===============================|| SELLER PROFILE & DASHBOARD ||============================== //

const useSellerProfile = () => {
  const sellerProfileQuery = useQuery({
    queryKey: ["seller-profile"],
    queryFn: async () => {
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