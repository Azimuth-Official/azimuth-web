import { NextRequest, NextResponse } from 'next/server';
import { cellToBoundary } from 'h3-js';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function computeBoundary(h3Index: string): number[][] | null {
  if (!h3Index || h3Index.startsWith('grid')) return null;
  try {
    return cellToBoundary(h3Index); // returns [[lat, lng], ...]
  } catch {
    return null;
  }
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

      await client.query(
        `INSERT INTO hex_coverage (user_id, h3_index, observation_count, signal_types, first_seen, last_seen)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, h3_index) DO UPDATE SET
           observation_count = EXCLUDED.observation_count,
           signal_types = EXCLUDED.signal_types,
           last_seen = EXCLUDED.last_seen`,
        [
          auth.user_id,
          hex.h3_index,
          hex.observation_count,
          hex.signal_types || [],
          hex.first_seen || new Date().toISOString(),
          hex.last_seen || new Date().toISOString(),
        ]
      );
      synced++;
    }

    await client.query('COMMIT');

    // Return boundaries for all uploaded hexes so Android can render them
    const boundaries: Record<string, number[][] | null> = {};
    for (const hex of body.hexes) {
      if (hex.h3_index) {
        boundaries[hex.h3_index] = computeBoundary(hex.h3_index);
      }
    }

    return NextResponse.json({ synced, boundaries }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Coverage upsert error:', err);
    return NextResponse.json({ error: 'Failed to sync coverage' }, { status: 500 });
  } finally {
    client.release();
  }
}
