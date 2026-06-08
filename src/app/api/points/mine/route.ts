import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { PointsResponse, PointEntry, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    // Get limit from query params (default 50, max 200)
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') ?? '50', 10) || 50,
      200,
    );

    // Fetch balance
    const balanceResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0)::integer as balance FROM points WHERE user_id = $1',
      [auth.user_id],
    );
    const balance = balanceResult.rows[0]?.balance ?? 0;

    // Fetch history
    const historyResult = await pool.query(
      `SELECT id, amount, reason, reference_id, created_at
       FROM points
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [auth.user_id, limit],
    );

    const history: PointEntry[] = historyResult.rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      reason: row.reason,
      reference_id: row.reference_id,
      created_at: row.created_at,
    }));

    return NextResponse.json<PointsResponse>(
      { balance, history },
      { status: 200 },
    );
  } catch (err) {
    console.error('Points fetch error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch points' },
      { status: 500 },
    );
  }
}
