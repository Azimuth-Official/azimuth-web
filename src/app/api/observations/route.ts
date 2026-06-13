import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { calculateReward } from '@/lib/rewards';
import { latLngToCell } from 'h3-js';
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
    if (obs.rtk_enabled !== undefined && obs.rtk_enabled !== null && typeof obs.rtk_enabled !== 'boolean') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: rtk_enabled must be boolean or null` },
        { status: 400 },
      );
    }
    if (obs.full_bias_nanos !== undefined && obs.full_bias_nanos !== null && typeof obs.full_bias_nanos !== 'number') {
      return NextResponse.json<ApiError>(
        { error: `Observation ${i}: full_bias_nanos must be number or null` },
        { status: 400 },
      );
    }
  }

  // Verify node belongs to user
  const nodeCheck = await pool.query(
    'SELECT id, hardware_type, tier FROM nodes WHERE id = $1 AND user_id = $2',
    [node_id, auth.user_id],
  );
  if (nodeCheck.rows.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'Node not found' },
      { status: 404 },
    );
  }

  const nodeInfo = nodeCheck.rows[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const GPS_ACCURACY_THRESHOLD_M = 50;
    let accepted = 0;
    let totalRewardPoints = 0;

    for (const obs of observations) {
      // Skip observations with poor GPS accuracy
      if (obs.accuracy !== undefined && obs.accuracy !== null && obs.accuracy > GPS_ACCURACY_THRESHOLD_M) {
        continue;
      }

      // Compute h3_index before INSERT
      let h3Index: string | null = null;
      if (obs.latitude != null && obs.longitude != null) {
        try {
          h3Index = latLngToCell(obs.latitude, obs.longitude, 8);
        } catch {
          // Skip h3 computation errors
        }
      }

      const insertResult = await client.query(
        `INSERT INTO observations
         (node_id, signal_type, observed_at, frequency_hz, timestamp_ns,
          tdoa_offset_ns, signal_strength_dbm, snr_db, source_id, raw_data,
          latitude, longitude, accuracy_m, altitude_m, app_version, build_number,
          device_model, android_api_level, validation_status, client_dedupe_key,
          rtk_enabled, full_bias_nanos, h3_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                 $15, $16, $17, $18, $19, $20, $21, $22, $23)
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
          obs.rtk_enabled ?? false,
          obs.full_bias_nanos ?? null,
          h3Index,
        ],
      );

      if (insertResult.rows.length > 0) {
        accepted++;

        // Calculate reward for this observation
        try {
          // Check RTK provider for this user
          let rtkActive = false;
          if (obs.rtk_enabled === true) {
            const providerCheck = await client.query(
              'SELECT id FROM rtk_providers WHERE user_id = $1 AND is_active = true LIMIT 1',
              [auth.user_id],
            );
            rtkActive = providerCheck.rows.length > 0;
          }

          const breakdown = await calculateReward(client, {
            h3_index: h3Index,
            node_id,
            signal_type: obs.signal_type,
          }, {
            id: nodeInfo.id,
            hardware_type: nodeInfo.hardware_type,
            tier: nodeInfo.tier ?? 0,
            rtk_active: rtkActive,
          });

          if (breakdown.final > 0) {
            await client.query(
              `INSERT INTO points (user_id, amount, reason, reference_id, reward_breakdown)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                auth.user_id,
                Math.max(Math.round(breakdown.final * 1000), 1), // Store as millipoints for precision
                'observation_reward',
                insertResult.rows[0].id,
                JSON.stringify(breakdown),
              ],
            );
            totalRewardPoints += breakdown.final;
          }
        } catch (rewardErr) {
          // Reward calculation failed — observation still accepted
          // Fall back to legacy flat points
          await client.query(
            `INSERT INTO points (user_id, amount, reason, reference_id)
             VALUES ($1, $2, $3, $4)`,
            [auth.user_id, 1, 'observation_upload', insertResult.rows[0].id],
          );
          totalRewardPoints += 1;
          console.error('Reward calculation fallback:', rewardErr);
        }
      }
    }

    await client.query('COMMIT');

    return NextResponse.json<SubmitObservationsResponse>(
      { accepted, points_earned: Math.round(totalRewardPoints * 1000) / 1000 },
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
