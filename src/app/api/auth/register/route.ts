import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateApiKey, hashApiKey } from '@/lib/crypto';
import bcrypt from 'bcryptjs';
import { generateReferralCode, processReferral } from '@/lib/referral';
import type { RegisterRequest, RegisterResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: RegisterRequest & { password?: string; referral_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { email, wallet_address, password, referral_code } = body;

  // Require password for authentication
  if (!password || typeof password !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'password required (minimum 8 characters)' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json<ApiError>(
      { error: 'password must be at least 8 characters' },
      { status: 400 },
    );
  }

  // Require at least one identifier
  if (!email && !wallet_address) {
    return NextResponse.json<ApiError>(
      { error: 'Either email or wallet_address is required' },
      { status: 400 },
    );
  }

  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid email format' },
      { status: 400 },
    );
  }

  // Normalize email to lowercase (matches web login/register behavior)
  const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

  // Validate wallet_address if provided (legacy)
  if (wallet_address && wallet_address.length < 58) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid wallet_address' },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let userId: string;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate referral code for new user
    const newReferralCode = generateReferralCode();

    if (normalizedEmail) {
      // Upsert by email, update password_hash
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, referral_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2, updated_at = now()
         RETURNING id`,
        [normalizedEmail, passwordHash, newReferralCode],
      );
      userId = userResult.rows[0].id;
    } else {
      // Legacy: upsert by wallet_address, set password_hash
      const userResult = await client.query(
        `INSERT INTO users (wallet_address, password_hash, referral_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address) DO UPDATE SET password_hash = $2, updated_at = now()
         RETURNING id`,
        [wallet_address, passwordHash, newReferralCode],
      );
      userId = userResult.rows[0].id;
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, label)
       VALUES ($1, $2, $3)`,
      [userId, keyHash, 'default'],
    );

    // Process referral if code provided
    if (referral_code) {
      await processReferral(client as any, referral_code, userId);
    }

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
