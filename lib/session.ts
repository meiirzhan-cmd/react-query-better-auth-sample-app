import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current user session on the server
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Get session with cache disabled - forces database lookup
 * Use this for sensitive operations where you need the freshest data
 */
export async function getSessionFresh() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache: true,
    },
  });

  return session;
}
