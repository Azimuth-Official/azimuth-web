import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

// NEVER store/relay correction-stream content — ToS
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false; // FIX overlap guard

  async function tick() {
    let text: string;
    try {
      // FIX fetch timeout: 30s
      const res = await fetch('http://rtk2go.com:2101', { signal: AbortSignal.timeout(30_000) });
      text = await res.text();
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      console.warn(`[rtk] skipped cycle: ${name === 'TimeoutError' ? 'timeout' : err}`);
      return;
    }
    const client = await pool.connect();
    try {
      for (const line of text.split('\n')) {
        if (!line.startsWith('STR;')) continue;
        const parts = line.split(';');
        // STR;mountpoint;identifier;format;format-details;carrier;nav-system;network;country;lat;lon;...
        const name       = parts[1]?.trim();
        const identifier = parts[2]?.trim();
        const format     = parts[3]?.trim();
        const carrier    = parseInt(parts[5]) || 0;
        const lat        = parseFloat(parts[9]);
        const lon        = parseFloat(parts[10]);
        const country    = parts[8]?.trim() || null;
        if (!name || isNaN(lat) || isNaN(lon)) continue;
        const h3_8 = latLngToCell(lat, lon, 8);
        await client.query(
          `INSERT INTO rtk2go.mountpoints (name,identifier,format,carrier,lon,lat,h3_8,country,last_seen)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
           ON CONFLICT (name) DO UPDATE SET
             identifier=$2,format=$3,carrier=$4,lon=$5,lat=$6,h3_8=$7,country=$8,last_seen=NOW()`,
          [name, identifier, format, carrier, lon, lat, h3_8, country]
        );
      }
    } finally { client.release(); }
  }

  await tick();
  // FIX overlap guard: skip cycle if previous tick still running
  setInterval(async () => {
    if (ticking) { console.warn('[rtk] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 3_600_000); // hourly
}
main().catch(err => { console.error(err); process.exit(1); });
