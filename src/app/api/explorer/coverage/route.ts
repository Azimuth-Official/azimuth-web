import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { latLngToCell, cellToBoundary } from 'h3-js';

export const dynamic = 'force-dynamic';

let cache: { data: GeoJSON.FeatureCollection; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, max-age=60' },
      });
    }

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

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    cache = { data: geojson, ts: Date.now() };

    return NextResponse.json(geojson, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error('[explorer/coverage] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch coverage' },
      { status: 500 },
    );
  }
}
