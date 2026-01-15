import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes accessible only to non-authenticated users
const authRoutes = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie existence (fast, no DB call)
  // Note: This only checks if a cookie exists, not if it's valid
  // Actual session validation should happen on the server for protected actions
  const sessionCookie = getSessionCookie(request);

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, api, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
