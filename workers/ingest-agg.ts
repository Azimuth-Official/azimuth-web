import { Pool } from 'pg';
import { cellToParent } from 'h3-js';

// Pre-aggregate res-8 hexes to res-6 for opencellid and ttn coverage layers.
// Runs every 6h (or once with AGG_ONCE=1).

const LAYERS: { schema: string; table: string }[] = [
  { schema: 'opencellid', table: 'towers' },
  { schema: 'ttn', table: 'gateways' },
];

async function cycle(pool: Pool) {
  const client = await pool.connect();
  try {
    for (const { schema, table } of LAYERS) {
      // Ensure target table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.hex6_counts (
          h3_6 text PRIMARY KEY,
          count int NOT NULL,
          built_at timestamptz NOT NULL DEFAULT NOW()
        )
      `);

      // Read all res-8 hexes
      const { rows } = await client.query(
        `SELECT h3_8, COUNT(*)::int AS count FROM ${schema}.${table} WHERE h3_8 IS NOT NULL GROUP BY h3_8`
      );

      // Aggregate to res-6 in Node
      const res6 = new Map<string, number>();
      for (const { h3_8, count } of rows) {
        try {
          const parent = cellToParent(h3_8, 6);
          res6.set(parent, (res6.get(parent) || 0) + count);
        } catch { /* skip invalid hex */ }
      }

      // Write atomically
      await client.query('BEGIN');
      await client.query(`TRUNCATE ${schema}.hex6_counts`);
      const entries = Array.from(res6.entries());
      for (let i = 0; i < entries.length; i += 500) {
        const chunk = entries.slice(i, i + 500);
        const values: unknown[] = [];
        const placeholders = chunk.map(([h3_6, count], idx) => {
          const base = idx * 3;
          values.push(h3_6, count, new Date());
          return `($${base + 1},$${base + 2},$${base + 3})`;
        }).join(',');
        await client.query(
          `INSERT INTO ${schema}.hex6_counts (h3_6,count,built_at) VALUES ${placeholders}`,
          values
        );
      }
      await client.query('COMMIT');
      console.log(`[agg] ${schema}: ${res6.size} res-6 cells from ${rows.length} res-8 hexes`);
    }
  } finally {
    client.release();
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await cycle(pool);
  if (process.env.AGG_ONCE === '1') {
    console.log('[agg] AGG_ONCE=1, exiting');
    await pool.end();
    return;
  }
  setInterval(async () => {
    try { await cycle(pool); } catch (err) { console.error('[agg] cycle error:', err); }
  }, 6 * 3_600_000);
}
main().catch(err => { console.error(err); process.exit(1); });
