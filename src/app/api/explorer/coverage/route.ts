import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { latLngToCell, cellToBoundary } from 'h3-js';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { data: GeoJSON.FeatureCollection; ts: number }>();
const CACHE_TTL: Record<string, number> = {
  '':          60_000,
  opencellid: 300_000,
  adsb:        60_000,
  ais:         60_000,
  noaa_cors:  300_000,
  rtk2go:     300_000,
  ttn:        300_000,
};
const VALID_LAYERS = new Set(['opencellid','adsb','ais','noaa_cors','rtk2go','ttn']);

export async function GET(request: NextRequest) {
  const layer = new URL(request.url).searchParams.get('layer') ?? '';

  if (layer && !VALID_LAYERS.has(layer)) {
    return NextResponse.json({ error: 'Unknown layer' }, { status: 400 });
  }

  const ttl = CACHE_TTL[layer] ?? 60_000;
  const cached = cache.get(layer);
  if (cached && Date.now() - cached.ts < ttl) {
    return NextResponse.json(cached.data, { headers: { 'Cache-Control': 'public, max-age=60' } });
  }

  if (!layer) {
    // First-party coverage — queries public.observations
    try {
      const result = await pool.query(`
        SELECT
          o.node_id,
          o.latitude,
          o.longitude,
          o.signal_type,
          o.signal_strength_dbm
        FROM observations o
        WHERE o.latitude IS NOT NULL AND o.longitude IS NOT NULL
      `);

      const hexMap = new Map<
        string,
        {
          observation_count: number;
          signal_types: Set<string>;
          total_strength: number;
          strength_count: number;
          contributors: Set<string>;
        }
      >();

      for (const row of result.rows) {
        const h3Index = latLngToCell(row.latitude, row.longitude, 8);
        let hex = hexMap.get(h3Index);
        if (!hex) {
          hex = {
            observation_count: 0,
            signal_types: new Set(),
            total_strength: 0,
            strength_count: 0,
            contributors: new Set(),
          };
          hexMap.set(h3Index, hex);
        }
        hex.observation_count++;
        hex.signal_types.add(row.signal_type);
        if (row.signal_strength_dbm != null) {
          hex.total_strength += row.signal_strength_dbm;
          hex.strength_count++;
        }
        hex.contributors.add(row.node_id);
      }

      const features: GeoJSON.Feature[] = [];
      for (const [h3Index, hex] of hexMap) {
        const boundary = cellToBoundary(h3Index);
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [...boundary.map(([lat, lng]) => [lng, lat]), [boundary[0][1], boundary[0][0]]],
            ],
          },
          properties: {
            h3_index: h3Index,
            observation_count: hex.observation_count,
            signal_types: Array.from(hex.signal_types),
            avg_signal_strength:
              hex.strength_count > 0
                ? Math.round(hex.total_strength / hex.strength_count)
                : null,
            contributor_count: hex.contributors.size,
          },
        });
      }

      const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
      cache.set('', { data: geojson, ts: Date.now() });
      return NextResponse.json(geojson, { headers: { 'Cache-Control': 'public, max-age=60' } });
    } catch (err) {
      console.error('[explorer/coverage] Error:', err);
      return NextResponse.json({ error: 'Failed to fetch coverage' }, { status: 500 });
    }
  }

  // Third-party layer queries
  try {
    let rows: { h3_8: string; count: number }[] = [];

    if (layer === 'opencellid') {
      const r = await pool.query(
        `SELECT h3_8, COUNT(*)::int AS count
         FROM opencellid.towers WHERE h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    } else if (layer === 'adsb') {
      const r = await pool.query(
        `SELECT h3_8, SUM(aircraft_count)::int AS count
         FROM adsb.hex_daily
         WHERE observation_date >= NOW() - INTERVAL '30 days' AND h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    } else if (layer === 'ais') {
      const r = await pool.query(
        `SELECT h3_8, SUM(vessel_count)::int AS count
         FROM ais.hex_daily
         WHERE observation_date >= NOW() - INTERVAL '30 days' AND h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    } else if (layer === 'noaa_cors') {
      const r = await pool.query(
        `SELECT h3_8, COUNT(*)::int AS count
         FROM noaa_cors.stations WHERE h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    } else if (layer === 'rtk2go') {
      const r = await pool.query(
        `SELECT h3_8, COUNT(*)::int AS count
         FROM rtk2go.mountpoints WHERE h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    } else if (layer === 'ttn') {
      const r = await pool.query(
        `SELECT h3_8, COUNT(*)::int AS count
         FROM ttn.gateways WHERE h3_8 IS NOT NULL
         GROUP BY h3_8 ORDER BY count DESC LIMIT 50000`
      );
      rows = r.rows;
    }

    const features: GeoJSON.Feature[] = rows.map(({ h3_8, count }) => {
      const boundary = cellToBoundary(h3_8);
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...boundary.map(([lat, lng]) => [lng, lat]), [boundary[0][1], boundary[0][0]]]],
        },
        properties: {
          h3_index: h3_8,
          observation_count: count,
          signal_types: [],
          avg_signal_strength: null,
          contributor_count: 0,
        },
      };
    });

    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
    cache.set(layer, { data: geojson, ts: Date.now() });
    return NextResponse.json(geojson, { headers: { 'Cache-Control': 'public, max-age=60' } });

  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('does not exist') || err.message.includes('relation'))) {
      const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
      return NextResponse.json(empty);
    }
    console.error(`[explorer/coverage?layer=${layer}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch coverage' }, { status: 500 });
  }
}
