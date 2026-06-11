import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false; // FIX overlap guard

  async function tick() {
    let stations: any[];
    try {
      // FIX fetch timeout: 30s; URL confirmed via NOAA discovery
      const res = await fetch('https://geodesy.noaa.gov/api/ncat/cors', { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`noaa fetch ${res.status}`);
      stations = await res.json();
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      console.warn(`[noaa] skipped cycle: ${name === 'TimeoutError' ? 'timeout' : err}`);
      return;
    }
    const client = await pool.connect();
    try {
      for (const s of stations) {
        if (s.lat == null || s.lon == null) continue;
        const h3_8 = latLngToCell(s.lat, s.lon, 8);
        await client.query(
          `INSERT INTO noaa_cors.stations (id,name,lon,lat,h3_8,state,updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())
           ON CONFLICT (id) DO UPDATE SET name=$2,lon=$3,lat=$4,h3_8=$5,state=$6,updated_at=NOW()`,
          [s.id, s.name, s.lon, s.lat, h3_8, s.state ?? null]
        );
      }
    } finally { client.release(); }
  }

  await tick();
  // FIX overlap guard
  setInterval(async () => {
    if (ticking) { console.warn('[noaa] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 7 * 24 * 3_600_000); // weekly
}
main().catch(err => { console.error(err); process.exit(1); });
