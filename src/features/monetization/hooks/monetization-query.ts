import { axiosClient } from "@/lib/api/axios-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  MonetizationResponse,
  ApplyMonetizationPayload,
  ApplyMonetizationResponse,
  ManageTransactionPayload,
  ManageTransactionResponse,
} from "@/types";

// ===============================|| GET MONETIZATION STATUS ||============================== //

export const useGetMonetizationStatus = () => {
  const monetizationQuery = useQuery<MonetizationResponse>({
    queryKey: ["monetization", "me"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/monetization/me");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { monetizationQuery };
};

// ===============================|| APPLY FOR MONETIZATION ||============================== //

export const useApplyMonetization = () => {
  const queryClient = useQueryClient();

  const applyMonetizationMutation = useMutation<
    ApplyMonetizationResponse,
    Error,
    ApplyMonetizationPayload
  >({
    mutationFn: async (payload: ApplyMonetizationPayload) => {
      const formData = new FormData();
      
      // Append address as JSON string
      formData.append("fullAddress", JSON.stringify(payload.fullAddress));
      
      // Append NID images
      formData.append("nidFront", payload.nidFront);
      formData.append("nidBack", payload.nidBack);

      const { data } = await axiosClient.post("/monetization/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Monetization application submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["monetization", "me"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to apply for monetization");
    },
  });

  return { applyMonetizationMutation };
};

// ===============================|| MANAGE TRANSACTION ||============================== //

export const useManageTransaction = () => {
  const queryClient = useQueryClient();

  const manageTransactionMutation = useMutation<
    ManageTransactionResponse,
    Error,
    ManageTransactionPayload
  >({
    mutationFn: async (payload: ManageTransactionPayload) => {
      const { data } = await axiosClient.post("/transaction/manage", payload);
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Transaction successful");
      queryClient.invalidateQueries({ queryKey: ["monetization", "me"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Transaction failed");
    },
  });

  return { manageTransactionMutation };
};
