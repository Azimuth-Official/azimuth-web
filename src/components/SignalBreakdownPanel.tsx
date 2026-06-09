"use client";

import { useState } from "react";
import { SIGNAL_COLORS, SIGNAL_LABELS } from "@/lib/explorer-constants";

interface SignalBreakdownEntry {
  signal_type: string;
  count: number;
  percentage: number;
}

interface SignalBreakdownPanelProps {
  data: {
    total: number;
    types: SignalBreakdownEntry[];
  } | null;
}

export default function SignalBreakdownPanel({ data }: SignalBreakdownPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!data || data.types.length === 0) return null;

  return (
    <div className="bg-navy/90 backdrop-blur-md border border-border rounded-xl p-3 min-w-[200px]">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-100">
            Signal Types
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {data.total.toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          {expanded ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {data.types.map((entry) => (
            <div key={entry.signal_type} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    SIGNAL_COLORS[entry.signal_type] || "#94A3B8",
                }}
              />
              <span className="text-[11px] text-slate-400 w-16 truncate">
                {SIGNAL_LABELS[entry.signal_type] || entry.signal_type}
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">
                {entry.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
