import { axiosClient } from "@/lib/axios-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  UploadLongVideoPayload,
  UploadLongVideoResponse,
} from "@/types";

// ===============================|| UPLOAD LONG VIDEO ||============================== //

export const useUploadLongVideo = () => {
  const uploadLongVideoMutation = useMutation<
    UploadLongVideoResponse,
    Error,
    UploadLongVideoPayload
  >({
    mutationFn: async (payload: UploadLongVideoPayload) => {
      const formData = new FormData();
      
      formData.append("video", payload.video);
      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }
      if (payload.title) {
        formData.append("title", payload.title);
      }
      if (payload.description) {
        formData.append("description", payload.description);
      }
      if (payload.subCategory) {
        formData.append("subCategory", payload.subCategory);
      }

      const { data } = await axiosClient.post("/videos/video/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Long video uploaded successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload long video");
    },
  });

  return { uploadLongVideoMutation };
};
