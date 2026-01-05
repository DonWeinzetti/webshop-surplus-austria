import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ✅ RSC requests IMMER durchlassen
  if (searchParams.has("_rsc")) {
    return NextResponse.next();
  }

  // ✅ Next internals nie anfassen
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Nur Admin schützen
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Login offen
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const secret = req.cookies.get("admin_secret")?.value;

  if (secret !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
