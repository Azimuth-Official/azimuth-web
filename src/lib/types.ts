// Azimuth API Contract — shared types for Next.js API routes and clients

// ─── Enums ───────────────────────────────────────────────────────────

export type HardwareType =
  | 'tier0_mobile'
  | 'tier1_rtlsdr'
  | 'tier2_gpsdisc'
  | 'tier3_kraken';

export type SignalType =
  // SDR signal types
  | 'lte_pss'
  | 'lte_sss'
  | 'lte_crs'
  | 'lte_prs'
  | '5g_nr_ss'
  | 'dtv_pilot'
  | 'fm_rds'
  | 'leo_downlink'
  // Mobile signal types
  | 'cell_lte'
  | 'cell_nr'
  | 'gnss_raw'
  | 'wifi_survey'
  | 'wifi_rtt';

export type NodeStatus =
  | 'registered'
  | 'active'
  | 'inactive'
  | 'decommissioned';

export type RewardReason =
  | 'observation'
  | 'uptime'
  | 'accuracy_bonus'
  | 'early_adopter'
  | 'referral';

export type RewardStatus = 'pending' | 'distributed' | 'failed';

// ─── Auth ────────────────────────────────────────────────────────────

// POST /api/auth/register
export interface RegisterRequest {
  email?: string;
  wallet_address?: string;
}

export interface RegisterResponse {
  user_id: string;
  api_key: string; // returned ONCE, never stored server-side
}

// POST /api/auth/rotate-key
export interface RotateKeyResponse {
  api_key: string;
}

// ─── Nodes ───────────────────────────────────────────────────────────

// POST /api/nodes/register
export interface RegisterNodeRequest {
  hardware_type: HardwareType;
  label?: string;
  latitude?: number;
  longitude?: number;
  altitude_m?: number;
}

export interface RegisterNodeResponse {
  node_id: string;
}

// PATCH /api/nodes/[nodeId]
export interface UpdateNodeRequest {
  status?: NodeStatus;
  label?: string;
  latitude?: number;
  longitude?: number;
  altitude_m?: number;
  metadata?: Record<string, unknown>;
}

// POST /api/nodes/[nodeId]/heartbeat — empty body, returns 204

// GET /api/nodes/mine
export interface NodeInfo {
  id: string;
  hardware_type: HardwareType;
  label: string | null;
  animal_name: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude_m: number | null;
  status: NodeStatus;
  registered_at: string; // ISO 8601
  last_seen_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ListNodesResponse {
  nodes: NodeInfo[];
}

// ─── Observations ────────────────────────────────────────────────────

// POST /api/observations
export interface ObservationPayload {
  signal_type: SignalType;
  observed_at: string; // ISO 8601
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  frequency_hz?: number | null;
  timestamp_ns?: number | null;
  tdoa_offset_ns?: number | null;
  signal_strength_dbm?: number | null;
  snr_db?: number | null;
  source_id?: string | null;
  raw_data?: Record<string, unknown> | null;
  app_version?: string;
  build_number?: string;
  device_model?: string;
  android_api_level?: number;
  validation_status?: string;
  client_dedupe_key?: string;
  rtk_enabled?: boolean | null;
  full_bias_nanos?: number | null;
}

export interface SubmitObservationsRequest {
  node_id: string;
  observations: ObservationPayload[];
}

// GET /api/observations/mine
export interface ObservationInfo {
  id: string;
  node_id: string;
  signal_type: SignalType;
  observed_at: string;
  frequency_hz: number | null;
  timestamp_ns: number | null;
  tdoa_offset_ns: number | null;
  signal_strength_dbm: number | null;
  snr_db: number | null;
  source_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ListObservationsResponse {
  observations: ObservationInfo[];
  total: number;
}

export interface SubmitObservationsResponse {
  accepted: number;
  points_earned: number;
}

// ─── Rewards ─────────────────────────────────────────────────────────

// GET /api/rewards/mine
export interface RewardInfo {
  id: string;
  node_id: string | null;
  epoch: number;
  amount: string; // numeric(20,8) as string to preserve precision
  reason: RewardReason;
  status: RewardStatus;
  tx_hash: string | null;
  created_at: string; // ISO 8601
}

export interface ListRewardsResponse {
  rewards: RewardInfo[];
  total_earned: string; // sum of distributed amounts
}

// ─── Stats ───────────────────────────────────────────────────────────

// GET /api/stats (public, no auth)
export interface NetworkStats {
  total_users: number;
  total_nodes: number;
  active_nodes: number;
  total_observations: number;
  observations_24h: number;
  total_rewards_distributed: string;
}

// ─── Common ──────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: string;
}

// Auth context extracted from Bearer token or session cookie
export interface AuthContext {
  user_id: string;
  key_id: string | null; // null for session/cookie auth
  permissions: Record<string, boolean>;
}

// ─── Points ──────────────────────────────────────────────────────────

// GET /api/points/mine
export interface PointEntry {
  id: string;
  amount: number;
  reason: 'observation_upload' | 'observation_rtk' | 'referral_bonus' | 'referee_welcome' | 'streak_bonus' | 'manual_adjustment' | 'referral_earnings';
  reference_id: string | null;
  created_at: string; // ISO 8601
}

export interface PointsResponse {
  balance: number;
  history: PointEntry[];
}

// ─── Referral ────────────────────────────────────────────────────────

// GET /api/referral/mine
export interface ReferralEntry {
  referee_id: string;
  earnings_from_referee: number;
  joined_at: string;
}

export interface ReferralResponse {
  referral_code: string;
  referral_count: number;
  total_earnings: number;
  referrals: ReferralEntry[];
}

// ─── Leaderboard ─────────────────────────────────────────────────────

// GET /api/leaderboard
export interface LeaderboardEntry {
  rank: number;
  animal_name: string;
  points: number;
  observation_count: number;
}

export interface LeaderboardResponse {
  period: string;
  entries: LeaderboardEntry[];
  total_participants: number;
}

// ─── RTK Providers ───────────────────────────────────────────────────

export interface RtkProvider {
  id: string;
  user_id: string;
  provider_name: 'geodnet' | 'onocoy' | 'other';
  is_active: boolean;
  created_at: string;
}

// POST /api/rtk-providers
export interface RegisterRtkProviderRequest {
  provider_name: 'geodnet' | 'onocoy' | 'other';
}

// GET /api/rtk-providers
export interface ListRtkProvidersResponse {
  providers: RtkProvider[];
}
