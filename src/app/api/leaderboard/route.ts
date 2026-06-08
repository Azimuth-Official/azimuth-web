import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { LeaderboardResponse, LeaderboardEntry, ApiError } from '@/lib/types';
import { generateAnimalName } from '@/lib/animal-names';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const period = request.nextUrl.searchParams.get('period') ?? 'alltime';
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') ?? '50', 10) || 50,
      100,
    );

    // Build period filter
    let periodFilter = '';
    if (period === 'daily') {
      periodFilter = "AND p.created_at > NOW() - INTERVAL '24 hours'";
    } else if (period === 'weekly') {
      periodFilter = "AND p.created_at > NOW() - INTERVAL '7 days'";
    }
    // alltime: no filter

    // Query leaderboard with period filter
    const query = `
      SELECT u.id,
             COALESCE(SUM(p.amount), 0)::integer as points,
             COUNT(DISTINCT o.id)::integer as observation_count,
             ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(p.amount), 0) DESC) as rank
      FROM users u
      LEFT JOIN points p ON p.user_id = u.id ${periodFilter}
      LEFT JOIN nodes n ON n.user_id = u.id
      LEFT JOIN observations o ON o.node_id = n.id
      GROUP BY u.id
      HAVING COALESCE(SUM(p.amount), 0) > 0
      ORDER BY points DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    const entries: LeaderboardEntry[] = result.rows.map((row) => ({
      rank: row.rank,
      animal_name: generateAnimalName(row.id),
      points: row.points,
      observation_count: row.observation_count,
    }));

    // Get total participants for this period
    const countQuery = `
      SELECT COUNT(DISTINCT u.id)::integer as total
      FROM users u
      LEFT JOIN points p ON p.user_id = u.id ${periodFilter}
      GROUP BY u.id
      HAVING COALESCE(SUM(p.amount), 0) > 0
    `;

    const countResult = await pool.query(countQuery);
    const totalParticipants = countResult.rows.length;

    return NextResponse.json<LeaderboardResponse>(
      {
        period,
        entries,
        total_participants: totalParticipants,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}
