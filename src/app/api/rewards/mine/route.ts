import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ListRewardsResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

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

    // Recent reward breakdowns from points table
    const recentPoints = await pool.query(
      `SELECT amount, reason, reward_breakdown, created_at
       FROM points
       WHERE user_id = $1 AND reward_breakdown IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 20`,
      [auth.user_id],
    );

    return NextResponse.json<ListRewardsResponse & { recent_breakdowns?: unknown[] }>({
      rewards: result.rows,
      total_earned: totalResult.rows[0].total,
      recent_breakdowns: recentPoints.rows.map((r) => ({
        amount: r.amount / 1000,
        reason: r.reason,
        breakdown: r.reward_breakdown,
        created_at: r.created_at,
      })),
    });
  } catch (err) {
    console.error('List rewards error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to list rewards' },
      { status: 500 },
    );
  }
}
