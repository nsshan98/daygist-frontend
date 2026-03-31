import { axiosClient } from "@/lib/axios-client";
import { useMutation, useQuery } from "@tanstack/react-query";

// ===============================|| SIGN UP ||============================== //
const useSignupUser = () => {
  const signupUserMutation = useMutation({
    mutationFn: async (data: { full_name: string; email: string; phone_number: string; organization_name: string; password: string }) => {
      return axiosClient.post("/v1/signup/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { signupUserMutation };
};

// ===============================|| VERIFY OTP ||============================== //
const useVerifyUserOtp = () => {
  const verifyUserOtpMutation = useMutation({
    mutationFn: async (data: { email_or_phone: string; otp: string }) => {
      return axiosClient.post("/v1/verify-otp/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { verifyUserOtpMutation };
};

// ===============================|| RESEND OTP ||============================== //
const useResendOtp = () => {
  const resendOtpMutation = useMutation({
    mutationFn: async (data: { email_or_phone: string }) => {
      return axiosClient.post("/v1/resend-otp/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { resendOtpMutation };
};

// ===============================|| FORGET PASSWORD ||============================== //
const useForgetPassword = () => {
  const forgetPasswordMutation = useMutation({
    mutationFn: async (data: { email_or_phone: string }) => {
      return axiosClient.post("/v1/forget-password/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { forgetPasswordMutation };
};

// ===============================|| FORGET PASSWORD OTP ||============================== //
const useForgetPasswordOtp = () => {
  const forgetPasswordOtpMutation = useMutation({
    mutationFn: async (data: { email_or_phone: string, otp: string }) => {
      return axiosClient.post("/v1/password-forgot/otp-verify/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { forgetPasswordOtpMutation };
};

// ===============================|| SET NEW PASSWORD ||============================== //
const useSetNewPassword = () => {
  const setNewPasswordMutation = useMutation({
    mutationFn: async (data: { user_id: string, token_id: string, password: string }) => {
      return axiosClient.post("/v1/password-forgot/new-password-set/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { setNewPasswordMutation };
};

// ===============================|| GOOGLE LOGIN ||============================== //
const useGoogleLogin = () => {
  const googleLoginMutation = useMutation({
    mutationFn: async (data: { idToken: string }) => {
      return axiosClient.post("/users/google", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
  return { googleLoginMutation };
};

// ===============================|| USER PROFILE ||============================== //
const useShowUserProfile = () => {
  const showUserProfileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/users/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });
  return { showUserProfileQuery };
};

export { useSignupUser, useVerifyUserOtp, useResendOtp, useForgetPassword, useForgetPasswordOtp, useSetNewPassword, useGoogleLogin, useShowUserProfile };
