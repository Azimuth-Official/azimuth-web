"use client";

import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-sm text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            Connect Wallet
          </h1>
          <p className="text-slate-400 mb-6">
            Connect your wallet to view your node status and rewards.
          </p>
          <button
            onClick={() => setIsConnected(true)}
            className="bg-amber-500 hover:bg-amber-600 text-navy font-semibold py-2 px-6 rounded-lg transition-colors w-full"
          >
            Connect Wallet
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
          onClick={() => setIsConnected(false)}
          className="text-slate-400 hover:text-slate-100 text-sm px-4 py-2 rounded-lg border border-border hover:border-amber-500/50 transition-all"
        >
          Disconnect
        </button>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nodes Online */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Nodes Online
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">—</p>
            </div>
            <span className="text-2xl text-teal-500">◰</span>
          </div>
        </div>

        {/* Signals Tracked */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Signals Tracked
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">—</p>
            </div>
            <span className="text-2xl text-cyan-500">〰</span>
          </div>
        </div>

        {/* Positioning Queries */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Positioning Queries
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">—</p>
            </div>
            <span className="text-2xl text-amber-500">📍</span>
          </div>
        </div>

        {/* Network Uptime */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Network Uptime
              </p>
              <p className="text-3xl font-bold text-slate-100 mt-2">—</p>
            </div>
            <span className="text-2xl text-slate-400">⏱</span>
          </div>
        </div>
      </div>

      {/* My Node Card */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <h2 className="text-xl font-semibold text-slate-100">My Node</h2>
          <span className="text-red-500 text-sm">Offline</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm text-slate-500 mb-2">Signals Detected</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Uptime</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Estimated Rewards</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Data Contributed</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
        </div>

        <Link href="/guides/quickstart">
          <button className="text-amber-500 hover:text-amber-600 font-medium transition-colors">
            Deploy a node →
          </button>
        </Link>
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
      </div>
    </div>
  );
}
