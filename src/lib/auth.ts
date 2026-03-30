"use server";

import { redirect } from "next/navigation";

import { createSession, updateTokens } from "./session";
import { FormState, loginSchema } from "@/zod/auth-schema";


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
    redirect("/admin");
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

      await createSession({
        user: {
          id: String(responseBody.user_info?.user_id),
          name: responseBody.user_info?.full_name || "User",
        },
        accessToken: responseBody.access_token,
        refreshToken: responseBody.refresh_token,
      });
      redirect("/admin");
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
