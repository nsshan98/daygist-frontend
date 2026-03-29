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

  if (response.ok) {
    const result = await response.json();

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
      error:
        response.status === 401
          ? "Google authentication failed!"
          : response.statusText,
    };
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
