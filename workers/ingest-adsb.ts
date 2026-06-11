import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

// OpenSky Network anonymous API — 400 credits/day, 10s resolution
// 5-min interval = 288/day → stays within anonymous limit
// States array indices: [0]=icao24, [5]=lon, [6]=lat, [8]=on_ground

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false;

  async function tick() {
    let states: any[][] | null;
    try {
      const res = await fetch(
        'https://opensky-network.org/api/states/all',
        { signal: AbortSignal.timeout(30_000) }
      );
      if (!res.ok) { console.warn(`[adsb] opensky status ${res.status}`); return; }
      const body = await res.json();
      states = body.states ?? null;
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      console.warn(`[adsb] skipped cycle: ${name === 'TimeoutError' ? 'timeout' : err}`);
      return;
    }
    if (!states || states.length === 0) { console.warn('[adsb] empty snapshot'); return; }

    const hexCounts = new Map<string, { aircraft_count: number; message_count: number }>();
    for (const ac of states) {
      const lon = ac[5];
      const lat = ac[6];
      if (lon == null || lat == null) continue;
      const h3 = latLngToCell(lat, lon, 8);
      const e = hexCounts.get(h3) ?? { aircraft_count: 0, message_count: 0 };
      e.aircraft_count++;
      e.message_count++;
      hexCounts.set(h3, e);
    }
    if (hexCounts.size === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const entries = Array.from(hexCounts.entries());
    const client = await pool.connect();
    try {
      for (let i = 0; i < entries.length; i += 500) {
        const chunk = entries.slice(i, i + 500);
        const values: unknown[] = [];
        const placeholders = chunk.map(([h3_8, c], idx) => {
          const base = idx * 4;
          values.push(h3_8, today, c.aircraft_count, c.message_count);
          return `($${base+1},$${base+2},$${base+3},$${base+4})`;
        }).join(',');
        await client.query(
          `INSERT INTO adsb.hex_daily (h3_8,observation_date,aircraft_count,message_count)
           VALUES ${placeholders}
           ON CONFLICT (h3_8,observation_date) DO UPDATE SET
             aircraft_count = adsb.hex_daily.aircraft_count + EXCLUDED.aircraft_count,
             message_count  = adsb.hex_daily.message_count  + EXCLUDED.message_count,
             updated_at     = NOW()`,
          values
        );
      }
      await client.query(
        `DELETE FROM adsb.hex_daily WHERE observation_date < NOW() - INTERVAL '30 days'`
      );
      console.log(`[adsb] tick complete: ${hexCounts.size} hexes, ${states.length} aircraft`);
    } finally { client.release(); }
  }

  await tick();
  // 5-min interval — anonymous OpenSky limit is 400/day; 288 calls/day stays within limit
  setInterval(async () => {
    if (ticking) { console.warn('[adsb] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 5 * 60_000);
}
main().catch(err => { console.error(err); process.exit(1); });
