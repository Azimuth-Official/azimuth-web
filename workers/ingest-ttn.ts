import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ticking = false; // FIX overlap guard

  async function tick() {
    let gateways: any[];
    try {
      // FIX fetch timeout: 30s; URL confirmed via Packetbroker discovery
      const res = await fetch('https://mapper.packetbroker.net/api/v2/gateways', { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`ttn fetch ${res.status}`);
      gateways = await res.json();
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      console.warn(`[ttn] skipped cycle: ${name === 'TimeoutError' ? 'timeout' : err}`);
      return;
    }
    const client = await pool.connect();
    try {
      for (const gw of gateways) {
        const lat = gw.location?.latitude;
        const lon = gw.location?.longitude;
        if (lat == null || lon == null) continue;
        const h3_8 = latLngToCell(lat, lon, 8);
        await client.query(
          `INSERT INTO ttn.gateways (gateway_id,lon,lat,h3_8,updated_at)
           VALUES ($1,$2,$3,$4,NOW())
           ON CONFLICT (gateway_id) DO UPDATE SET lon=$2,lat=$3,h3_8=$4,updated_at=NOW()`,
          [gw.gatewayId ?? gw.gateway_id, lon, lat, h3_8]
        );
      }
    } finally { client.release(); }
  }

  await tick();
  // FIX overlap guard
  setInterval(async () => {
    if (ticking) { console.warn('[ttn] skipping cycle: previous tick still running'); return; }
    ticking = true;
    try { await tick(); } finally { ticking = false; }
  }, 6 * 3_600_000); // 6-hourly
}
main().catch(err => { console.error(err); process.exit(1); });
