import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================================================================
  // PHASE 3.1: HTTPS Enforcement
  // =========================================================================
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get("host")}${pathname}`,
      301
    );
  }

  // =========================================================================
  // PHASE 3.4: CORS Headers
  // =========================================================================
  const response = NextResponse.next();

  // Only allow same-origin by default
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // =========================================================================
  // Security Headers
  // =========================================================================
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // =========================================================================
  // PHASE 1.3 & 3.2: Authentication & Authorization
  // =========================================================================

  // Protected API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Role-based access control
    if (pathname.startsWith("/api/inventory/") && request.method === "POST") {
      // Only OPERATOR and above can create inventory
      if (!["OPERATOR", "MANAGER", "ADMIN"].includes(token.role as string)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    if (pathname.startsWith("/api/master/")) {
      // Only ADMIN can modify master data
      if (token.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    // Add user info to request headers for API routes
    response.headers.set("X-User-Id", token.id as string);
    response.headers.set("X-User-Role", token.role as string);
  }

  // Protected page routes
  if (
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/production") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/master")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Master data pages require ADMIN
    if (pathname.startsWith("/master") && token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
