// Axios client configuration
// import { doUserLogOut } from "@/actions/auth";
import axios from "axios";
import { deleteSession, getSession } from "./session";
import { refreshToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_CLIENT_BASE_URL;

const axiosClient = axios.create({
  baseURL: baseURL,
});

const getAccessToken = async () => {
  const session = await getSession();
  return session?.accessToken;
};

axiosClient.interceptors.request.use(async (request) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  return request;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(`error`, error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        if (session?.refreshToken) {
          const newAccessToken = await refreshToken(session.refreshToken);
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If refresh fails or no session, logout
      /* @ts-ignore */
      if (typeof window !== "undefined") {
        await deleteSession(); // explicit clear of session
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export { axiosClient };
