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
    if (obs.latitude !== undefined && obs.latitude !== null && typeof obs.latitude !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: latitude must be number or null` },
        { status: 400 },
      );
    }
    if (obs.longitude !== undefined && obs.longitude !== null && typeof obs.longitude !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: longitude must be number or null` },
        { status: 400 },
      );
    }
    if (obs.accuracy !== undefined && obs.accuracy !== null && typeof obs.accuracy !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: accuracy must be number or null` },
        { status: 400 },
      );
    }
    if (obs.altitude !== undefined && obs.altitude !== null && typeof obs.altitude !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: altitude must be number or null` },
        { status: 400 },
      );
    }
    if (obs.app_version !== undefined && obs.app_version !== null && typeof obs.app_version !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: app_version must be string or null` },
        { status: 400 },
      );
    }
    if (obs.build_number !== undefined && obs.build_number !== null && typeof obs.build_number !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: build_number must be string or null` },
        { status: 400 },
      );
    }
    if (obs.device_model !== undefined && obs.device_model !== null && typeof obs.device_model !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: device_model must be string or null` },
        { status: 400 },
      );
    }
    if (obs.android_api_level !== undefined && obs.android_api_level !== null && typeof obs.android_api_level !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: android_api_level must be number or null` },
        { status: 400 },
      );
    }
    if (obs.validation_status !== undefined && obs.validation_status !== null && typeof obs.validation_status !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: validation_status must be string or null` },
        { status: 400 },
      );
    }
    if (obs.client_dedupe_key !== undefined && obs.client_dedupe_key !== null && typeof obs.client_dedupe_key !== 'string') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: client_dedupe_key must be string or null` },
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
      const insertResult = await client.query(
        `INSERT INTO observations
         (node_id, signal_type, observed_at, frequency_hz, timestamp_ns,
          tdoa_offset_ns, signal_strength_dbm, snr_db, source_id, raw_data,
          latitude, longitude, accuracy_m, altitude_m, app_version, build_number,
          device_model, android_api_level, validation_status, client_dedupe_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (node_id, client_dedupe_key) WHERE client_dedupe_key IS NOT NULL DO NOTHING
         RETURNING id`,
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
          JSON.stringify(obs.raw_data || {}),
          obs.latitude ?? null,
          obs.longitude ?? null,
          obs.accuracy ?? null,
          obs.altitude ?? null,
          obs.app_version ?? null,
          obs.build_number ?? null,
          obs.device_model ?? null,
          obs.android_api_level ?? null,
          obs.validation_status ?? 'raw',
          obs.client_dedupe_key ?? null,
        ],
      );
      if (insertResult.rows.length > 0) {
        accepted++;
      }
    }

    // Award points for accepted observations
    if (accepted > 0) {
      const { POINTS } = await import('@/lib/points');
      await client.query(
        `INSERT INTO points (user_id, amount, reason, reference_id)
         VALUES ($1, $2, $3, $4)`,
        [auth.user_id, accepted * POINTS.PER_OBSERVATION, 'observation_upload', `batch_${Date.now()}`],
      );
    }

    await client.query('COMMIT');

    return NextResponse.json<SubmitObservationsResponse>(
      { accepted, points_earned: accepted * 1 },
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
