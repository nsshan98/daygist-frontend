import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/verify-user",
    "/auth/forget-password",
    "/auth/new-password",
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get session from cookie
  const session = req.cookies.get("session")?.value;

  let isAuthenticated = false;

  if (session) {
    try {
      await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
      });
      isAuthenticated = true;
    } catch (err) {
      console.error("Middleware: Failed to verify session", err);
    }
  }

  // If trying to access auth routes while authenticated, redirect to home
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If NOT authenticated and trying to access ANY non-public route, redirect to login
  // This makes ALL routes protected except /auth/*
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
