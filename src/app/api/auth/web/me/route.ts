import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionTokenFromRequest, verifySessionToken } from '@/lib/session';
import type { ApiError } from '@/lib/types';

export async function GET(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);
  if (!token) {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid or expired session' },
      { status: 401 },
    );
  }

  try {
    const result = await pool.query(
      'SELECT id, email, wallet_address, display_name, created_at FROM users WHERE id = $1',
      [session.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'User not found' },
        { status: 401 },
      );
    }

    const user = result.rows[0];
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        display_name: user.display_name,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
