import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api"];
const ADMIN_ONLY_PATHS = ["/settings", "/users", "/audit-log", "/suppliers"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionToken = request.cookies.get("warung_venty_session")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode session to check role (lightweight check — full verification happens server-side)
  try {
    const [data] = sessionToken.split(".");
    if (!data) throw new Error("Invalid token");

    const payload = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const role = payload.role;

    // Root path redirect
    if (pathname === "/") {
      if (role === "KASIR") {
        return NextResponse.redirect(new URL("/pos", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // RBAC: Block KASIR from admin-only paths
    if (role === "KASIR" && ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
      if (role === "KASIR" && pathname.startsWith("/dashboard")) {
        // Kasir can't access dashboard, redirect to POS
        return NextResponse.redirect(new URL("/pos", request.url));
      }
      return NextResponse.redirect(new URL("/pos", request.url));
    }

    // Kasir trying to access dashboard
    if (role === "KASIR" && pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/pos", request.url));
    }
  } catch {
    // Invalid token, redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("warung_venty_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
