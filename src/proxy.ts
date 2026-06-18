import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Ratelimit only if credentials exist
const ratelimit = (redisUrl && redisToken) ? new Ratelimit({
  redis: new Redis({
    url: redisUrl,
    token: redisToken,
  }),
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
}) : null;

export async function proxy(req: NextRequest) {
  // Rate limiting logic
  if (ratelimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
      
      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        });
      }
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Fail open if Redis is down
    }
  }

  // Authentication logic
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  
  if (!token && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/") {
    // Return 401 for API routes instead of redirecting
    if (req.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.jpg).*)",
  ],
};
