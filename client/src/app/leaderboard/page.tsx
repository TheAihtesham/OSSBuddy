"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardUser {
  rank: number;
  username: string;
  photoURL: string;
  totalScore: number;
  tier: string;
  topLang?: string;
  totalPRs: number;
  totalIssues: number;
  activeDays: number;
  breakdown?: {
    prScore: number;
    issueScore: number;
    consistencyScore: number;
    aiScore: number;
    multiplier: number;
  };
}

interface LeaderboardResponse {
  users: LeaderboardUser[];
  total: number;
  page: number;
  pages: number;
}

interface MeResponse extends LeaderboardUser {
  rank: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  "OSS Legend":         "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "Core Contributor":   "text-violet-400 bg-violet-400/10 border-violet-400/30",
  "Active Contributor": "text-sky-400   bg-sky-400/10   border-sky-400/30",
  "Rising Star":        "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  "New Contributor":    "text-zinc-400  bg-zinc-400/10  border-zinc-400/30",
};

const TIER_ICONS: Record<string, string> = {
  "OSS Legend":         "⚡",
  "Core Contributor":   "🔮",
  "Active Contributor": "🌊",
  "Rising Star":        "🌱",
  "New Contributor":    "🔹",
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python:     "bg-green-500",
  Rust:       "bg-orange-500",
  Go:         "bg-cyan-400",
  Kotlin:     "bg-purple-500",
  Swift:      "bg-red-500",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: "🥇", cls: "text-amber-400 font-black text-xl" };
  if (rank === 2) return { icon: "🥈", cls: "text-zinc-300 font-black text-xl" };
  if (rank === 3) return { icon: "🥉", cls: "text-amber-600 font-black text-xl" };
  return { icon: null, cls: "text-zinc-500 font-mono font-bold" };
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="font-mono text-sm font-bold tabular-nums text-white">
      {score.toLocaleString()}
      <span className="text-zinc-500 font-normal"> pts</span>
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["New Contributor"];
  const icon = TIER_ICONS[tier] ?? "🔹";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cls}`}>
      {icon} {tier}
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col items-center">
      <span className="font-mono text-sm font-bold text-white">{value}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
    </span>
  );
}

function LangDot({ lang }: { lang: string }) {
  const bg = LANG_COLORS[lang] ?? "bg-zinc-500";
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
      <span className={`w-2 h-2 rounded-full ${bg}`} />
      {lang}
    </span>
  );
}

// ─── Breakdown Modal ──────────────────────────────────────────────────────────

function BreakdownModal({
  user,
  onClose,
}: {
  user: LeaderboardUser;
  onClose: () => void;
}) {
  const b = user.breakdown;
  if (!b) return null;

  const bars = [
    { label: "PRs",         value: b.prScore,           max: 400, color: "bg-violet-500" },
    { label: "Issues",      value: b.issueScore,         max: 200, color: "bg-sky-500"    },
    { label: "Consistency", value: b.consistencyScore,   max: 300, color: "bg-emerald-500"},
    { label: "AI Bonus",    value: b.aiScore,            max: 100, color: "bg-amber-500"  },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src={user.photoURL || "/placeholder.png"}
            alt={user.username}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-zinc-700"
          />
          <div>
            <p className="font-bold text-white">@{user.username}</p>
            <TierBadge tier={user.tier} />
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Score bars */}
        <div className="space-y-3 mb-5">
          {bars.map(({ label, value, max, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{label}</span>
                <span className="font-mono text-white">{value}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Multiplier */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl border border-zinc-700">
          <span className="text-zinc-400 text-sm">Lang multiplier</span>
          <span className="font-mono font-bold text-amber-400">×{b.multiplier.toFixed(1)}</span>
        </div>

        {/* Total */}
        <div className="mt-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Total Score</p>
          <p className="text-4xl font-black text-white font-mono">{user.totalScore.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  user,
  highlight,
  onExpand,
}: {
  user: LeaderboardUser;
  highlight: boolean;
  onExpand: (u: LeaderboardUser) => void;
}) {
  const { icon, cls } = getRankDisplay(user.rank);

  return (
    <tr
      className={`border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors cursor-pointer group ${
        highlight ? "bg-violet-950/20" : ""
      }`}
      onClick={() => user.breakdown && onExpand(user)}
    >
      {/* Rank */}
      <td className="py-4 pl-5 pr-3 w-14">
        <span className={cls}>
          {icon ?? `#${user.rank}`}
        </span>
      </td>

      {/* User */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <Image
            src={user.photoURL || "/placeholder.png"}
            alt={user.username}
            width={36}
            height={36}
            className="rounded-full ring-1 ring-zinc-700 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">@{user.username}</p>
            <TierBadge tier={user.tier} />
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="py-4 pr-4 text-right">
        <ScoreBadge score={user.totalScore} />
      </td>

      {/* Stats */}
      <td className="py-4 pr-4 hidden md:table-cell">
        <div className="flex gap-5 justify-end">
          <StatPill label="PRs"     value={user.totalPRs}    />
          <StatPill label="Issues"  value={user.totalIssues} />
          <StatPill label="Days"    value={user.activeDays}  />
        </div>
      </td>

      {/* Lang */}
      <td className="py-4 pr-5 hidden lg:table-cell">
        {user.topLang ? <LangDot lang={user.topLang} /> : <span className="text-zinc-700">—</span>}
      </td>
    </tr>
  );
}

