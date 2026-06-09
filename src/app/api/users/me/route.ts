import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ApiError } from '@/lib/types';

// GET /api/users/me — get user profile
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      'SELECT id, email, display_name, referral_code, created_at FROM users WHERE id = $1',
      [auth.user_id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json<ApiError>({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return NextResponse.json<ApiError>({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/users/me — update display_name
export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: { display_name?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const displayName = body.display_name?.trim();
  if (!displayName || displayName.length === 0) {
    return NextResponse.json<ApiError>({ error: 'display_name required' }, { status: 400 });
  }
  if (displayName.length > 64) {
    return NextResponse.json<ApiError>({ error: 'display_name max 64 characters' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET display_name = $1, updated_at = now() WHERE id = $2 RETURNING id, email, display_name',
      [displayName, auth.user_id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json<ApiError>({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json<ApiError>({ error: 'Failed to update profile' }, { status: 500 });
  }
}
