import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ReferralResponse, ReferralEntry, ApiError } from '@/lib/types';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    // Get user's referral code
    const userResult = await pool.query(
      'SELECT referral_code FROM users WHERE id = $1',
      [auth.user_id],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const referralCode = userResult.rows[0].referral_code ?? null;

    // Get referral entries (users who registered with this code)
    const referralsResult = await pool.query(
      `SELECT u.id as referee_id, u.created_at
       FROM users u
       WHERE u.referred_by = $1
       ORDER BY u.created_at DESC`,
      [auth.user_id],
    );

    const referralCount = referralsResult.rows.length;

    // Get referral entries with bonus_awarded status
    const referralEntriesResult = await pool.query(
      `SELECT u.id as referee_id, u.created_at,
              CASE WHEN p.id IS NOT NULL THEN true ELSE false END as bonus_awarded
       FROM users u
       LEFT JOIN points p ON p.user_id = $1 AND p.reason = 'referral_bonus' AND p.reference_id = u.id
       WHERE u.referred_by = $1
       ORDER BY u.created_at DESC`,
      [auth.user_id],
    );

    const referrals: ReferralEntry[] = referralEntriesResult.rows.map((row) => ({
      referee_id: row.referee_id,
      created_at: row.created_at,
      bonus_awarded: row.bonus_awarded,
    }));

    // Get total bonus points earned from referrals
    const bonusResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::integer as total
       FROM points
       WHERE user_id = $1 AND reason = 'referral_bonus'`,
      [auth.user_id],
    );

    const totalBonusPoints = bonusResult.rows[0]?.total ?? 0;

    return NextResponse.json<ReferralResponse>(
      {
        referral_code: referralCode,
        referral_count: referralCount,
        total_bonus_points: totalBonusPoints,
        referrals,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Referral fetch error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch referral data' },
      { status: 500 },
    );
  }
}
