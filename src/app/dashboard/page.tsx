"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type {
  NetworkStats,
  NodeInfo,
  ListRewardsResponse,
} from "@/lib/types";

export default function Dashboard() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [rewards, setRewards] = useState<ListRewardsResponse | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("azimuth_api_key");
    if (stored) setApiKey(stored);
  }, []);

  // Fetch public stats (no auth)
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Fetch authenticated data when API key available
  const fetchUserData = useCallback(async (key: string) => {
    const headers = { Authorization: `Bearer ${key}` };
    try {
      const [nodesRes, rewardsRes] = await Promise.all([
        fetch("/api/nodes/mine", { headers }),
        fetch("/api/rewards/mine", { headers }),
      ]);
      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setNodes(data.nodes);
      }
      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data);
      }
    } catch {
      // silent — dashboard degrades gracefully
    }
  }, []);

  useEffect(() => {
    if (apiKey) fetchUserData(apiKey);
  }, [apiKey, fetchUserData]);

  const handleConnect = () => {
    const trimmed = keyInput.trim();
    if (trimmed.length === 128 || trimmed.length === 64) {
      localStorage.setItem("azimuth_api_key", trimmed);
      setApiKey(trimmed);
      setKeyInput("");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("azimuth_api_key");
    setApiKey(null);
    setNodes([]);
    setRewards(null);
  };

  const primaryNode = nodes[0] ?? null;
  const isActive = primaryNode?.status === "active";

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-sm text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            Connect to Dashboard
          </h1>
          <p className="text-slate-400 mb-6">
            Enter your API key to view your node status and rewards.
          </p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="API key (64-char hex)"
            className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 mb-4 font-mono text-sm"
          />
          <button
            onClick={handleConnect}
            disabled={keyInput.trim().length < 64}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-navy font-semibold py-2 px-6 rounded-lg transition-colors w-full"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <button
          onClick={handleDisconnect}
          className="text-slate-400 hover:text-slate-100 text-sm px-4 py-2 rounded-lg border border-border hover:border-amber-500/50 transition-all"
        >
          Disconnect
        </button>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Nodes Online
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">
                {stats?.active_nodes ?? "—"}
              </p>
            </div>
            <span className="text-2xl text-teal-500">◰</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Signals Tracked
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">
                {stats?.total_observations?.toLocaleString() ?? "—"}
              </p>
            </div>
            <span className="text-2xl text-cyan-500">〰</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Observations (24h)
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">
                {stats?.observations_24h?.toLocaleString() ?? "—"}
              </p>
            </div>
            <span className="text-2xl text-amber-500">📍</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">
                {stats?.total_users ?? "—"}
              </p>
            </div>
            <span className="text-2xl text-slate-400">⏱</span>
          </div>
        </div>
      </div>

      {/* My Node Card */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-3 h-3 rounded-full ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h2 className="text-xl font-semibold text-slate-100">
            {primaryNode ? primaryNode.label ?? "My Node" : "My Node"}
          </h2>
          <span
            className={`text-sm ${
              isActive ? "text-green-500" : "text-red-500"
            }`}
          >
            {primaryNode ? primaryNode.status : "No node"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm text-slate-500 mb-2">Hardware</p>
            <p className="text-2xl font-bold text-slate-100">
              {primaryNode?.hardware_type?.replace("_", " ") ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Last Seen</p>
            <p className="text-2xl font-bold text-slate-100">
              {primaryNode?.last_seen_at
                ? new Date(primaryNode.last_seen_at).toLocaleTimeString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Total Rewards</p>
            <p className="text-2xl font-bold text-slate-100">
              {rewards ? rewards.total_earned : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Nodes Registered</p>
            <p className="text-2xl font-bold text-slate-100">{nodes.length}</p>
          </div>
        </div>

        {!primaryNode && (
          <Link href="/guides/quickstart">
            <button className="text-amber-500 hover:text-amber-600 font-medium transition-colors">
              Deploy a node →
            </button>
          </Link>
        )}
      </div>

      {/* Signal Map Placeholder */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          Signal Map
        </h2>
        <div
          className="bg-surface-alt rounded-xl min-h-80 flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 70%)
            `,
          }}
        >
          <p className="text-slate-500 text-center">
            Interactive signal map coming soon
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          Recent Activity
        </h2>
        {rewards && rewards.rewards.length > 0 ? (
          <div className="space-y-3">
            {rewards.rewards.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-slate-100 font-medium capitalize">
                    {r.reason.replace("_", " ")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500 font-semibold">{r.amount}</p>
                  <p
                    className={`text-xs ${
                      r.status === "distributed"
                        ? "text-green-500"
                        : "text-slate-500"
                    }`}
                  >
                    {r.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-slate-400 mb-6">
              No activity yet. Deploy a node to get started.
            </p>
            <Link href="/guides/quickstart">
              <button className="bg-amber-500 hover:bg-amber-600 text-navy font-semibold py-2 px-6 rounded-lg transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
