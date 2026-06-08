import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signSessionToken, setSessionCookie } from '@/lib/session';
import { generateReferralCode, processReferral } from '@/lib/referral';
import type { ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; referral_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { email, password, referral_code } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'email required' },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid email format' },
      { status: 400 },
    );
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json<ApiError>(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already exists
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail],
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json<ApiError>(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate referral code for new user
    const newReferralCode = generateReferralCode();

    const result = await client.query(
      'INSERT INTO users (email, password_hash, referral_code) VALUES ($1, $2, $3) RETURNING id',
      [normalizedEmail, passwordHash, newReferralCode],
    );

    const userId = result.rows[0].id;

    // Process referral if code provided
    if (referral_code) {
      await processReferral(client as any, referral_code, userId);
    }

    await client.query('COMMIT');

    const token = await signSessionToken(userId);

    const response = NextResponse.json(
      { user: { id: userId, email: normalizedEmail } },
      { status: 201 },
    );
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Web registration error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Registration failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
