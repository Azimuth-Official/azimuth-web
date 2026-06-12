import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

// adsb.lol global coverage — 15 strategic boxes at dist=2000nm, dedup by ICAO hex
// Attribution: adsb.lol (ODbL)

const BOXES = [
  {lat:40,lon:-100},{lat:55,lon:-90},{lat:-15,lon:-55},
  {lat:50,lon:10},{lat:60,lon:25},{lat:0,lon:20},{lat:-25,lon:25},
  {lat:30,lon:50},{lat:35,lon:90},{lat:35,lon:120},{lat:50,lon:110},
  {lat:0,lon:110},{lat:-30,lon:135},{lat:75,lon:0},{lat:-60,lon:0},
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false;

  async function tick() {
    const seen = new Set<string>(); // dedup by ICAO hex across box queries
    const hexCounts = new Map<string, { aircraft_count: number; message_count: number }>();
    for (const box of BOXES) {
      try {
        const res = await fetch(
          `https://api.adsb.lol/v2/lat/${box.lat}/lon/${box.lon}/dist/2000`,
          { signal: AbortSignal.timeout(30_000), headers: { 'User-Agent': 'AzimuthObserver/1.0 (+https://azimuth.day)' } }
        );
        if (!res.ok) { console.warn(`[adsb] box ${box.lat},${box.lon} status ${res.status}`); continue; }
        const data = (await res.json()).ac ?? [];
        for (const ac of data) {
          if (ac.lat == null || ac.lon == null) continue;
          if (ac.hex && seen.has(ac.hex)) continue;
          if (ac.hex) seen.add(ac.hex);
          const h3 = latLngToCell(ac.lat, ac.lon, 8);
          const e = hexCounts.get(h3) ?? { aircraft_count: 0, message_count: 0 };
          e.aircraft_count++;
          e.message_count += ac.messages ?? 1;
          hexCounts.set(h3, e);
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : '';
        console.warn(`[adsb] box ${box.lat},${box.lon} skipped: ${name === 'TimeoutError' ? 'timeout' : err}`);
      }
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
          `INSERT INTO adsb.hex_daily (h3_8,observation_date,aircraft_count,message_count) VALUES ${placeholders}
           ON CONFLICT (h3_8,observation_date) DO UPDATE SET
             aircraft_count = adsb.hex_daily.aircraft_count + EXCLUDED.aircraft_count,
             message_count  = adsb.hex_daily.message_count  + EXCLUDED.message_count,
             updated_at     = NOW()`,
          values
        );
      }
      await client.query(`DELETE FROM adsb.hex_daily WHERE observation_date < NOW() - INTERVAL '30 days'`);
      console.log(`[adsb] tick complete: ${hexCounts.size} hexes, ${seen.size} unique aircraft`);
    } finally { client.release(); }
  }

  await tick();
  setInterval(async () => {
    if (ticking) { console.warn('[adsb] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 60_000);
}
main().catch(err => { console.error(err); process.exit(1); });
