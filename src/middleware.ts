import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMIT_CONFIG, startAutoPrune } from '@/lib/rate-limit';

// Initialize automatic pruning on module load
startAutoPrune();

/**
 * Extract client IP from request headers.
 * Prioritize x-forwarded-for (behind CDN), then x-real-ip, then connection address.
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated; take the first (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Map request route to rate limit bucket and config.
 */
function getBucketAndConfig(
  pathname: string,
): { bucket: string; config: typeof RATE_LIMIT_CONFIG[keyof typeof RATE_LIMIT_CONFIG] } {
  // /api/auth/* → AUTH (register, rotate-key)
  if (pathname.startsWith('/api/auth/')) {
    return { bucket: 'AUTH', config: RATE_LIMIT_CONFIG.AUTH };
  }

  // /api/observations → OBSERVATION (high frequency)
  if (pathname === '/api/observations') {
    return { bucket: 'OBSERVATION', config: RATE_LIMIT_CONFIG.OBSERVATION };
  }

  // /api/nodes/*/heartbeat → OBSERVATION (high frequency from daemons)
  if (pathname.match(/^\/api\/nodes\/[^/]+\/heartbeat$/)) {
    return { bucket: 'OBSERVATION', config: RATE_LIMIT_CONFIG.OBSERVATION };
  }

  // /api/nodes/register → AUTH (controlled, user-initiated)
  if (pathname === '/api/nodes/register') {
    return { bucket: 'AUTH', config: RATE_LIMIT_CONFIG.AUTH };
  }

  // Read-only endpoints
  // /api/stats, /api/rewards/mine, /api/nodes/mine, /api/mcp, GET /api/nodes/[nodeId]
  if (
    pathname === '/api/stats' ||
    pathname === '/api/rewards/mine' ||
    pathname === '/api/nodes/mine' ||
    pathname === '/api/mcp' ||
    pathname.match(/^\/api\/nodes\/[^/]+$/)
  ) {
    return { bucket: 'READ', config: RATE_LIMIT_CONFIG.READ };
  }

  // Default: everything else /api/* → WRITE
  return { bucket: 'WRITE', config: RATE_LIMIT_CONFIG.WRITE };
}

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to /api/* routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  const { bucket, config } = getBucketAndConfig(request.nextUrl.pathname);

  const result = rateLimit(clientIp, bucket, config);

  // If rate limit exceeded, return 429 with retry information
  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil(result.resetMs / 1000);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + result.resetMs).toISOString(),
        },
      },
    );
  }

  // Request allowed; proceed with response and add rate limit headers
  const response = NextResponse.next();

  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    new Date(Date.now() + result.resetMs).toISOString(),
  );

  return response;
}

// Configure matcher for /api/* routes
export const config = {
  matcher: '/api/:path*',
};
