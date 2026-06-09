import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { RegisterRtkProviderRequest, ListRtkProvidersResponse, ApiError } from '@/lib/types';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      'SELECT id, user_id, provider_name, is_active, created_at FROM rtk_providers WHERE user_id = $1 ORDER BY created_at DESC',
      [auth.user_id],
    );

    return NextResponse.json<ListRtkProvidersResponse>(
      { providers: result.rows },
      { status: 200 },
    );
  } catch (err) {
    console.error('RTK providers list error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to list RTK providers' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: RegisterRtkProviderRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { provider_name } = body;
  const validProviders = ['geodnet', 'onocoy', 'other'];

  if (!provider_name || !validProviders.includes(provider_name)) {
    return NextResponse.json<ApiError>(
      { error: 'provider_name required and must be one of: geodnet, onocoy, other' },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `INSERT INTO rtk_providers (user_id, provider_name, is_active, created_at, updated_at)
       VALUES ($1, $2, true, now(), now())
       ON CONFLICT (user_id, provider_name) DO UPDATE SET is_active = true, updated_at = now()
       RETURNING id, user_id, provider_name, is_active, created_at`,
      [auth.user_id, provider_name],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('RTK provider register error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to register RTK provider' },
      { status: 500 },
    );
  }
}
