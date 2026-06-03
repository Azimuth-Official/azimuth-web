import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { UpdateNodeRequest, ApiError } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { nodeId } = await params;

  let body: UpdateNodeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // Build dynamic SET clause from provided fields with validation
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const validStatuses = ['registered', 'active', 'inactive', 'decommissioned'];

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !validStatuses.includes(body.status)) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid status' },
        { status: 400 },
      );
    }
    updates.push(`status = $${idx++}`);
    values.push(body.status);
  }
  if (body.label !== undefined) {
    if (typeof body.label !== 'string') {
      return NextResponse.json<ApiError>(
        { error: 'Invalid label' },
        { status: 400 },
      );
    }
    updates.push(`label = $${idx++}`);
    values.push(body.label);
  }
  if (body.latitude !== undefined) {
    if (typeof body.latitude !== 'number' || body.latitude < -90 || body.latitude > 90) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid latitude' },
        { status: 400 },
      );
    }
    updates.push(`location_lat = $${idx++}`);
    values.push(body.latitude);
  }
  if (body.longitude !== undefined) {
    if (typeof body.longitude !== 'number' || body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid longitude' },
        { status: 400 },
      );
    }
    updates.push(`location_lon = $${idx++}`);
    values.push(body.longitude);
  }
  if (body.altitude_m !== undefined) {
    if (typeof body.altitude_m !== 'number') {
      return NextResponse.json<ApiError>(
        { error: 'Invalid altitude_m' },
        { status: 400 },
      );
    }
    updates.push(`location_alt_m = $${idx++}`);
    values.push(body.altitude_m);
  }
  if (body.metadata !== undefined) {
    if (typeof body.metadata !== 'object' || body.metadata === null) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid metadata' },
        { status: 400 },
      );
    }
    updates.push(`metadata = $${idx++}`);
    values.push(JSON.stringify(body.metadata));
  }

  if (updates.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'No fields to update' },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `UPDATE nodes SET ${updates.join(', ')}
       WHERE id = $${idx} AND user_id = $${idx + 1}`,
      [...values, nodeId, auth.user_id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json<ApiError>(
        { error: 'Node not found' },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Node update error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Node update failed' },
      { status: 500 },
    );
  }
}
