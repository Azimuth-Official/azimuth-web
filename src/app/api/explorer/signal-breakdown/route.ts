import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        signal_type,
        COUNT(*)::int AS count,
        ROUND(
          100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM observations), 0),
          1
        )::float AS percentage,
        MIN(observed_at) AS earliest,
        MAX(observed_at) AS latest
      FROM observations
      GROUP BY signal_type
      ORDER BY count DESC
    `);

    const total = result.rows.reduce((s: number, r: any) => s + r.count, 0);

    return NextResponse.json(
      { total, types: result.rows },
      { headers: { 'Cache-Control': 'public, max-age=300' } },
    );
  } catch (err) {
    console.error('[explorer/signal-breakdown] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch signal breakdown' },
      { status: 500 },
    );
  }
}
