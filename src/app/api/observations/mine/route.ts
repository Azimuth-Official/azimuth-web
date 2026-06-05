import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ListObservationsResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 1),
    200,
  );
  const offset = Math.max(
    parseInt(url.searchParams.get('offset') ?? '0', 10) || 0,
    0,
  );
  const nodeId = url.searchParams.get('node_id') || null;

  try {
    let query: string;
    let params: (string | number)[];

    if (nodeId) {
      query = `SELECT o.id, o.node_id, o.signal_type, o.observed_at, o.frequency_hz,
                      o.timestamp_ns, o.tdoa_offset_ns, o.signal_strength_dbm,
                      o.snr_db, o.source_id, o.raw_data, o.created_at
               FROM observations o
               JOIN nodes n ON o.node_id = n.id
               WHERE n.user_id = $1 AND o.node_id = $2
               ORDER BY o.observed_at DESC
               LIMIT $3 OFFSET $4`;
      params = [auth.user_id, nodeId, limit, offset];
    } else {
      query = `SELECT o.id, o.node_id, o.signal_type, o.observed_at, o.frequency_hz,
                      o.timestamp_ns, o.tdoa_offset_ns, o.signal_strength_dbm,
                      o.snr_db, o.source_id, o.raw_data, o.created_at
               FROM observations o
               JOIN nodes n ON o.node_id = n.id
               WHERE n.user_id = $1
               ORDER BY o.observed_at DESC
               LIMIT $2 OFFSET $3`;
      params = [auth.user_id, limit, offset];
    }

    const result = await pool.query(query, params);

    let countQuery: string;
    let countParams: string[];

    if (nodeId) {
      countQuery = `SELECT count(*)::int AS total
                    FROM observations o
                    JOIN nodes n ON o.node_id = n.id
                    WHERE n.user_id = $1 AND o.node_id = $2`;
      countParams = [auth.user_id, nodeId];
    } else {
      countQuery = `SELECT count(*)::int AS total
                    FROM observations o
                    JOIN nodes n ON o.node_id = n.id
                    WHERE n.user_id = $1`;
      countParams = [auth.user_id];
    }

    const countResult = await pool.query(countQuery, countParams);

    return NextResponse.json<ListObservationsResponse>({
      observations: result.rows,
      total: countResult.rows[0].total,
    });
  } catch (err) {
    console.error('List observations error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to list observations' },
      { status: 500 },
    );
  }
}
