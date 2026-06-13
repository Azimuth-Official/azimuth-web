// Shared constants for explorer page and components

export const TIER_COLORS: Record<string, string> = {
  tier0_mobile: "#F59E0B",
  tier1_rtlsdr: "#06B6D4",
  tier2_gpsdisc: "#14B8A6",
  tier3_kraken: "#94A3B8",
};

export const TIER_LABELS: Record<string, string> = {
  tier0_mobile: "Tier 0 \u2014 Mobile",
  tier1_rtlsdr: "Tier 1 \u2014 BYOD SDR",
  tier2_gpsdisc: "Tier 2 \u2014 Dedicated",
  tier3_kraken: "Tier 3 \u2014 Array",
};

export const SIGNAL_COLORS: Record<string, string> = {
  gnss_raw: "#22C55E",
  cell_lte: "#06B6D4",
  wifi_survey: "#F59E0B",
  cell_nr: "#8B5CF6",
  lte_pss: "#EC4899",
  lte_sss: "#F43F5E",
  lte_crs: "#14B8A6",
  lte_prs: "#3B82F6",
  "5g_nr_ss": "#A855F7",
  dtv_pilot: "#EAB308",
  fm_rds: "#FB923C",
  leo_downlink: "#6366F1",
  wifi_rtt: "#10B981",
};


export const SIGNAL_LABELS: Record<string, string> = {
  gnss_raw: "GNSS",
  cell_lte: "Cell LTE",
  wifi_survey: "WiFi",
  cell_nr: "Cell NR",
  lte_pss: "LTE PSS",
  lte_sss: "LTE SSS",
  lte_crs: "LTE CRS",
  lte_prs: "LTE PRS",
  "5g_nr_ss": "5G NR",
  dtv_pilot: "DTV",
  fm_rds: "FM RDS",
  leo_downlink: "LEO",
  wifi_rtt: "WiFi RTT",
};

export const FRESHNESS_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  stale_30d:    { fill: 'rgba(245, 158, 11, 0.6)',   stroke: 'rgba(245, 158, 11, 0.8)',  label: 'Unmapped >30d (3x)' },
  aging_7d:     { fill: 'rgba(251, 191, 36, 0.45)',  stroke: 'rgba(251, 191, 36, 0.65)', label: 'Stale >7d (1.5x)' },
  baseline_24h: { fill: 'rgba(6, 182, 212, 0.35)',   stroke: 'rgba(6, 182, 212, 0.55)',  label: 'Standard >24h (1x)' },
  recent:       { fill: 'rgba(6, 182, 212, 0.18)',   stroke: 'rgba(6, 182, 212, 0.38)',  label: 'Recent <24h (0.25x)' },
  saturated:    { fill: 'rgba(100, 116, 139, 0.12)', stroke: 'rgba(100, 116, 139, 0.32)',label: 'Saturated <1h (0.1x)' },
};

export const FRESHNESS_LEGEND = [
  { tier: 'stale_30d',    color: '#F59E0B', label: 'High reward (>7d unmapped)' },
  { tier: 'baseline_24h', color: '#06B6D4', label: 'Standard' },
  { tier: 'saturated',    color: '#64748B', label: 'Low reward (<24h)' },
];

export const THIRD_PARTY_LAYERS: Record<string, {
  label: string;
  fillColor: string;
  outlineColor: string;
  attribution: string;
  hasDots: boolean;
  dotMinZoom: number;
  dotLabel: string;
}> = {
  opencellid: {
    label: 'Cell Towers',
    fillColor: 'rgba(147, 51, 234, 0.35)',
    outlineColor: 'rgba(147, 51, 234, 0.6)',
    attribution: 'Cell towers: OpenCelliD (CC BY-SA 4.0)',
    hasDots: true,
    dotMinZoom: 10,
    dotLabel: 'Cell Tower',
  },
  adsb: {
    label: 'ADS-B Aircraft',
    fillColor: 'rgba(239, 68, 68, 0.35)',
    outlineColor: 'rgba(239, 68, 68, 0.6)',
    attribution: 'ADS-B: adsb.lol (ODbL)',
    hasDots: false,
    dotMinZoom: 99,
    dotLabel: '',
  },
  ais: {
    label: 'AIS Vessels',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    outlineColor: 'rgba(59, 130, 246, 0.6)',
    attribution: 'AIS: aisstream.io',
    hasDots: false,
    dotMinZoom: 99,
    dotLabel: '',
  },
  noaa_cors: {
    label: 'GNSS Base Stations',
    fillColor: 'rgba(34, 197, 94, 0.35)',
    outlineColor: 'rgba(34, 197, 94, 0.6)',
    attribution: 'GNSS base stations: NOAA CORS',
    hasDots: true,
    dotMinZoom: 6,
    dotLabel: 'GNSS Base Station',
  },
  rtk2go: {
    label: 'RTK Mountpoints',
    fillColor: 'rgba(249, 115, 22, 0.35)',
    outlineColor: 'rgba(249, 115, 22, 0.6)',
    attribution: 'RTK mountpoints: RTK2go',
    hasDots: true,
    dotMinZoom: 6,
    dotLabel: 'RTK Mountpoint',
  },
  ttn: {
    label: 'LoRa Gateways',
    fillColor: 'rgba(244, 63, 94, 0.35)',
    outlineColor: 'rgba(244, 63, 94, 0.6)',
    attribution: 'LoRa gateways: The Things Network',
    hasDots: true,
    dotMinZoom: 8,
    dotLabel: 'LoRa Gateway',
  },
};
