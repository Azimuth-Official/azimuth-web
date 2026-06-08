import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { OAuth2Client } from 'google-auth-library';
import { signSessionToken, setSessionCookie } from '@/lib/session';
import type { ApiError } from '@/lib/types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export async function POST(request: NextRequest) {
  let body: { credential?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { credential } = body;
  if (!credential || typeof credential !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'credential (Google ID token) required' },
      { status: 400 },
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json<ApiError>(
      { error: 'Google Sign-In not configured' },
      { status: 503 },
    );
  }

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid Google token' },
        { status: 401 },
      );
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const displayName = payload.name || null;

    let userId: string;

    // Try to find user by google_id first, then by email
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
        // Link google_id if not yet linked
        if (!byEmail.rows[0].google_id) {
          await pool.query(
            'UPDATE users SET google_id = $1, updated_at = now() WHERE id = $2',
            [googleId, userId],
          );
        }
      } else {
        // New user
        const newUser = await pool.query(
          'INSERT INTO users (email, google_id, display_name) VALUES ($1, $2, $3) RETURNING id',
          [email, googleId, displayName],
        );
        userId = newUser.rows[0].id;
      }
    }

    const token = await signSessionToken(userId);

    const response = NextResponse.json(
      { user: { id: userId, email } },
      { status: 200 },
    );
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('Web Google auth error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Google authentication failed' },
      { status: 401 },
    );
  }
}
