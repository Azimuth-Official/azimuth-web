import { Pool, PoolClient } from 'pg';

export interface RewardBreakdown {
  base: number;
  collision_gate: number;
  tier_saturation: number;
  hex_freshness: number | null;
  hex_density_cap: number | null;
  rtk_bonus: number;
  final: number;
  suppression_reason: string | null;
}

// --- Config cache ---
let configCache: Map<string, number> = new Map();
let configCacheExpiry = 0;

// --- Tier count cache ---
let tierCountCache: Map<number, number> = new Map();
let tierCountCacheExpiry = 0;

function getDefaultConfig(): Map<string, number> {
  return new Map<string, number>([
    ['collision_window_minutes', 30],
    ['saturation_k_tier0', 0.50], ['saturation_k_tier1', 0.30],
    ['saturation_k_tier2', 0.15], ['saturation_k_tier3', 0.10],
    ['saturation_cache_ttl_seconds', 300],
    ['freshness_virgin_multiplier', 3.0], ['freshness_30d_multiplier', 2.0],
    ['freshness_7d_multiplier', 1.5], ['freshness_24h_multiplier', 1.0],
    ['freshness_recent_multiplier', 0.25], ['freshness_saturated_multiplier', 0.10],
    ['freshness_threshold_saturated', 60], ['freshness_threshold_recent', 1440],
    ['freshness_threshold_baseline', 10080], ['freshness_threshold_aging', 43200],
    ['density_cap_hard_limit', 10],
    ['base_points_tier0', 1], ['base_points_tier1', 3],
    ['base_points_tier2', 8], ['base_points_tier3', 15],
  ]);
}

async function loadConfig(pool: Pool | PoolClient): Promise<Map<string, number>> {
  const now = Date.now();
  if (configCache.size > 0 && now < configCacheExpiry) return configCache;
  try {
    const result = await pool.query('SELECT key, value FROM reward_config');
    const c = new Map<string, number>();
    for (const row of result.rows) c.set(row.key, parseFloat(row.value));
    configCache = c;
    const ttl = c.get('saturation_cache_ttl_seconds') || 300;
    configCacheExpiry = now + ttl * 1000;
    return c;
  } catch {
    return getDefaultConfig();
  }
}

function cfg(config: Map<string, number>, key: string, fallback: number): number {
  return config.get(key) ?? fallback;
}

// System 1: Tier 0 hex collision detection
async function checkCollision(
  client: PoolClient,
  config: Map<string, number>,
  hexIndex: string | null,
  nodeId: string,
  isTier0: boolean,
): Promise<{ gate: number; reason: string | null }> {
  if (!isTier0 || !hexIndex) return { gate: 1.0, reason: null };
  const window = cfg(config, 'collision_window_minutes', 30);
  const result = await client.query(
    `SELECT o.node_id FROM observations o
     WHERE o.h3_index = $1
       AND o.node_id != $2
       AND o.signal_type IN ('cell_lte','cell_nr','gnss_raw','wifi_survey','wifi_rtt')
       AND o.created_at > NOW() - make_interval(mins := $3)
       AND EXISTS (
         SELECT 1 FROM nodes n WHERE n.id = o.node_id AND n.hardware_type = 'tier0_mobile'
       )
     LIMIT 1`,
    [hexIndex, nodeId, window],
  );
  if (result.rows.length > 0) {
    return { gate: 0.0, reason: `tier0_hex_collision:${result.rows[0].node_id}` };
  }
  return { gate: 1.0, reason: null };
}

// System 2: Per-tier saturation decay
async function getTierSaturation(
  client: PoolClient,
  config: Map<string, number>,
  tier: number,
): Promise<number> {
  const now = Date.now();
  const ttl = cfg(config, 'saturation_cache_ttl_seconds', 300);

  if (tierCountCache.size > 0 && now < tierCountCacheExpiry) {
    const n = tierCountCache.get(tier) || 1;
    const k = cfg(config, `saturation_k_tier${tier}`, 0.30);
    return 1 / (1 + k * Math.log(Math.max(n, 1)));
  }

  // Refresh all tiers at once
  for (let t = 0; t <= 3; t++) {
    const r = t === 0
      ? await client.query(
          `SELECT COUNT(DISTINCT o.node_id) as n FROM observations o
           JOIN nodes nd ON nd.id = o.node_id
           WHERE nd.hardware_type = 'tier0_mobile'
             AND o.created_at > NOW() - INTERVAL '1 HOUR'`,
        )
      : await client.query(
          `SELECT COUNT(*) as n FROM nodes
           WHERE tier = $1 AND hardware_type != 'tier0_mobile'
             AND last_seen_at > NOW() - INTERVAL '24 HOURS'`,
          [t],
        );
    tierCountCache.set(t, parseInt(r.rows[0].n) || 0);
  }
  tierCountCacheExpiry = now + ttl * 1000;

  const n = tierCountCache.get(tier) || 1;
  const k = cfg(config, `saturation_k_tier${tier}`, 0.30);
  return 1 / (1 + k * Math.log(Math.max(n, 1)));
}