// ─── My Rank Banner ───────────────────────────────────────────────────────────

function MyRankBanner({ me, onSync, syncing }: { me: MeResponse; onSync: () => void; syncing: boolean }) {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-950/50 to-zinc-900 border border-violet-800/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Image
          src={me.photoURL || "/placeholder.png"}
          alt={me.username}
          width={48}
          height={48}
          className="rounded-full ring-2 ring-violet-500 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Your rank</p>
          <p className="font-black text-white text-lg">
            #{me.rank} <span className="text-zinc-400 font-normal text-base">· @{me.username}</span>
          </p>
          <TierBadge tier={me.tier} />
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <ScoreBadge score={me.totalScore} />
        <button
          onClick={onSync}
          disabled={syncing}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {syncing ? "Syncing…" : "⟳ Sync Score"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [data, setData]       = useState<LeaderboardResponse | null>(null);
  const [me, setMe]           = useState<MeResponse | null>(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState<LeaderboardUser | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchBoard = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/leaderboard?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const json: LeaderboardResponse = await res.json();
      setData(json);
    } catch {
      setError("Could not load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/leaderboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMe(await res.json());
    } catch {
      // Not critical — user may not be logged in
    }
  }, [token]);

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/leaderboard/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchMe();
        await fetchBoard(page);
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchBoard(page); }, [fetchBoard, page]);
  useEffect(() => { fetchMe(); },       [fetchMe]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              OSS<span className="text-violet-400">Buddy</span>
            </h1>
            <p className="text-xs text-zinc-500">Contributor Leaderboard</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live rankings
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-1">
            Top Contributors
          </h2>
          <p className="text-zinc-500 text-sm">
            Ranked by PR count, issue activity, consistency, and language multiplier.
            Click any row with a score to see the full breakdown.
          </p>
        </div>

        {/* My rank banner */}
        {me && (
          <MyRankBanner me={me} onSync={handleSync} syncing={syncing} />
        )}

        {/* Tier legend */}
        <div className="mb-5 flex flex-wrap gap-2">
          {Object.entries(TIER_ICONS).map(([tier, icon]) => (
            <span
              key={tier}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${TIER_COLORS[tier]}`}
            >
              {icon} {tier}
            </span>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          {error ? (
            <div className="py-20 text-center text-zinc-500">{error}</div>
          ) : loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-widest">
                  <th className="py-3 pl-5 pr-3 text-left w-14">#</th>
                  <th className="py-3 pr-4 text-left">Contributor</th>
                  <th className="py-3 pr-4 text-right">Score</th>
                  <th className="py-3 pr-4 text-right hidden md:table-cell">Stats</th>
                  <th className="py-3 pr-5 text-left hidden lg:table-cell">Lang</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((u) => (
                  <LeaderboardRow
                    key={u.username}
                    user={u}
                    highlight={me?.username === u.username}
                    onExpand={setExpanded}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
            >
              ← Prev
            </button>
            <span className="text-zinc-500 text-sm">
              Page {data.page} of {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, data.pages))}
              disabled={page === data.pages}
              className="px-4 py-2 rounded-xl border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-center text-zinc-700 text-xs">
          Scores are based on the past 12 months of public GitHub activity · Sync your score to update your rank
        </p>
      </div>

      {/* Breakdown modal */}
      {expanded && (
        <BreakdownModal user={expanded} onClose={() => setExpanded(null)} />
      )}
    </div>
  );
}