import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { POINTS } from '@/lib/points';
import type { ApiError } from '@/lib/types';

export async function POST(request: NextRequest) {
  // Auth: X-Cron-Secret header
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json<ApiError>({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const provided = request.headers.get('x-cron-secret');
  if (provided !== cronSecret) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get all referral pairs
    const referrals = await pool.query(
      'SELECT referrer_id, referee_id, created_at FROM referrals'
    );

    let processed = 0;
    let totalAwarded = 0;

    for (const ref of referrals.rows) {
      // Find last reconciliation timestamp for this pair
      const lastReconciled = await pool.query(
        `SELECT MAX(created_at) as last_ts FROM points
         WHERE user_id = $1 AND reason = 'referral_earnings' AND reference_id = $2`,
        [ref.referrer_id, ref.referee_id]
      );
      const sinceTs = lastReconciled.rows[0]?.last_ts || ref.created_at;

      // Sum referee's earning-type points since last reconciliation
      // NOT IN exclusion = future-proof (captures any new earning reasons automatically)
      const earnings = await pool.query(
        `SELECT COALESCE(SUM(amount), 0)::integer as total FROM points
         WHERE user_id = $1
           AND reason NOT IN ('referral_earnings','referral_bonus','referee_welcome','manual_adjustment','streak_bonus')
           AND created_at > $2`,
        [ref.referee_id, sinceTs]
      );

      const earned = earnings.rows[0]?.total || 0;
      if (earned > 0) {
        const referralAmount = Math.floor(earned * POINTS.REFERRAL_PERCENTAGE);
        if (referralAmount > 0) {
          await pool.query(
            `INSERT INTO points (user_id, amount, reason, reference_id)
             VALUES ($1, $2, 'referral_earnings', $3)`,
            [ref.referrer_id, referralAmount, ref.referee_id]
          );
          totalAwarded += referralAmount;
        }
      }
      processed++;
    }

    return NextResponse.json({ processed, total_awarded: totalAwarded });
  } catch (err) {
    console.error('Referral reconciliation error:', err);
    return NextResponse.json<ApiError>({ error: 'Reconciliation failed' }, { status: 500 });
  }
}
