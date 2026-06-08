import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateApiKey, hashApiKey } from '@/lib/crypto';
import bcrypt from 'bcryptjs';
import type { ApiError } from '@/lib/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user_id: string;
  api_key: string;
}

export async function POST(request: NextRequest) {
  let body: LoginRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { email, password } = body;
  if (!email || typeof email !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'email required' },
      { status: 400 },
    );
  }
  if (!password || typeof password !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'password required' },
      { status: 400 },
    );
  }

  try {
    // Find user by email
    const userResult = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      return NextResponse.json<ApiError>(
        { error: 'Account requires password setup — please re-register' },
        { status: 400 },
      );
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Generate new API key on login
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    await pool.query(
      `INSERT INTO api_keys (user_id, key_hash, label)
       VALUES ($1, $2, $3)`,
      [user.id, keyHash, 'login'],
    );

    return NextResponse.json<LoginResponse>(
      { user_id: user.id, api_key: apiKey },
      { status: 200 },
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Login failed' },
      { status: 500 },
    );
  }
}
