import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { generateAnimalName } from '@/lib/animal-names';
import type { ListNodesResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await pool.query(
      `SELECT id, hardware_type, label, location_lat AS latitude,
              location_lon AS longitude, location_alt_m AS altitude_m,
              status, registered_at, last_seen_at, metadata
       FROM nodes
       WHERE user_id = $1
       ORDER BY registered_at DESC`,
      [auth.user_id],
    );

    // Add animal_name to each node
    const nodes = result.rows.map((node) => ({
      ...node,
      animal_name: generateAnimalName(node.id),
    }));

    return NextResponse.json<ListNodesResponse>({ nodes });
  } catch (err) {
    console.error('List nodes error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to list nodes' },
      { status: 500 },
    );
  }
}
