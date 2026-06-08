import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { generateApiKey, hashApiKey } from '@/lib/crypto';
import type { RotateKeyResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  if (!auth.key_id) {
    return NextResponse.json<ApiError>(
      { error: 'API key authentication required for key rotation' },
      { status: 403 },
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Revoke current key
    await client.query('DELETE FROM api_keys WHERE id = $1', [auth.key_id]);

    // Generate new key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, label)
       VALUES ($1, $2, $3)`,
      [auth.user_id, keyHash, 'rotated'],
    );

    await client.query('COMMIT');

    return NextResponse.json<RotateKeyResponse>({ api_key: apiKey });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Key rotation error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Key rotation failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
