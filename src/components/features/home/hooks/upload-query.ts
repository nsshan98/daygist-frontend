import { axiosClient } from "@/lib/axios-client";
import { useMutation } from "@tanstack/react-query";

export interface UploadResponse {
  url: string;
  key: string;
  provider: string;
}

// ===============================|| UPLOAD IMAGE ||============================== //
export const useUploadImage = () => {
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosClient.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
  });

  return { uploadImageMutation };
};

// ===============================|| UPLOAD VIDEO ||============================== //
export const useUploadVideo = () => {
  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosClient.post("/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
  });

  return { uploadVideoMutation };
};

// ===============================|| UPLOAD MULTIPLE IMAGES ||============================== //
export const useUploadMultipleImages = () => {
  const uploadMultipleImagesMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadResponse[]> => {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axiosClient.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return data as UploadResponse;
      });

      return Promise.all(uploadPromises);
    },
  });

  return { uploadMultipleImagesMutation };
};