// System 3: Hex freshness (Tier 0 only)
async function getHexFreshness(
  client: PoolClient,
  config: Map<string, number>,
  hexIndex: string | null,
  isTier0: boolean,
): Promise<number> {
  if (!isTier0 || !hexIndex) return 1.0;

  const result = await client.query(
    `SELECT MAX(created_at) as last_obs FROM observations
     WHERE h3_index = $1
       AND signal_type IN ('cell_lte','cell_nr','gnss_raw','wifi_survey','wifi_rtt')`,
    [hexIndex],
  );

  if (!result.rows[0].last_obs) {
    return cfg(config, 'freshness_virgin_multiplier', 3.0);
  }

  const ageMinutes = (Date.now() - new Date(result.rows[0].last_obs).getTime()) / 60000;
  const thresholds: Array<{ key: string; mult: string; def_t: number; def_m: number }> = [
    { key: 'freshness_threshold_saturated', mult: 'freshness_saturated_multiplier', def_t: 60, def_m: 0.10 },
    { key: 'freshness_threshold_recent', mult: 'freshness_recent_multiplier', def_t: 1440, def_m: 0.25 },
    { key: 'freshness_threshold_baseline', mult: 'freshness_24h_multiplier', def_t: 10080, def_m: 1.0 },
    { key: 'freshness_threshold_aging', mult: 'freshness_7d_multiplier', def_t: 43200, def_m: 1.5 },
  ];

  for (const t of thresholds) {
    if (ageMinutes < cfg(config, t.key, t.def_t)) {
      return cfg(config, t.mult, t.def_m);
    }
  }
  return cfg(config, 'freshness_30d_multiplier', 2.0);
}

// System 4: Hex density cap (Tier 1+ only)
async function getHexDensity(
  client: PoolClient,
  config: Map<string, number>,
  hexIndex: string | null,
  tier: number,
  nodeId: string,
  isTier0: boolean,
): Promise<number> {
  if (isTier0 || !hexIndex) return 1.0;
  const hardCap = cfg(config, 'density_cap_hard_limit', 10);
  const result = await client.query(
    `SELECT COUNT(*) as n FROM nodes
     WHERE h3_index = $1 AND tier = $2
       AND hardware_type != 'tier0_mobile'
       AND last_seen_at > NOW() - INTERVAL '24 HOURS'
       AND id != $3`,
    [hexIndex, tier, nodeId],
  );
  const n = parseInt(result.rows[0].n) + 1;
  if (n > hardCap) return 0.0;
  return 1 / Math.sqrt(n);
}

export async function calculateReward(
  client: PoolClient,
  observation: { h3_index: string | null; node_id: string; signal_type: string },
  node: { id: string; hardware_type: string; tier: number; rtk_active: boolean },
): Promise<RewardBreakdown> {
  const config = await loadConfig(client);
  const isTier0 = node.hardware_type === 'tier0_mobile';
  const tier = node.tier || 0;
  const base = cfg(config, `base_points_tier${tier}`, 1);

  const collision = await checkCollision(client, config, observation.h3_index, node.id, isTier0);
  const saturation = await getTierSaturation(client, config, tier);
  const freshness = isTier0
    ? await getHexFreshness(client, config, observation.h3_index, isTier0)
    : null;
  const density = !isTier0
    ? await getHexDensity(client, config, observation.h3_index, tier, node.id, isTier0)
    : null;
  const rtkBonus = node.rtk_active ? 1.5 : 1.0;

  const final_points =
    base *
    collision.gate *
    saturation *
    (freshness ?? 1.0) *
    (density ?? 1.0) *
    rtkBonus;

  return {
    base,
    collision_gate: collision.gate,
    tier_saturation: Math.round(saturation * 1000) / 1000,
    hex_freshness: freshness !== null ? Math.round(freshness * 1000) / 1000 : null,
    hex_density_cap: density !== null ? Math.round(density * 1000) / 1000 : null,
    rtk_bonus: rtkBonus,
    final: Math.round(final_points * 1000) / 1000,
    suppression_reason: collision.reason,
  };
}
