import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateApiKey, hashApiKey } from '@/lib/crypto';
import { OAuth2Client } from 'google-auth-library';
import type { ApiError } from '@/lib/types';

interface GoogleAuthRequest {
  id_token: string;
}

interface GoogleAuthResponse {
  user_id: string;
  api_key: string;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export async function POST(request: NextRequest) {
  let body: GoogleAuthRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { id_token } = body;
  if (!id_token || typeof id_token !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'id_token required' },
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
    // Verify the Google ID token
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
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
    const displayName = payload.name || null;

    // Find or create user
    let userId: string;
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const newUser = await pool.query(
        'INSERT INTO users (email, display_name) VALUES ($1, $2) RETURNING id',
        [email, displayName],
      );
      userId = newUser.rows[0].id;
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    await pool.query(
      `INSERT INTO api_keys (user_id, key_hash, label)
       VALUES ($1, $2, $3)`,
      [userId, keyHash, 'google'],
    );

    return NextResponse.json<GoogleAuthResponse>(
      { user_id: userId, api_key: apiKey },
      { status: 200 },
    );
  } catch (err) {
    console.error('Google auth error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Google authentication failed' },
      { status: 401 },
    );
  }
}
