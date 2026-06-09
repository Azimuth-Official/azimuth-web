import { randomBytes } from 'crypto';
import { Pool } from 'pg';
import { POINTS } from './points';

/**
 * Generate an 8-character uppercase alphanumeric referral code.
 */
export function generateReferralCode(): string {
  const bytes = randomBytes(6); // 6 bytes = 48 bits
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += bytes[i].toString(16).padStart(2, '0');
  }
  return code.substring(0, 8).toUpperCase();
}

/**
 * Process a referral code during user registration.
 * Awards bonus points to referrer and referee if the code is valid.
 *
 * @param pool - Database connection pool
 * @param referralCode - Referral code provided by new user
 * @param newUserId - UUID of the newly registered user
 * @returns true if referral was processed, false if code invalid
 */
export async function processReferral(
  pool: Pool,
  referralCode: string,
  newUserId: string,
): Promise<boolean> {
  // Look up referrer by referral code
  const referrerResult = await pool.query(
    'SELECT id FROM users WHERE referral_code = $1',
    [referralCode],
  );

  if (referrerResult.rows.length === 0) {
    // Invalid code
    return false;
  }

  const referrerId = referrerResult.rows[0].id;

  // Award points to referrer
  await pool.query(
    `INSERT INTO points (user_id, amount, reason, reference_id)
     VALUES ($1, $2, $3, $4)`,
    [referrerId, POINTS.REFERRAL_BONUS, 'referral_bonus', newUserId],
  );

  // Award points to referee (welcome bonus)
  await pool.query(
    `INSERT INTO points (user_id, amount, reason, reference_id)
     VALUES ($1, $2, $3, $4)`,
    [newUserId, POINTS.REFEREE_WELCOME, 'referee_welcome', referrerId],
  );

  // Set referred_by on new user
  await pool.query(
    'UPDATE users SET referred_by = $1 WHERE id = $2',
    [referrerId, newUserId],
  );

  // Record in referrals table
  await pool.query(
    `INSERT INTO referrals (referrer_id, referee_id, bonus_awarded)
     VALUES ($1, $2, true)`,
    [referrerId, newUserId],
  );

  return true;
}
