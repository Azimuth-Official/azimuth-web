import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { NetworkStats, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS total_users,
        (SELECT COUNT(*) FROM nodes)::int AS total_nodes,
        (SELECT COUNT(*) FROM nodes WHERE status = 'active')::int AS active_nodes,
        (SELECT COUNT(*) FROM observations)::int AS total_observations,
        (SELECT COUNT(*) FROM observations
         WHERE created_at > now() - interval '24 hours')::int AS observations_24h,
        (SELECT COALESCE(SUM(amount), 0)::text FROM rewards
         WHERE status = 'distributed') AS total_rewards_distributed
    `);

    return NextResponse.json<NetworkStats>(result.rows[0]);
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch stats' },
      { status: 500 },
    );
  }
}
