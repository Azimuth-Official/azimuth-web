import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ApiError } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { nodeId } = await params;

  try {
    const result = await pool.query(
      `UPDATE nodes SET last_seen_at = now(), status = 'active'
       WHERE id = $1 AND user_id = $2`,
      [nodeId, auth.user_id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json<ApiError>(
        { error: 'Node not found' },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Heartbeat error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Heartbeat failed' },
      { status: 500 },
    );
  }
}
