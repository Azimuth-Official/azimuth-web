import { NextRequest, NextResponse } from 'next/server';
import { cellToBoundary, latLngToCell } from 'h3-js';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const GRID_SCALE = 0.00417;

/** Convert grid8:lat:lon bucket IDs to real H3 index */
function gridToH3(gridId: string): string | null {
  if (!gridId.startsWith('grid8:')) return null;
  const parts = gridId.split(':');
  if (parts.length !== 3) return null;
  const latBucket = parseInt(parts[1]);
  const lonBucket = parseInt(parts[2]);
  if (isNaN(latBucket) || isNaN(lonBucket)) return null;
  const lat = latBucket * GRID_SCALE + GRID_SCALE / 2;
  const lon = lonBucket * GRID_SCALE + GRID_SCALE / 2;
  try {
    return latLngToCell(lat, lon, 8);
  } catch {
    return null;
  }
}

function computeBoundary(h3Index: string): number[][] | null {
  if (!h3Index) return null;
  // Convert grid8 to real H3 first
  const realH3 = h3Index.startsWith('grid') ? gridToH3(h3Index) : h3Index;
  if (!realH3) return null;
  try {
    return cellToBoundary(realH3); // returns [[lat, lng], ...]
  } catch {
    return null;
  }
}

/** Normalize h3_index: convert grid8 to real H3 if possible */
function normalizeH3(h3Index: string): string {
  if (!h3Index.startsWith('grid')) return h3Index;
  return gridToH3(h3Index) || h3Index;
}

// GET /api/coverage — global anonymized coverage with precomputed hex boundaries
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      `SELECT h3_index, COUNT(DISTINCT user_id) AS contributor_count,
              SUM(observation_count) AS total_observations
       FROM hex_coverage
       GROUP BY h3_index
       ORDER BY total_observations DESC`
    );

    return NextResponse.json({
      hexes: result.rows.map(r => ({
        h3_index: r.h3_index,
        contributor_count: parseInt(r.contributor_count),
        total_observations: parseInt(r.total_observations),
        boundary: computeBoundary(r.h3_index),
      })),
    });
  } catch (err) {
    console.error('Global coverage error:', err);
    return NextResponse.json({ error: 'Failed to fetch coverage' }, { status: 500 });
  }
}

// POST /api/coverage — batch upsert user's hex coverage
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: { hexes: Array<{
    h3_index: string;
    observation_count: number;
    signal_types: string[];
    first_seen: string;
    last_seen: string;
  }> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.hexes) || body.hexes.length === 0) {
    return NextResponse.json({ error: 'hexes array required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let synced = 0;

    for (const hex of body.hexes) {
      if (!hex.h3_index || typeof hex.h3_index !== 'string') continue;
      if (typeof hex.observation_count !== 'number') continue;

      // Normalize grid8 bucket IDs to real H3 indices
      const h3Index = normalizeH3(hex.h3_index);

      await client.query(
        `INSERT INTO hex_coverage (user_id, h3_index, observation_count, signal_types, first_seen, last_seen)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, h3_index) DO UPDATE SET
           observation_count = EXCLUDED.observation_count,
           signal_types = EXCLUDED.signal_types,
           last_seen = EXCLUDED.last_seen`,
        [
          auth.user_id,
          h3Index,
          hex.observation_count,
          hex.signal_types || [],
          hex.first_seen || new Date().toISOString(),
          hex.last_seen || new Date().toISOString(),
        ]
      );
      synced++;
    }

    await client.query('COMMIT');

    // Return boundaries for all uploaded hexes (keyed by ORIGINAL h3_index from Android)
    const boundaries: Record<string, number[][] | null> = {};
    for (const hex of body.hexes) {
      if (hex.h3_index) {
        boundaries[hex.h3_index] = computeBoundary(hex.h3_index);
      }
    }
    // Also include normalized H3 index mapping so Android can update its local IDs
    const normalized: Record<string, string> = {};
    for (const hex of body.hexes) {
      if (hex.h3_index && hex.h3_index.startsWith('grid')) {
        const real = normalizeH3(hex.h3_index);
        if (real !== hex.h3_index) normalized[hex.h3_index] = real;
      }
    }

    return NextResponse.json({ synced, boundaries, normalized }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Coverage upsert error:', err);
    return NextResponse.json({ error: 'Failed to sync coverage' }, { status: 500 });
  } finally {
    client.release();
  }
}
