import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  try {
    const { nodeId } = await params;

    const nodeResult = await pool.query(
      `
      SELECT
        n.id,
        n.hardware_type AS tier,
        n.label,
        n.status,
        COALESCE(n.location_lat, lo.lat) AS latitude,
        COALESCE(n.location_lon, lo.lon) AS longitude,
        n.registered_at,
        n.last_seen_at
      FROM nodes n
      LEFT JOIN LATERAL (
        SELECT latitude AS lat, longitude AS lon
        FROM observations
        WHERE node_id = n.id AND latitude IS NOT NULL
        ORDER BY observed_at DESC
        LIMIT 1
      ) lo ON true
      WHERE n.id = $1
    `,
      [nodeId],
    );

    if (nodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const node = nodeResult.rows[0];

    const breakdownResult = await pool.query(
      `
      SELECT
        signal_type,
        COUNT(*)::int AS count,
        ROUND(
          100.0 * COUNT(*) / NULLIF(
            (SELECT COUNT(*) FROM observations WHERE node_id = $1), 0
          ),
          1
        )::float AS percentage,
        MIN(observed_at) AS earliest,
        MAX(observed_at) AS latest,
        COUNT(*) FILTER (WHERE observed_at > NOW() - INTERVAL '24 hours')::int AS last_24h,
        MIN(frequency_hz) AS min_freq,
        MAX(frequency_hz) AS max_freq
      FROM observations
      WHERE node_id = $1
      GROUP BY signal_type
      ORDER BY count DESC
    `,
      [nodeId],
    );

    const totalObs = breakdownResult.rows.reduce(
      (s: number, r: any) => s + r.count,
      0,
    );

    const geoResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT (latitude, longitude))::int AS unique_points,
        MIN(latitude) AS min_lat, MAX(latitude) AS max_lat,
        MIN(longitude) AS min_lon, MAX(longitude) AS max_lon
      FROM observations
      WHERE node_id = $1 AND latitude IS NOT NULL
    `,
      [nodeId],
    );

    const geoRow = geoResult.rows[0];
    let geo = null;
    if (geoRow && geoRow.unique_points > 0) {
      const dlat = (geoRow.max_lat - geoRow.min_lat) * 111_320;
      const dlon =
        (geoRow.max_lon - geoRow.min_lon) *
        111_320 *
        Math.cos(((geoRow.min_lat + geoRow.max_lat) / 2) * (Math.PI / 180));
      const spread = Math.round(Math.sqrt(dlat * dlat + dlon * dlon));

      geo = {
        unique_points: geoRow.unique_points,
        spread_meters: spread,
        bounding_box: {
          min_lat: geoRow.min_lat,
          max_lat: geoRow.max_lat,
          min_lon: geoRow.min_lon,
          max_lon: geoRow.max_lon,
        },
      };
    }

    return NextResponse.json(
      {
        node,
        stats: {
          total_observations: totalObs,
          signal_breakdown: breakdownResult.rows,
        },
        geo,
      },
      { headers: { 'Cache-Control': 'public, max-age=120' } },
    );
  } catch (err) {
    console.error('[explorer/node] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch node detail' },
      { status: 500 },
    );
  }
}
