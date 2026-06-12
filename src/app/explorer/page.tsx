"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

import { TIER_COLORS, TIER_LABELS, SIGNAL_COLORS, SIGNAL_LABELS, THIRD_PARTY_LAYERS } from "@/lib/explorer-constants";
import SignalBreakdownPanel from "@/components/SignalBreakdownPanel";
import NodeDetailPanel from "@/components/NodeDetailPanel";

const ExplorerMap = dynamic(() => import("@/components/ExplorerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-amber-500 animate-pulse text-sm">
        Loading map...
      </div>
    </div>
  ),
});

interface ExplorerNode {
  id: string;
  tier: string;
  label: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  observation_count: number;
  signal_types: string[] | null;
  last_seen_at: string | null;
  registered_at: string;
}

interface NetworkStats {
  total_users: number;
  total_nodes: number;
  active_nodes: number;
  total_observations: number;
  observations_24h: number;
  total_rewards_distributed: string;
}

export default function ExplorerPage() {
  const [nodes, setNodes] = useState<ExplorerNode[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<ExplorerNode | null>(null);
  const [layers, setLayers] = useState({ coverage: true, nodes: true, heatmap: true });
  const [lastUpdate, setLastUpdate] = useState("");
  const [tierVisibility, setTierVisibility] = useState<Record<string, boolean>>({
    tier0_mobile: false,
    tier1_rtlsdr: true,
    tier2_gpsdisc: true,
    tier3_kraken: true,
  });
  const [coverageGeoJSON, setCoverageGeoJSON] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [signalBreakdown, setSignalBreakdown] = useState<{ total: number; types: any[] } | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [signalVisibility, setSignalVisibility] = useState<Record<string, boolean>>({});
  const [thirdPartyLayers, setThirdPartyLayers] = useState<Record<string, boolean>>({
    opencellid: false, adsb: false, ais: false,
    noaa_cors: false, rtk2go: false, ttn: false,
  });
  const [thirdPartyGeoJSON, setThirdPartyGeoJSON] =
    useState<Record<string, GeoJSON.FeatureCollection | null>>({});
  const fetchedLayersRef = useRef<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [nodesRes, statsRes, coverageRes, sbRes, obsRes] = await Promise.all([
        fetch("/api/explorer/nodes"),
        fetch("/api/stats"),
        fetch("/api/explorer/coverage"),
        fetch("/api/explorer/signal-breakdown"),
        fetch("/api/explorer/observations?hours=168&limit=50000"),
      ]);
      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setNodes(data.nodes);
        setLastUpdate(data.updated_at);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (coverageRes.ok) {
        const geoData = await coverageRes.json();
        setCoverageGeoJSON(geoData);
      }
      if (sbRes.ok) {
        setSignalBreakdown(await sbRes.json());
      }
      if (obsRes.ok) {
        const obsData = await obsRes.json();
        setObservations(obsData.observations || []);
      }
    } catch {
      /* map degrades gracefully */
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (observations.length > 0) {
      const types = new Set<string>();
      for (const o of observations) {
        if (o.signal_type) types.add(o.signal_type);
      }
      setSignalVisibility(prev => {
        const next = { ...prev };
        for (const t of types) {
          if (!(t in next)) next[t] = true;
        }
        return next;
      });
    }
  }, [observations]);

  useEffect(() => {
    Object.entries(thirdPartyLayers).forEach(([layer, active]) => {
      if (!active || fetchedLayersRef.current.has(layer)) return;
      fetchedLayersRef.current.add(layer);
      fetch(`/api/explorer/coverage?layer=${layer}`)
        .then(r => r.ok ? r.json() : { type: 'FeatureCollection', features: [] })
        .then(data => setThirdPartyGeoJSON(prev => ({ ...prev, [layer]: data })))
        .catch(() => {});
    });
  }, [thirdPartyLayers]);

  const nodeGeoJSON = useMemo(() => {
    if (!nodes.length) return null;
    return {
      type: "FeatureCollection" as const,
      features: nodes
        .filter(
          (n) =>
            n.latitude != null &&
            n.longitude != null &&tierVisibility[n.tier] !== false,
        )
        .map((n) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [n.longitude!, n.latitude!],
          },
          properties: {
            id: n.id,
            tier: n.tier,
            label: n.label || n.tier.replace("_", " "),
            status: n.status,
            observation_count: n.observation_count,
            color: TIER_COLORS[n.tier] || "#94A3B8",
          },
        })),
    };
  }, [nodes, tierVisibility]);

  const heatmapGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: "FeatureCollection" as const,
    features: observations
      .filter((o: any) => o.latitude != null && o.longitude != null)
      .map((o: any) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [o.longitude, o.latitude],
        },
        properties: { signal_type: o.signal_type },
      })),
  }), [observations]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of nodes) counts[n.tier] = (counts[n.tier] || 0) + 1;
    return counts;
  }, [nodes]);

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 73px)" }}>
      <ExplorerMap
        nodeGeoJSON={nodeGeoJSON}
        coverageGeoJSON={coverageGeoJSON}
        nodes={nodes}
        selectedNode={selectedNode}
        onNodeSelect={setSelectedNode}
        layers={layers}
        heatmapGeoJSON={heatmapGeoJSON}
        signalVisibility={signalVisibility}
        thirdPartyLayers={thirdPartyLayers}
        thirdPartyGeoJSON={thirdPartyGeoJSON}
      />

      {/* Stats overlay — top left */}
      <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur-md border border-border rounded-xl p-4 min-w-[200px]">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Network Explorer
        </h3>
        {stats ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Nodes</span>
              <span className="text-amber-500 font-mono">
                {stats.total_nodes}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active</span>
              <span className="text-teal-400 font-mono">
                {stats.active_nodes}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Observations</span>
              <span className="text-cyan-500 font-mono">
                {stats.total_observations.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last 24h</span>
              <span className="text-slate-100 font-mono">
                {stats.observations_24h.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Loading...</p>
        )}
        {lastUpdate && (
          <p className="text-[10px] text-slate-600 mt-3">
            Updated {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Signal breakdown — below stats */}
      <div className="absolute top-4 left-4 mt-[220px]">
        <SignalBreakdownPanel data={signalBreakdown} />
      </div>

      {/* Layer toggle — top right */}
      <div className="absolute top-4 right-4 bg-navy/90 backdrop-blur-md border border-border rounded-xl p-3">
        <p className="text-xs font-semibold text-slate-100 mb-2">Layers</p>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer mb-1">
          <input
            type="checkbox"
            checked={layers.coverage}
            onChange={() =>
              setLayers((l) => ({ ...l, coverage: !l.coverage }))
            }
            className="accent-amber-500"
          />
          Coverage
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={layers.nodes}
            onChange={() => setLayers((l) => ({ ...l, nodes: !l.nodes }))}
            className="accent-cyan-500"
          />
          Nodes
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={layers.heatmap}
            onChange={() =>
              setLayers((l) => ({ ...l, heatmap: !l.heatmap }))
            }
            className="accent-amber-500"
          />
          Signals
        </label>
        <div className="mt-2 pt-2 border-t border-border/40">
          <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Third-Party Data
          </p>
          {Object.entries(THIRD_PARTY_LAYERS).map(([key, layer]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={thirdPartyLayers[key] ?? false}
                onChange={() => setThirdPartyLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                className="accent-current"
                style={{ accentColor: layer.outlineColor }}
              />
              {layer.label}
            </label>
          ))}
        </div>
      </div>

      {/* Signal type toggles — top right, below layers */}
      {layers.heatmap && Object.keys(signalVisibility).length > 0 && (
        <div className="absolute top-4 right-4 mt-[140px] bg-navy/90 backdrop-blur-md border border-border rounded-xl p-3 max-h-[300px] overflow-y-auto">
          <p className="text-xs font-semibold text-slate-100 mb-2">Signal Types</p>
          {Object.entries(signalVisibility).map(([type, visible]) => (
            <label key={type} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={visible}
                onChange={() => setSignalVisibility(prev => ({ ...prev, [type]: !prev[type] }))}
                className="accent-current"
                style={{ accentColor: SIGNAL_COLORS[type] || "#94A3B8" }}
              />
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: SIGNAL_COLORS[type] || "#94A3B8" }}
              />
              {SIGNAL_LABELS[type] || type}
            </label>
          ))}
        </div>
      )}

      {/* Tier filter — bottom left */}
      <div className="absolute bottom-8 left-4 bg-navy/90 backdrop-blur-md border border-border rounded-xl p-3">
        <p className="text-xs font-semibold text-slate-100 mb-2">Node Tiers</p>
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <button
            key={tier}
            onClick={() =>
              setTierVisibility((prev) => ({ ...prev, [tier]: !prev[tier] }))
            }
            className={`flex items-center gap-2 text-xs w-full text-left px-1 py-0.5 rounded transition-all cursor-pointer mb-1 ${
              tierVisibility[tier]
                ? "text-slate-300 hover:text-slate-100"
                : "text-slate-600 opacity-50"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border transition-colors"
              style={{
                backgroundColor: tierVisibility[tier] ? color : "transparent",
                borderColor: color,
              }}
            />
            {TIER_LABELS[tier] || tier}
            <span className="text-[10px] text-slate-600 ml-auto font-mono">
              {tierCounts[tier] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {coverageGeoJSON &&
        coverageGeoJSON.features &&
        coverageGeoJSON.features.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-navy/80 backdrop-blur-sm border border-border rounded-xl px-6 py-4 text-center">
              <p className="text-amber-500 text-sm font-medium">
                No coverage data yet
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Deploy a node to start mapping signals.
              </p>
            </div>
          </div>
        )}

      {Object.entries(thirdPartyLayers).some(([, v]) => v) && (
        <div className="absolute bottom-0 left-0 right-0 bg-navy/80 backdrop-blur-sm border-t border-border px-4 py-1 flex flex-wrap gap-3">
          {Object.entries(THIRD_PARTY_LAYERS)
            .filter(([key]) => thirdPartyLayers[key])
            .map(([key, layer]) => (
              <span key={key} className="text-[10px] text-slate-500">{layer.attribution}</span>
            ))}
        </div>
      )}

      {/* Node detail panel — slide in from right */}
      <NodeDetailPanel
        nodeId={selectedNode?.id ?? null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
