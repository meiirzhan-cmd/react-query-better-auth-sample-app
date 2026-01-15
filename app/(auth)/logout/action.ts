"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  // Better Auth's signOut will automatically clear the session cookie
  // thanks to the nextCookies plugin
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/login");
}
