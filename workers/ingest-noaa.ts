import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

const BASE = 'https://geodesy.noaa.gov/corsdata/coord/coord_20';

function parseDMS(deg: string, min: string, sec: string, dir: string): number {
  const d = Math.abs(parseFloat(deg));
  const m = parseFloat(min);
  const s = parseFloat(sec);
  const val = d + m / 60 + s / 3600;
  return (dir === 'S' || dir === 'W') ? -val : val;
}

async function fetchStation(id: string): Promise<{ id: string; name: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch(`${BASE}/${id}_20.coord.txt`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const text = await res.text();
    // Extract station name from line 2: "                COUNTY ENG OFFICE (ALLA),  ALABAMA"
    const nameMatch = text.match(/\n\s+([^\n]+)\(([A-Z0-9]+)\)/);
    const name = nameMatch ? nameMatch[1].trim() : id.toUpperCase();
    // Parse ITRF2020 lat/lon (first occurrence)
    const latMatch = text.match(/latitude\s*=\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([NS])/);
    const lonMatch = text.match(/longitude\s*=\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([EW])/);
    if (!latMatch || !lonMatch) return null;
    const lat = parseDMS(latMatch[1], latMatch[2], latMatch[3], latMatch[4]);
    const lon = parseDMS(lonMatch[1], lonMatch[2], lonMatch[3], lonMatch[4]);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { id: id.toUpperCase(), name, lat, lon };
  } catch {
    return null;
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false;

  async function tick() {
    // Step 1: get directory listing → extract station IDs
    let dirHtml: string;
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`noaa dir listing ${res.status}`);
      dirHtml = await res.text();
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      console.warn(`[noaa] skipped cycle: ${name === 'TimeoutError' ? 'timeout' : err}`);
      return;
    }

    // Extract station IDs from filenames like: href="ab02_20.coord.txt"
    const ids: string[] = [];
    for (const m of dirHtml.matchAll(/href="([a-z0-9]+)_20\.coord\.txt"/g)) {
      ids.push(m[1]);
    }
    console.log(`[noaa] discovered ${ids.length} stations`);
    if (ids.length === 0) { console.warn('[noaa] zero stations discovered — check endpoint'); return; }

    // Step 2: fetch all coord files in batches of 50
    const BATCH = 50;
    let count = 0;
    const client = await pool.connect();
    try {
      for (let i = 0; i < ids.length; i += BATCH) {
        const batch = ids.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(fetchStation));
        for (const s of results) {
          if (!s) continue;
          const h3_8 = latLngToCell(s.lat, s.lon, 8);
          await client.query(
            `INSERT INTO noaa_cors.stations (id,name,lon,lat,h3_8,updated_at)
             VALUES ($1,$2,$3,$4,$5,NOW())
             ON CONFLICT (id) DO UPDATE SET name=$2,lon=$3,lat=$4,h3_8=$5,updated_at=NOW()`,
            [s.id, s.name, s.lon, s.lat, h3_8]
          );
          count++;
        }
        if ((i / BATCH) % 10 === 0) console.log(`[noaa] ${i}/${ids.length} processed...`);
      }
      console.log(`[noaa] tick complete: ${count} stations upserted`);
    } finally { client.release(); }
    if (count === 0) console.warn('[noaa] zero stations upserted — check parsing');
  }

  await tick();
  setInterval(async () => {
    if (ticking) { console.warn('[noaa] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 7 * 24 * 3_600_000); // weekly
}
main().catch(err => { console.error(err); process.exit(1); });
