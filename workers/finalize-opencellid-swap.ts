import pg from 'pg';

// One-shot script: finalize an existing towers_staging into towers.
// No download — operates on data already in staging from a prior import run.

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const ts = Math.floor(Date.now() / 1000);

  // 1. Verify staging row count
  const client = await pool.connect();
  try {
    const countRes = await client.query('SELECT COUNT(*)::int AS c FROM opencellid.towers_staging');
    const rowCount = countRes.rows[0].c;
    console.log(`[finalize] staging rows: ${rowCount}`);
    if (rowCount < 4_000_000) {
      console.error(`[finalize] ABORT: only ${rowCount} rows in staging (floor=4M)`);
      process.exit(1);
    }

    // 2. Verify h3_8 NULLs
    const nullRes = await client.query('SELECT COUNT(*)::int AS c FROM opencellid.towers_staging WHERE h3_8 IS NULL');
    const nullCount = nullRes.rows[0].c;
    console.log(`[finalize] h3_8 NULLs: ${nullCount}`);
    if (nullCount > 0) {
      console.error(`[finalize] ABORT: ${nullCount} rows with NULL h3_8`);
      process.exit(1);
    }

    // 3. Dedupe + PK + indexes — OUTSIDE transaction so failure leaves live towers untouched
    try {
      await client.query('ALTER TABLE opencellid.towers_staging ADD PRIMARY KEY (radio,mcc,mnc,lac,cid)');
      console.log('[finalize] PK added (no duplicates)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('duplicate key') && !msg.includes('unique')) throw err;
      console.log('[finalize] Duplicates found, deduping...');
      const dedup = await client.query(`
        DELETE FROM opencellid.towers_staging a
        USING opencellid.towers_staging b
        WHERE a.ctid < b.ctid
          AND a.radio=b.radio AND a.mcc=b.mcc AND a.mnc=b.mnc
          AND a.lac=b.lac AND a.cid=b.cid
      `);
      console.log(`[finalize] Dedupe removed ${dedup.rowCount} rows`);
      await client.query('ALTER TABLE opencellid.towers_staging ADD PRIMARY KEY (radio,mcc,mnc,lac,cid)');
      console.log('[finalize] PK added after dedupe');
    }

    await client.query('CREATE INDEX IF NOT EXISTS idx_staging_h3  ON opencellid.towers_staging(h3_8)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_staging_mcc ON opencellid.towers_staging(mcc)');
    console.log('[finalize] Indexes created');

    // 4. Swap transaction
    await client.query('BEGIN');
    await client.query(`ALTER TABLE opencellid.towers RENAME TO towers_pre_swap_${ts}`);
    await client.query('ALTER TABLE opencellid.towers_staging RENAME TO towers');
    await client.query('COMMIT');
    console.log(`[finalize] Swap complete. Old table: opencellid.towers_pre_swap_${ts}`);

    // 5. Recreate empty staging
    await client.query(`
      CREATE TABLE opencellid.towers_staging (
        radio text, mcc int, mnc int, lac int, cid bigint,
        unit int, lon double precision, lat double precision,
        range int, samples int, changeable int,
        created bigint, updated bigint, h3_8 text
      )
    `);
    console.log('[finalize] Empty staging recreated');

    // 6. Final counts
    const finalCount = await client.query('SELECT COUNT(*)::int AS c FROM opencellid.towers');
    const hexCount = await client.query('SELECT COUNT(DISTINCT h3_8)::int AS c FROM opencellid.towers WHERE h3_8 IS NOT NULL');
    console.log(`[finalize] DONE: towers=${finalCount.rows[0].c} rows, ${hexCount.rows[0].c} distinct hexes`);
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(err => { console.error(err); process.exit(1); });
