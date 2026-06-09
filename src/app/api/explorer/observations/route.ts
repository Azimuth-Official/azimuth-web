import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(
      Math.max(parseInt(searchParams.get('hours') || '168', 10) || 168, 1),
      720,
    );
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '10000', 10) || 10000, 1),
      50000,
    );

    const result = await pool.query(
      `
      SELECT latitude, longitude, signal_type, signal_strength_dbm, observed_at
      FROM observations
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND observed_at > NOW() - make_interval(hours => $1)
      ORDER BY observed_at DESC
      LIMIT $2
    `,
      [hours, limit],
    );

    return NextResponse.json({
      observations: result.rows,
      count: result.rows.length,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[explorer/observations] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 },
    );
  }
}
