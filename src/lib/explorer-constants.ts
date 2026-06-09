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
