import { useMemo } from "react";
import { MEDIA_BASE_URL } from "@/lib/constants";
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

// ===============================|| GET SIGNED URL ||============================== //
// CURRENT APPROACH: Direct URL construction from key + MEDIA_BASE_URL
// Old signed URL API approach is preserved below (commented out)
const useGetSignedUrl = () => {
  const useSignedUrl = (key: string | null | undefined) => {
    const url = useMemo(() => {
      if (!key) return null;
      if (key.startsWith("http")) return key;
      return `${MEDIA_BASE_URL}/${key.replace(/^\//, "")}`;
    }, [key]);

    return { data: url, isLoading: false };
  };

  const prefetchSignedUrl = (_key: string) => {
    // No-op: URL construction is synchronous, nothing to prefetch
  };

  const getCachedSignedUrl = (key: string) => {
    if (!key) return null;
    return `${MEDIA_BASE_URL}/${key.replace(/^\//, "")}`;
  };

  return { useSignedUrl, prefetchSignedUrl, getCachedSignedUrl };
};

// =====================================================================================
// OLD APPROACH: Signed URLs via API
// Uncomment the block below and comment the implementation above to restore
// =====================================================================================
// interface SignedUrlResponse {
//   ok: boolean;
//   url: string;
// }
//
// const useGetSignedUrl = () => {
//   const queryClient = useQueryClient();
//
//   const useSignedUrl = (key: string | null | undefined) => {
//     return useQuery({
//       queryKey: ["signed-url", key],
//       queryFn: async () => {
//         if (!key) return null;
//         const encodedKey = encodeURIComponent(key);
//         const { data } = await axiosClient.get<SignedUrlResponse>(`/upload/signed?key=${encodedKey}`);
//         return data.url;
//       },
//       enabled: !!key,
//       staleTime: 1000 * 60 * 50,
//       gcTime: 1000 * 60 * 55,
//     });
//   };
//
//   const prefetchSignedUrl = async (key: string) => {
//     await queryClient.prefetchQuery({
//       queryKey: ["signed-url", key],
//       queryFn: async () => {
//         const encodedKey = encodeURIComponent(key);
//         const { data } = await axiosClient.get<SignedUrlResponse>(`/upload/signed?key=${encodedKey}`);
//         return data.url;
//       },
//       staleTime: 1000 * 60 * 50,
//     });
//   };
//
//   const getCachedSignedUrl = (key: string) => {
//     return queryClient.getQueryData<string>(["signed-url", key]);
//   };
//
//   return { useSignedUrl, prefetchSignedUrl, getCachedSignedUrl };
// };

// ===============================|| GET USER PROFILE BY ID ||============================== //
const useGetUserProfileById = (userId: string) => {
  const showUserProfileByIdQuery = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  return { showUserProfileByIdQuery };
};

// ===============================|| GET USER PROFILE BY USERNAME ||============================== //
const useGetUserProfileByUsername = (username: string) => {
  const showUserProfileByUsernameQuery = useQuery({
    queryKey: ["user-profile", "username", username],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/users/username/${username}`);
      return data;
    },
    enabled: !!username,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  return { showUserProfileByUsernameQuery };
};

export { useGetUserProfile, useUpdateProfile, useUploadAvatar, useUploadCover, useGetSignedUrl, useGetUserProfileById, useGetUserProfileByUsername };
