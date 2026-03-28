import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define paths
  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/verify-user",
    "/auth/forget-password",
    "/auth/new-password",
  ];
  const protectedRoutes = ["/admin", "/dashboard", "/admin/onboarding"];

  // Check if the current path is a public or protected route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
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

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect authenticated users trying to access public routes
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
