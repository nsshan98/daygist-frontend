"use server";

import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function logout() {
  // Delete the session cookie (clears local data)
  await deleteSession();
  
  // Redirect to login page
  redirect("/auth/login");
}
