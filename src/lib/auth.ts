import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashApiKey } from '@/lib/crypto';
import { getSessionTokenFromRequest, verifySessionToken } from '@/lib/session';
import type { AuthContext, ApiError } from '@/lib/types';

export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthContext | NextResponse<ApiError>> {
  // 1. Check Bearer token (existing mobile/API auth)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7);
    const keyHash = hashApiKey(apiKey);

    const result = await pool.query(
      `SELECT ak.id AS key_id, ak.user_id, ak.permissions
       FROM api_keys ak
       WHERE ak.key_hash = $1
         AND (ak.expires_at IS NULL OR ak.expires_at > now())`,
      [keyHash],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 },
      );
    }

    // Update last_used_at (fire-and-forget)
    pool.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [
      result.rows[0].key_id,
    ]);

    return {
      user_id: result.rows[0].user_id,
      key_id: result.rows[0].key_id,
      permissions: result.rows[0].permissions,
    };
  }

  // 2. Check session cookie (web auth)
  const sessionToken = getSessionTokenFromRequest(request);
  if (sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session) {
      // Verify user still exists
      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [session.userId],
      );
      if (userResult.rows.length > 0) {
        return {
          user_id: session.userId,
          key_id: null,
          permissions: {},
        };
      }
    }
  }

  // Neither auth method succeeded
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 },
  );
}
