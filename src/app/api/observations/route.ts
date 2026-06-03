import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { SubmitObservationsRequest, SubmitObservationsResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: SubmitObservationsRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { node_id, observations } = body;
  if (!node_id || typeof node_id !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'node_id required and must be string' },
      { status: 400 },
    );
  }
  if (!Array.isArray(observations) || observations.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'observations array required with at least one entry' },
      { status: 400 },
    );
  }

  const validSignalTypes = [
    'lte_pss', 'lte_sss', 'lte_crs', 'lte_prs', '5g_nr_ss', 'dtv_pilot', 'fm_rds', 'leo_downlink',
    'cell_lte', 'cell_nr', 'gnss_raw', 'wifi_survey', 'wifi_rtt',
  ];

  // Validate each observation
  for (let i = 0; i < observations.length; i++) {
    const obs = observations[i];
    if (!obs || typeof obs !== 'object') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: must be an object` },
        { status: 400 },
      );
    }
    if (!obs.signal_type || typeof obs.signal_type !== 'string' || !validSignalTypes.includes(obs.signal_type)) {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: invalid signal_type` },
        { status: 400 },
      );
    }
    if (!obs.observed_at || typeof obs.observed_at !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: observed_at required and must be ISO 8601 string` },
        { status: 400 },
      );
    }
    // Optional fields: validate types if present
    if (obs.frequency_hz !== undefined && obs.frequency_hz !== null && typeof obs.frequency_hz !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: frequency_hz must be number or null` },
        { status: 400 },
      );
    }
    if (obs.timestamp_ns !== undefined && obs.timestamp_ns !== null && typeof obs.timestamp_ns !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: timestamp_ns must be number or null` },
        { status: 400 },
      );
    }
    if (obs.tdoa_offset_ns !== undefined && obs.tdoa_offset_ns !== null && typeof obs.tdoa_offset_ns !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: tdoa_offset_ns must be number or null` },
        { status: 400 },
      );
    }
  }

  // Verify node belongs to user
  const nodeCheck = await pool.query(
    'SELECT id FROM nodes WHERE id = $1 AND user_id = $2',
    [node_id, auth.user_id],
  );
  if (nodeCheck.rows.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'Node not found' },
      { status: 404 },
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let accepted = 0;
    for (const obs of observations) {
      await client.query(
        `INSERT INTO observations
         (node_id, signal_type, observed_at, frequency_hz, timestamp_ns,
          tdoa_offset_ns, signal_strength_dbm, snr_db, source_id, raw_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          node_id,
          obs.signal_type,
          obs.observed_at,
          obs.frequency_hz ?? null,
          obs.timestamp_ns ?? null,
          obs.tdoa_offset_ns ?? null,
          obs.signal_strength_dbm ?? null,
          obs.snr_db ?? null,
          obs.source_id ?? null,
          obs.raw_data ? JSON.stringify(obs.raw_data) : null,
        ],
      );
      accepted++;
    }

    await client.query('COMMIT');

    return NextResponse.json<SubmitObservationsResponse>(
      { accepted },
      { status: 201 },
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Observation submit error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to submit observations' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
