import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateApiKey, hashApiKey } from '@/lib/crypto';
import type { RegisterRequest, RegisterResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: RegisterRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { wallet_address } = body;
  if (!wallet_address || wallet_address.length < 58) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid wallet_address' },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert user
    const userResult = await client.query(
      `INSERT INTO users (wallet_address)
       VALUES ($1)
       ON CONFLICT (wallet_address) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [wallet_address],
    );
    const userId = userResult.rows[0].id;

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, label)
       VALUES ($1, $2, $3)`,
      [userId, keyHash, 'default'],
    );

    await client.query('COMMIT');

    return NextResponse.json<RegisterResponse>(
      { user_id: userId, api_key: apiKey },
      { status: 201 },
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Registration failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
