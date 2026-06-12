import { createGunzip } from 'zlib';
import { createInterface } from 'readline';
import { Readable, PassThrough } from 'stream';
import { pipeline } from 'stream/promises';
import pg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { latLngToCell } from 'h3-js';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  // Pre-flight size guard
  const preClient = await pool.connect();
  try {
    const r = await preClient.query(`SELECT pg_database_size(current_database()) AS bytes`);
    if (parseInt(r.rows[0].bytes) > 8_589_934_592) {
      console.error('[opencellid] HARD STOP: DB > 8 GB before import');
      process.exit(1);
    }
  } finally { preClient.release(); }

  // Truncate staging to ensure clean start (idempotent; guards against partial prior run)
  const cleanClient = await pool.connect();
  try { await cleanClient.query('TRUNCATE opencellid.towers_staging'); }
  finally { cleanClient.release(); }

  // Download gzipped CSV
  const token = process.env.OPENCELLID_TOKEN!;
  const url = `https://opencellid.org/ocid/downloads?token=${token}&type=full&file=cell_towers.csv.gz`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  // Parse header line to map fields BY NAME — real OpenCelliD CSV header:
  // radio,mcc,net,area,cell,unit,lon,lat,range,samples,changeable,created,updated,averageSignal
  // NOTE: 'net'=MNC, 'area'=LAC, 'cell'=CID — NOT 'mnc'/'lac'/'cid'
  let headers: string[] | null = null;
  let colRadio = -1, colMcc = -1, colMnc = -1, colLac = -1, colCid = -1;
  let colUnit = -1, colLon = -1, colLat = -1, colRange = -1, colSamples = -1;
  let colChangeable = -1, colCreated = -1, colUpdated = -1;
  let rowCount = 0;

  // Separate client for size-check queries (COPY client is in copy mode, can't query)
  const sizeClient = await pool.connect();
  const copyClient = await pool.connect();

  // COPY target includes h3_8 (14 cols), FORMAT CSV WITHOUT HEADER
  const copyStream = copyClient.query(copyFrom(
    `COPY opencellid.towers_staging
       (radio,mcc,mnc,lac,cid,unit,lon,lat,range,samples,changeable,created,updated,h3_8)
     FROM STDIN WITH (FORMAT CSV)`
  ));

  const passThrough = new PassThrough();
  const gunzip = createGunzip();

  const bodyStream = Readable.fromWeb(response.body as any);
  const lineReader = createInterface({ input: bodyStream.pipe(gunzip), crlfDelay: Infinity });

  const writePromise = pipeline(passThrough, copyStream);

  lineReader.on('line', async (line) => {
    if (headers === null) {
      // Consume header row, build alias-aware index map
      headers = line.split(',').map(h => h.trim());
      const col = (...names: string[]): number => { for (const n of names) { const i = headers!.indexOf(n); if (i >= 0) return i; } return -1; };
      colRadio = col('radio'); colMcc = col('mcc'); colMnc = col('mnc','net');
      colLac = col('lac','area'); colCid = col('cid','cell'); colUnit = col('unit');
      colLon = col('lon'); colLat = col('lat'); colRange = col('range');
      colSamples = col('samples'); colChangeable = col('changeable');
      colCreated = col('created'); colUpdated = col('updated');
      // FAIL-FAST: required columns must resolve — die in 1s, not after 40M-row COPY
      if ([colRadio, colMcc, colMnc, colLac, colCid, colLon, colLat].some(i => i < 0)) {
        console.error('[opencellid] FAIL-FAST: missing required column. Raw header:', line);
        process.exit(1);
      }
      return; // do not emit header to COPY stream
    }

    const fields = line.split(',');
    const get = (i: number) => fields[i] ?? '';
    const lat = parseFloat(get(colLat));
    const lon = parseFloat(get(colLon));
    if (isNaN(lat) || isNaN(lon)) return;

    // Compute h3_8 in-stream, emit as 14th column
    const h3_8 = latLngToCell(lat, lon, 8);
    const row = [
      get(colRadio), get(colMcc), get(colMnc), get(colLac), get(colCid),
      get(colUnit), get(colLon), get(colLat), get(colRange), get(colSamples),
      get(colChangeable), get(colCreated), get(colUpdated), h3_8,
    ].join(',');
    passThrough.write(row + '\n');

    rowCount++;
    // Size guard every 500k rows on separate client
    if (rowCount % 500_000 === 0) {
      const r = await sizeClient.query(`SELECT pg_database_size(current_database()) AS bytes`);
      if (parseInt(r.rows[0].bytes) > 8_589_934_592) {
        console.error(`[opencellid] HARD STOP at row ${rowCount}: DB > 8 GB`);
        passThrough.destroy();
        process.exit(1);
      }
      console.log(`[opencellid] ${rowCount} rows streamed...`);
    }
  });

  lineReader.on('close', () => passThrough.end());
  await writePromise;
  sizeClient.release();

  console.log(`[opencellid] COPY complete: ${rowCount} rows`);

  // OpenCelliD daily export includes cells observed in trailing 18 months
  // (~5.2M rows as of 2026-06); full historical DB (~45M) is not downloadable
  if (rowCount < 4_000_000) {
    console.error('[opencellid] ABORT: only ' + rowCount + ' rows — truncated download');
    process.exit(1);
  }

  // Try ADD PRIMARY KEY first; only dedupe if duplicate violation occurs
  try {
    await copyClient.query(
      `ALTER TABLE opencellid.towers_staging ADD PRIMARY KEY (radio,mcc,mnc,lac,cid)`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('duplicate key') && !msg.includes('unique')) throw err;
    console.log('[opencellid] Duplicates found, deduping...');
    await copyClient.query(`
      DELETE FROM opencellid.towers_staging a
      USING opencellid.towers_staging b
      WHERE a.ctid < b.ctid
        AND a.radio=b.radio AND a.mcc=b.mcc AND a.mnc=b.mnc
        AND a.lac=b.lac AND a.cid=b.cid
    `);
    await copyClient.query(
      `ALTER TABLE opencellid.towers_staging ADD PRIMARY KEY (radio,mcc,mnc,lac,cid)`
    );
  }

  await copyClient.query(`CREATE INDEX idx_staging_h3  ON opencellid.towers_staging(h3_8)`);
  await copyClient.query(`CREATE INDEX idx_staging_mcc ON opencellid.towers_staging(mcc)`);

  // Atomic swap
  await copyClient.query('BEGIN');
  await copyClient.query('ALTER TABLE opencellid.towers RENAME TO towers_old');
  await copyClient.query('ALTER TABLE opencellid.towers_staging RENAME TO towers');
  await copyClient.query('DROP TABLE opencellid.towers_old');
  await copyClient.query('COMMIT');

  // Recreate bare staging for next run
  await copyClient.query(`
    CREATE TABLE opencellid.towers_staging (
      radio text, mcc int, mnc int, lac int, cid bigint,
      unit int, lon double precision, lat double precision,
      range int, samples int, changeable int,
      created bigint, updated bigint, h3_8 text
    )
  `);

  copyClient.release();
  await pool.end();
  console.log(`[opencellid] import complete: ${rowCount} rows`);
}
main().catch(err => { console.error(err); process.exit(1); });
