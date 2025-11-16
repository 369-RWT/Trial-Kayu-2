import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { authRatelimit } from "@/lib/ratelimit";

const handler = NextAuth(authOptions);

/**
 * Wrapped NextAuth handler with rate limiting
 * Limits: 3 requests per minute (prevents brute force attacks)
 */
async function authHandlerWithRateLimit(
  req: NextRequest,
  context: any
): Promise<NextResponse | Response> {
  // Apply stricter rate limiting for auth endpoints
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "unknown";

  const { success, limit, remaining, reset } = await authRatelimit.limit(
    `auth:${identifier}`
  );

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: "Too many authentication attempts",
        message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
        limit,
        remaining: 0,
        resetAt: new Date(reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        },
      }
    );
  }

  // Pass to NextAuth handler
  return handler(req, context);
}

export { authHandlerWithRateLimit as GET, authHandlerWithRateLimit as POST };
