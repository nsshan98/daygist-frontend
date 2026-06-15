"use server";

import { redirect } from "next/navigation";

import { createSession, updateTokens } from "./session";
import { FormState, loginSchema } from "@/schema/auth-schema";


export async function signIn(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = loginSchema.safeParse({
    phone_or_email: formData.get("phone_or_email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const response = await fetch(
    `${process.env.API_SERVER_BASE_URL}/v1/login/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedFields.data),
    }
  );

  if (response.ok) {
    const result = await response.json();
    // TODO: Create The Session For Authenticated User.

    console.log(result);

    await createSession({
      user: {
        id: String(result.user_info?.user_id),
        name: result.user_info?.full_name || "User",
      },
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    });
    redirect("/");
  } else {
    return {
      message:
        response.status === 401 ? "Invalid Credentials!" : response.statusText,
    };
  }
}

export async function googleSignIn(idToken: string): Promise<{ error?: string }> {
  try {
    console.log("Google Sign-In: Sending request to backend...");
    console.log("API URL:", `${process.env.API_SERVER_BASE_URL}/users/google`);
    
    const response = await fetch(
      `${process.env.API_SERVER_BASE_URL}/users/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      }
    );

    console.log("Google Sign-In Response Status:", response.status);
    const responseBody = await response.json();
    console.log("Google Sign-In Response Body:", responseBody);

    if (response.ok) {
      console.log("Google sign-in successful, creating session...");

      // Handle both response formats:
      // New format: { token, user }
      // Old format: { access_token, refresh_token, user_info }
      const accessToken = responseBody.token || responseBody.access_token;
      const refreshToken = responseBody.refresh_token || ""; // Empty string if not provided
      
      // Extract user info from both formats
      const userInfo = responseBody.user || responseBody.user_info || {};
      const userId = userInfo._id || userInfo.user_id || "unknown";
      const userName = userInfo.name || userInfo.full_name || "User";

      await createSession({
        user: {
          id: String(userId),
          name: userName,
        },
        accessToken,
        refreshToken,
      });
      redirect("/");
    } else {
      console.error("Google sign-in failed with status:", response.status, responseBody);
      
      let errorMessage = "Google sign-in failed. Please try again.";
      
      if (response.status === 401) {
        errorMessage = "Invalid Google credentials. Please try again.";
      } else if (response.status === 403) {
        errorMessage = responseBody.message || "Access forbidden. This Google account may not be authorized.";
      } else if (response.status === 404) {
        errorMessage = "Google authentication endpoint not found.";
      } else {
        errorMessage = responseBody.message || `Server error: ${response.statusText}`;
      }
      
      return { error: errorMessage };
    }
  } catch (error) {
    // Next.js redirect() works by throwing a special NEXT_REDIRECT error.
    // We must re-throw it so the framework can process the redirect correctly.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Google sign-in error:", error);
    return { error: "Network error. Please check your connection and try again." };
  }
}

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const url = `${process.env.API_SERVER_BASE_URL}/v1/refresh-token/`;
    console.log("Refreshing token at:", url);

    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: oldRefreshToken,
        }),
      }
    );

    console.log("Success Refresh Token API Hit");

    const { access: accessToken, refresh: refreshToken } = await response.json();
    // update session with new tokens
    await updateTokens({
      accessToken,
      refreshToken,
    });

    return accessToken;
  } catch (err) {
    console.error("Refresh Token failed:", err);
    return null;
  }
};
