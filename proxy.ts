import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

// Admin area is disabled for this deployment (no admin env vars configured).
// Restore the auth check below once ADMIN_USERNAME/ADMIN_PASSWORD_HASH/ADMIN_SESSION_SECRET are set.
const ADMIN_AREA_ENABLED = false;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!ADMIN_AREA_ENABLED) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isLoginPage = pathname === "/admin/login";
  const isAuthenticated = await isAdminRequest(request);

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginPage && !isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
