import { axiosClient } from "@/lib/axios-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ===============================|| GET USER PROFILE ||============================== //
const useGetUserProfile = () => {
  const showUserProfileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/users/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  return { showUserProfileQuery };
};

// ===============================|| UPDATE PROFILE ||============================== //
const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      username?: string;
      bio?: string | null;
      about?: string | null;
      birthDate?: string | null;
      country?: string | null;
      relationship?: string | null;
      address?: {
        fullAddress?: string | null;
        city?: string | null;
        state?: string | null;
        country?: string | null;
        zip?: string | null;
      };
      contact?: {
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        facebook?: string | null;
        instagram?: string | null;
        linkedin?: string | null;
      };
    }) => {
      return axiosClient.patch("/users/me", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
  return { updateProfileMutation };
};

// ===============================|| UPLOAD AVATAR ||============================== //
const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  const uploadAvatarMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return axiosClient.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
  return { uploadAvatarMutation };
};

// ===============================|| UPLOAD COVER PHOTO ||============================== //
const useUploadCover = () => {
  const queryClient = useQueryClient();
  
  const uploadCoverMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return axiosClient.post("/users/me/cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
  return { uploadCoverMutation };
};

export { useGetUserProfile, useUpdateProfile, useUploadAvatar, useUploadCover };
