import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signSessionToken, setSessionCookie } from '@/lib/session';
import type { ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
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
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return NextResponse.json<ApiError>(
        { error: 'Account requires password setup — please re-register' },
        { status: 400 },
      );
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const token = await signSessionToken(user.id);

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 200 },
    );
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('Web login error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Login failed' },
      { status: 500 },
    );
  }
}
