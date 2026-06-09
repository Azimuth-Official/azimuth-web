"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { NetworkStats, NodeInfo, ListRewardsResponse, PointsResponse, ReferralResponse } from "@/lib/types";

interface UserInfo {
  id: string;
  email: string | null;
  wallet_address: string | null;
  display_name: string | null;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [rewards, setRewards] = useState<ListRewardsResponse | null>(null);
  const [points, setPoints] = useState<PointsResponse | null>(null);
  const [referral, setReferral] = useState<ReferralResponse | null>(null);

  // Fetch current user (cookie-based — auto-sent)
  useEffect(() => {
    fetch("/api/auth/web/me")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        if (!r.ok) return null; // rate limit or transient error — don't redirect
        return r.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {}); // network error — don't redirect, show loading
  }, [router]);

  // Fetch public stats
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Fetch authenticated data (cookie auto-sent on same-origin)
  const fetchUserData = useCallback(async () => {
    try {
      const [nodesRes, rewardsRes, pointsRes, referralRes] = await Promise.all([
        fetch("/api/nodes/mine"),
        fetch("/api/rewards/mine"),
        fetch("/api/points/mine"),
        fetch("/api/referral/mine"),
      ]);
      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setNodes(data.nodes);
      }
      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data);
      }
      if (pointsRes.ok) {
        const data = await pointsRes.json();
        setPoints(data);
      }
      if (referralRes.ok) {
        const data = await referralRes.json();
        setReferral(data);
      }
    } catch {
      // silent — dashboard degrades gracefully
    }
  }, []);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user, fetchUserData]);

  const handleLogout = async () => {
    await fetch("/api/auth/web/logout", { method: "POST" });
    router.push("/login");
  };

  const primaryNode = nodes[0] ?? null;
  const isActive = primaryNode?.status === "active";

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            {user.email || user.wallet_address || "Observer"}
            {user.created_at && (
              <span className="text-slate-600 ml-2">
                &middot; member since{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-slate-100 text-sm px-4 py-2 rounded-lg border border-border hover:border-amber-500/50 transition-all"
        >
          Sign out
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

      {/* Points Balance Card */}
      {points && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide">
                Points Balance
              </p>
              <p className="text-3xl font-bold text-amber-500 mt-2">
                {points.balance.toLocaleString()}
              </p>
            </div>
            <span className="text-2xl text-amber-500">⭐</span>
          </div>
        </div>
      )}

      {/* My Node Card */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-3 h-3 rounded-full ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h2 className="text-xl font-semibold text-slate-100">
            {primaryNode ? (primaryNode.animal_name ?? primaryNode.label ?? "My Node") : "My Node"}
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

      {/* Referral Section */}
      {referral && (
        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            Referral Program
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-surface-alt rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-2">Your Referral Code</p>
              <div className="flex items-center gap-2">
                <code className="text-slate-100 font-mono font-semibold">
                  {referral.referral_code || "—"}
                </code>
                {referral.referral_code && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referral.referral_code);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <div className="bg-surface-alt rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-2">Referrals</p>
              <p className="text-2xl font-bold text-slate-100">
                {referral.referral_count}
              </p>
            </div>
            <div className="bg-surface-alt rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-2">Referral Earnings</p>
              <p className="text-2xl font-bold text-amber-500">
                +{referral.total_earnings}
              </p>
            </div>
          </div>
          {referral.referrals.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-3">Recent Referrals</p>
              <div className="space-y-2">
                {referral.referrals.slice(0, 5).map((ref) => (
                  <div
                    key={ref.referee_id}
                    className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <code className="text-slate-400 font-mono text-xs">
                        {ref.referee_id.substring(0, 8)}...
                      </code>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(ref.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-500">
                      +{ref.earnings_from_referee} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
