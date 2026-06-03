import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ListRewardsResponse, ApiError } from '@/lib/types';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      `SELECT id, node_id, epoch, amount::text, reason, status, tx_hash, created_at
       FROM rewards
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [auth.user_id],
    );

    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::text AS total
       FROM rewards
       WHERE user_id = $1 AND status = 'distributed'`,
      [auth.user_id],
    );

    return NextResponse.json<ListRewardsResponse>({
      rewards: result.rows,
      total_earned: totalResult.rows[0].total,
    });
  } catch (err) {
    console.error('List rewards error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to list rewards' },
      { status: 500 },
    );
  }
}
