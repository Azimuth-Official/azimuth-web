"use client";

import { useState, useEffect, useCallback } from "react";
import { TIER_COLORS, TIER_LABELS, SIGNAL_COLORS } from "@/lib/explorer-constants";

interface NodeDetailData {
  node: {
    id: string;
    tier: string;
    label: string | null;
    status: string;
    latitude: number | null;
    longitude: number | null;
    registered_at: string;
    last_seen_at: string | null;
  };
  stats: {
    total_observations: number;
    signal_breakdown: Array<{
      signal_type: string;
      count: number;
      percentage: number;
      last_24h: number;
    }>;
  };
  geo: {
    unique_points: number;
    spread_meters: number;
    bounding_box: {
      min_lat: number;
      max_lat: number;
      min_lon: number;
      max_lon: number;
    };
  } | null;
}

interface NodeDetailPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NodeDetailPanel({ nodeId, onClose }: NodeDetailPanelProps) {
  const [data, setData] = useState<NodeDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/explorer/node/${id}`);
      if (res.ok) setData(await res.json());
    } catch { /* degrade gracefully */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (nodeId) {
      fetchDetail(nodeId);
    } else {
      setData(null);
    }
  }, [nodeId, fetchDetail]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const isOpen = nodeId !== null;

  return (
    <div
      className={`absolute right-0 top-0 h-full w-80 bg-navy/95 backdrop-blur-md border-l border-border transition-transform duration-300 z-20 overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {loading && (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-surface-alt rounded animate-pulse"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      )}

      {data && !loading && (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: TIER_COLORS[data.node.tier] || "#94A3B8" }}
              />
              <span className="font-semibold text-slate-100 text-sm truncate">
                {data.node.label || "Unnamed Node"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-100 text-lg leading-none cursor-pointer"
            >
              &#215;
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-400">
              {TIER_LABELS[data.node.tier] || data.node.tier}
            </span>
            <span className="text-xs text-slate-600">&middot;</span>
            <span
              className={`text-xs ${
                data.node.status === "active" ? "text-teal-400" : "text-slate-500"
              }`}
            >
              {data.node.status}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Observations
              </p>
              <p className="text-lg font-bold text-slate-100 font-mono">
                {data.stats.total_observations.toLocaleString()}
              </p>
            </div>
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Last 24h
              </p>
              <p className="text-lg font-bold text-slate-100 font-mono">
                {data.stats.signal_breakdown
                  .reduce((s, e) => s + (e.last_24h || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Registered
              </p>
              <p className="text-xs text-slate-300">
                {new Date(data.node.registered_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Last Seen
              </p>
              <p className="text-xs text-slate-300">
                {data.node.last_seen_at
                  ? relativeTime(data.node.last_seen_at)
                  : "\u2014"}
              </p>
            </div>
          </div>

          {/* Signal breakdown */}
          {data.stats.signal_breakdown.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-100 mb-2">
                Signal Breakdown
              </p>
              <div className="space-y-2">
                {data.stats.signal_breakdown.map((entry) => (
                  <div key={entry.signal_type} className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          SIGNAL_COLORS[entry.signal_type] || "#94A3B8",
                      }}
                    />
                    <span className="text-[11px] text-slate-400 w-20 truncate">
                      {entry.signal_type}
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor:
                            SIGNAL_COLORS[entry.signal_type] || "#94A3B8",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono w-10 text-right">
                      {entry.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geo precision */}
          {data.geo && (
            <div>
              <p className="text-xs font-semibold text-slate-100 mb-2">
                Coverage Area
              </p>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  Unique positions:{" "}
                  <span className="text-slate-100 font-mono">
                    {data.geo.unique_points}
                  </span>
                </p>
                <p>
                  Spread:{" "}
                  <span className="text-slate-100 font-mono">
                    {data.geo.spread_meters}m
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
