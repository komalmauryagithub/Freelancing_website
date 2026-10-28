import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("vanguard_session");

  // Protected paths check
  const isPortalPath = pathname.startsWith("/portal");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminPath = pathname.startsWith("/admin") && !isAdminLogin;

  if (isAdminPath) {
    if (!sessionCookie || !sessionCookie.value) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  if (isPortalPath) {
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting auth pages, allow page server component to handle redirect or pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
  ],
};
