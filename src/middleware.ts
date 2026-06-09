import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { rateLimit, RATE_LIMIT_CONFIG, startAutoPrune } from '@/lib/rate-limit';

// Initialize automatic pruning on module load
startAutoPrune();

const COOKIE_NAME = 'azimuth_session';

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Extract client IP from request headers.
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Map request route to rate limit bucket and config.
 */
function getBucketAndConfig(
  pathname: string,
): { bucket: string; config: typeof RATE_LIMIT_CONFIG[keyof typeof RATE_LIMIT_CONFIG] } {
  // /api/version → READ (public, no auth)
  if (pathname === '/api/version') {
    return { bucket: 'READ', config: RATE_LIMIT_CONFIG.READ };
  }

  // /api/auth/web/me → READ (frequent check from Navbar/dashboard, not a write op)
  if (pathname === '/api/auth/web/me') {
    return { bucket: 'READ', config: RATE_LIMIT_CONFIG.READ };
  }

  // /api/auth/* → AUTH (register, rotate-key, login, etc.)
  if (pathname.startsWith('/api/auth/')) {
    return { bucket: 'AUTH', config: RATE_LIMIT_CONFIG.AUTH };
  }

  // /api/observations → OBSERVATION (high frequency)
  if (pathname === '/api/observations') {
    return { bucket: 'OBSERVATION', config: RATE_LIMIT_CONFIG.OBSERVATION };
  }

  // /api/rtk-providers → WRITE bucket (covers both GET and POST, more restrictive)
  if (pathname === '/api/rtk-providers') {
    return { bucket: 'WRITE', config: RATE_LIMIT_CONFIG.WRITE };
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
  if (
    pathname === '/api/stats' ||
    pathname === '/api/rewards/mine' ||
    pathname === '/api/nodes/mine' ||
    pathname === '/api/points/mine' ||
    pathname === '/api/referral/mine' ||
    pathname === '/api/leaderboard' ||
    pathname === '/api/mcp' ||
    pathname.match(/^\/api\/nodes\/[^/]+$/)
  ) {
    return { bucket: 'READ', config: RATE_LIMIT_CONFIG.READ };
  }

  // Default: everything else /api/* → WRITE
  return { bucket: 'WRITE', config: RATE_LIMIT_CONFIG.WRITE };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Auth gating for /dashboard/* ───
  if (pathname.startsWith('/dashboard')) {
    const secret = getJwtSecret();
    if (!secret) {
      // JWT not configured — let through (degraded mode)
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    }

    try {
      await jwtVerify(token, secret);
    } catch {
      // Invalid or expired token — clear cookie and redirect
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    }

    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  // ─── Redirect logged-in users away from /login ───
  if (pathname === '/login') {
    const secret = getJwtSecret();
    if (secret) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, secret);
          const res = NextResponse.redirect(new URL('/dashboard', request.url));
          res.headers.set('Cache-Control', 'private, no-store');
          return res;
        } catch {
          // Invalid token — let them see login page
        }
      }
    }
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  // ─── Rate limiting for /api/* ───
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  const { bucket, config } = getBucketAndConfig(pathname);

  const result = rateLimit(clientIp, bucket, config);

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

  const response = NextResponse.next();

  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    new Date(Date.now() + result.resetMs).toISOString(),
  );

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/login'],
};
