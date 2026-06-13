import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cellToBoundary } from 'h3-js';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000;
const MAX_SPAN = 10;

const SIGNAL_FILTER = "('cell_lte','cell_nr','gnss_raw','wifi_survey','wifi_rtt')";

interface FreshnessHex {
  h3_index: string;
  last_observation: string | null;
  freshness_tier: string;
  freshness_multiplier: number;
  observation_count: number;
  boundary: number[][];
}

function computeFreshnessTier(lastObs: Date | null): { tier: string; multiplier: number } {
  if (!lastObs) return { tier: 'virgin', multiplier: 3.0 };

  const ageMinutes = (Date.now() - lastObs.getTime()) / 60000;

  if (ageMinutes < 60) return { tier: 'saturated', multiplier: 0.10 };
  if (ageMinutes < 1440) return { tier: 'recent', multiplier: 0.25 };
  if (ageMinutes < 10080) return { tier: 'baseline_24h', multiplier: 1.0 };
  if (ageMinutes < 43200) return { tier: 'aging_7d', multiplier: 1.5 };
  return { tier: 'stale_30d', multiplier: 2.0 };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const boundsStr = url.searchParams.get('bounds');

  if (!boundsStr) {
    return NextResponse.json({ error: 'bounds parameter required (south,west,north,east)' }, { status: 400 });
  }

  const parts = boundsStr.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return NextResponse.json({ error: 'bounds must be 4 comma-separated numbers' }, { status: 400 });
  }

  const [south, west, north, east] = parts;

  if (south < -90 || south > 90 || north < -90 || north > 90 ||
      west < -180 || west > 180 || east < -180 || east > 180) {
    return NextResponse.json({ error: 'Invalid coordinate range' }, { status: 400 });
  }

  if (Math.abs(north - south) > MAX_SPAN || Math.abs(east - west) > MAX_SPAN) {
    return NextResponse.json({ error: 'Viewport too large (max 10 degrees)' }, { status: 400 });
  }

  const cacheKey = parts.map(v => Math.round(v * 100) / 100).join(',');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         h3_index,
         MAX(created_at) as last_obs,
         COUNT(*) as obs_count
       FROM observations
       WHERE h3_index IS NOT NULL
         AND latitude BETWEEN $1 AND $3
         AND longitude BETWEEN $2 AND $4
         AND signal_type IN ${SIGNAL_FILTER}
       GROUP BY h3_index`,
      [south, west, north, east],
    );

    const hexes: FreshnessHex[] = result.rows.map((row) => {
      const lastObs = row.last_obs ? new Date(row.last_obs) : null;
      const { tier, multiplier } = computeFreshnessTier(lastObs);

      let boundary: number[][] = [];
      try {
        const b = cellToBoundary(row.h3_index, true);
        boundary = b.map(([lng, lat]: [number, number]) => [lat, lng]);
      } catch {
        // skip invalid h3
      }

      return {
        h3_index: row.h3_index,
        last_observation: lastObs ? lastObs.toISOString() : null,
        freshness_tier: tier,
        freshness_multiplier: multiplier,
        observation_count: parseInt(row.obs_count),
        boundary,
      };
    });

    const data = { hexes };
    cache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error('[hex-freshness] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch hex freshness' }, { status: 500 });
  }
}
