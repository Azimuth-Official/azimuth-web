import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { RegisterNodeRequest, RegisterNodeResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: RegisterNodeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { hardware_type, label, latitude, longitude, altitude_m } = body;

  const validTypes = ['tier0_mobile', 'tier1_rtlsdr', 'tier2_gpsdisc', 'tier3_kraken'];
  if (!hardware_type || !validTypes.includes(hardware_type)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid hardware_type' },
      { status: 400 },
    );
  }

  // Validate optional location fields if provided
  if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid latitude' },
      { status: 400 },
    );
  }
  if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid longitude' },
      { status: 400 },
    );
  }
  if (altitude_m !== undefined && typeof altitude_m !== 'number') {
    return NextResponse.json<ApiError>(
      { error: 'Invalid altitude_m' },
      { status: 400 },
    );
  }
  if (label !== undefined && typeof label !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'Invalid label' },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `INSERT INTO nodes (user_id, hardware_type, label, location_lat, location_lon, location_alt_m)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [auth.user_id, hardware_type, label ?? null, latitude ?? null, longitude ?? null, altitude_m ?? null],
    );

    return NextResponse.json<RegisterNodeResponse>(
      { node_id: result.rows[0].id },
      { status: 201 },
    );
  } catch (err) {
    console.error('Node registration error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Node registration failed' },
      { status: 500 },
    );
  }
}
