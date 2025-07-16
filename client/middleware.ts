import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard"]; // The main dashboard
const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  // 2. Check for a token
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 3. Redirect logic
  // If the user is trying to access a protected route without a token,
  // redirect them to the login page.
  if (!token && protectedRoutes.includes(pathname)) {
    const absoluteURL = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // If the user is authenticated and tries to access a public route (like login),
  // redirect them to the dashboard.
  if (token && publicRoutes.includes(pathname)) {
    const absoluteURL = new URL("/dashboard", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
