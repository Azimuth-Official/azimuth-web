import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        n.id,
        n.hardware_type AS tier,
        n.label,
        n.status,
        n.last_seen_at,
        n.registered_at,
        COALESCE(n.location_lat, latest_obs.lat) AS latitude,
        COALESCE(n.location_lon, latest_obs.lon) AS longitude,
        COALESCE(obs_agg.observation_count, 0)::int AS observation_count,
        obs_agg.signal_types
      FROM nodes n
      LEFT JOIN LATERAL (
        SELECT latitude AS lat, longitude AS lon
        FROM observations
        WHERE node_id = n.id AND latitude IS NOT NULL
        ORDER BY observed_at DESC
        LIMIT 1
      ) latest_obs ON true
      LEFT JOIN (
        SELECT
          node_id,
          COUNT(*)::int AS observation_count,
          ARRAY_AGG(DISTINCT signal_type) AS signal_types
        FROM observations
        GROUP BY node_id
      ) obs_agg ON obs_agg.node_id = n.id
      ORDER BY COALESCE(obs_agg.observation_count, 0) DESC
    `);

    return NextResponse.json({
      nodes: result.rows,
      updated_at: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    console.error('[explorer/nodes] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 },
    );
  }
}
