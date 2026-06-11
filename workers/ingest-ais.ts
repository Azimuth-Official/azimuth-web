import WebSocket from 'ws';
import { Pool } from 'pg';
import { latLngToCell } from 'h3-js';

// density layer — counts observations, not unique craft
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const hexCounts = new Map<string, { vessel_count: number; message_count: number }>();
  let reconnectCount = 0;
  let reconnectWindowStart = Date.now();
  let backoffMs = 1000;
  let flushing = false; // FIX 5: guard against overlapping flushes

  function connect() {
    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream', {
      headers: { APIKey: process.env.AISSTREAM_API_KEY! }
    });

    ws.on('open', () => {
      backoffMs = 1000; // FIX 5: reset backoff on successful open
      // AISstream requires a subscribe message after open — without it the server closes immediately
      ws.send(JSON.stringify({
        APIKey: process.env.AISSTREAM_API_KEY!,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
      }));
    });

    ws.on('error', err => {
      console.error('[ais] ws error:', err); // FIX 5: prevent unhandled crash
    });

    ws.on('message', raw => {
      const msg = JSON.parse(raw.toString());
      const lat = msg?.MetaData?.latitude;
      const lon = msg?.MetaData?.longitude;
      if (lat == null || lon == null) return;
      const h3 = latLngToCell(lat, lon, 8);
      const e = hexCounts.get(h3) ?? { vessel_count: 0, message_count: 0 };
      e.vessel_count++; e.message_count++;
      hexCounts.set(h3, e);
    });

    ws.on('close', () => {
      const now = Date.now();
      if (now - reconnectWindowStart > 3_600_000) {
        reconnectCount = 0;
        reconnectWindowStart = now;
      }
      reconnectCount++;
      if (reconnectCount > 10) console.warn('[ais] degraded: >10 reconnects/hour');
      const jitter = Math.random() * 0.3 * backoffMs;
      const delay = backoffMs + jitter;
      backoffMs = Math.min(backoffMs * 2, 120_000);
      setTimeout(connect, delay);
    });
  }

  // FIX 5: overlap guard; FIX 6: batched upserts
  setInterval(async () => {
    if (flushing || hexCounts.size === 0) return;
    flushing = true;
    const snapshot = new Map(hexCounts);
    hexCounts.clear();
    const today = new Date().toISOString().slice(0, 10);
    const client = await pool.connect();
    try {
      const entries = Array.from(snapshot.entries());
      for (let i = 0; i < entries.length; i += 500) {
        const chunk = entries.slice(i, i + 500);
        const values: unknown[] = [];
        const placeholders = chunk.map(([h3_8, c], idx) => {
          const base = idx * 4;
          values.push(h3_8, today, c.vessel_count, c.message_count);
          return `($${base+1},$${base+2},$${base+3},$${base+4})`;
        }).join(',');
        await client.query(
          `INSERT INTO ais.hex_daily (h3_8,observation_date,vessel_count,message_count)
           VALUES ${placeholders}
           ON CONFLICT (h3_8,observation_date) DO UPDATE SET
             vessel_count  = ais.hex_daily.vessel_count  + EXCLUDED.vessel_count,
             message_count = ais.hex_daily.message_count + EXCLUDED.message_count,
             updated_at    = NOW()`,
          values
        );
      }
      await client.query(
        `DELETE FROM ais.hex_daily WHERE observation_date < NOW() - INTERVAL '30 days'`
      );
    } finally { client.release(); flushing = false; }
  }, 60_000);

  connect();
}
main().catch(err => { console.error(err); process.exit(1); });
