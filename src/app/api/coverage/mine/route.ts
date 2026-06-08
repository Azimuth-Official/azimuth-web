import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/coverage/mine — user's own coverage
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      `SELECT h3_index, observation_count, signal_types, first_seen, last_seen
       FROM hex_coverage
       WHERE user_id = $1
       ORDER BY last_seen DESC`,
      [auth.user_id]
    );

    return NextResponse.json({
      hexes: result.rows.map(r => ({
        h3_index: r.h3_index,
        observation_count: r.observation_count,
        signal_types: r.signal_types,
        first_seen: r.first_seen,
        last_seen: r.last_seen,
      })),
    });
  } catch (err) {
    console.error('My coverage error:', err);
    return NextResponse.json({ error: 'Failed to fetch coverage' }, { status: 500 });
  }
}
