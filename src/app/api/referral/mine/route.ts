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

    // Get referral entries with per-referee earnings
    const referralEntriesResult = await pool.query(
      `SELECT u.id as referee_id, u.created_at as joined_at,
              COALESCE(p_earnings.total, 0)::integer as earnings_from_referee
       FROM users u
       LEFT JOIN (
         SELECT reference_id, SUM(amount) as total
         FROM points
         WHERE user_id = $1 AND reason = 'referral_earnings'
         GROUP BY reference_id
       ) p_earnings ON p_earnings.reference_id = u.id::text
       WHERE u.referred_by = $1
       ORDER BY u.created_at DESC`,
      [auth.user_id],
    );

    const referralCount = referralEntriesResult.rows.length;

    const referrals: ReferralEntry[] = referralEntriesResult.rows.map((row) => ({
      referee_id: row.referee_id,
      earnings_from_referee: row.earnings_from_referee,
      joined_at: row.joined_at,
    }));

    // Get total earnings from referrals
    const earningsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::integer as total
       FROM points
       WHERE user_id = $1 AND reason = 'referral_earnings'`,
      [auth.user_id],
    );

    const totalEarnings = earningsResult.rows[0]?.total ?? 0;

    return NextResponse.json<ReferralResponse>(
      {
        referral_code: referralCode,
        referral_count: referralCount,
        total_earnings: totalEarnings,
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
