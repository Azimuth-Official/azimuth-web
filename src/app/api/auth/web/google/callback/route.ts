import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { signSessionToken, setSessionCookie } from '@/lib/session';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const origin = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=google_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/auth/web/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${origin}/login?error=token_exchange`);
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=userinfo_failed`);
    }

    const userInfo = await userInfoRes.json();
    const email = (userInfo.email as string).toLowerCase().trim();
    const googleId = userInfo.id as string;
    const displayName = (userInfo.name as string) || null;

    // Same user lookup/creation logic as the ID token route
    let userId: string;

    const byGoogleId = await pool.query(
      'SELECT id FROM users WHERE google_id = $1',
      [googleId],
    );

    if (byGoogleId.rows.length > 0) {
      userId = byGoogleId.rows[0].id;
    } else {
      const byEmail = await pool.query(
        'SELECT id, google_id FROM users WHERE email = $1',
        [email],
      );

      if (byEmail.rows.length > 0) {
        userId = byEmail.rows[0].id;
        if (!byEmail.rows[0].google_id) {
          await pool.query(
            'UPDATE users SET google_id = $1, updated_at = now() WHERE id = $2',
            [googleId, userId],
          );
        }
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, google_id, display_name) VALUES ($1, $2, $3) RETURNING id',
          [email, googleId, displayName],
        );
        userId = newUser.rows[0].id;
      }
    }

    const token = await signSessionToken(userId);
    const response = NextResponse.redirect(`${origin}/dashboard`);
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
