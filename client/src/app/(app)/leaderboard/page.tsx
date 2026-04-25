"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";


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


const TIER_COLORS: Record<string, string> = {
  "OSS Legend":         "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/30",
  "Core Contributor":   "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-400/10 dark:border-violet-400/30",
  "Active Contributor": "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-400/10 dark:border-sky-400/30",
  "Rising Star":        "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/30",
  "New Contributor":    "text-gray-500 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-400/10 dark:border-gray-400/30",
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


function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: "🥇", cls: "text-amber-500 font-bold text-xl" };
  if (rank === 2) return { icon: "🥈", cls: "text-gray-400 font-bold text-xl" };
  if (rank === 3) return { icon: "🥉", cls: "text-amber-600 font-bold text-xl" };
  return { icon: null, cls: "text-gray-400 font-mono font-bold text-sm" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="font-mono text-sm font-bold tabular-nums text-black dark:text-white">
      {score.toLocaleString()}
      <span className="text-gray-400 font-normal"> pts</span>
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["New Contributor"];
  const icon = TIER_ICONS[tier] ?? "🔹";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {icon} {tier}
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col items-center">
      <span className="font-mono text-sm font-bold text-black dark:text-white">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</span>
    </span>
  );
}

function LangDot({ lang }: { lang: string }) {
  const bg = LANG_COLORS[lang] ?? "bg-gray-400";
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full ${bg} flex-shrink-0`} />
      {lang}
    </span>
  );
}


function BreakdownModal({ user, onClose }: { user: LeaderboardUser; onClose: () => void }) {
  const b = user.breakdown;
  if (!b) return null;

  const bars = [
    { label: "PRs",         value: b.prScore,          max: 400, color: "bg-violet-500" },
    { label: "Issues",      value: b.issueScore,        max: 200, color: "bg-sky-500"    },
    { label: "Consistency", value: b.consistencyScore,  max: 300, color: "bg-emerald-500"},
    { label: "AI Bonus",    value: b.aiScore,           max: 100, color: "bg-amber-500"  },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src={user.photoURL || "/placeholder.png"}
            alt={user.username}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-gray-200 dark:ring-[#30363d]"
          />
          <div>
            <p className="font-bold text-black dark:text-white text-sm">@{user.username}</p>
            <TierBadge tier={user.tier} />
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-black dark:hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Score bars */}
        <div className="space-y-3 mb-5">
          {bars.map(({ label, value, max, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono font-bold text-black dark:text-white">{value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Multiplier */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#21262d] rounded-xl border border-gray-100 dark:border-[#30363d]">
          <span className="text-gray-500 text-sm">Lang multiplier</span>
          <span className="font-mono font-bold text-amber-500">×{b.multiplier.toFixed(1)}</span>
        </div>

        {/* Total */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">Total Score</p>
          <p className="text-4xl font-bold text-black dark:text-white font-mono">
            {user.totalScore.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

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
      className={`border-b border-gray-100 dark:border-[#30363d] transition-colors cursor-pointer
        hover:bg-gray-50 dark:hover:bg-[#161b22]
        ${highlight ? "bg-gray-50 dark:bg-[#21262d]" : ""}`}
      onClick={() => user.breakdown && onExpand(user)}
    >
      {/* Rank */}
      <td className="py-4 pl-5 pr-3 w-14">
        <span className={cls}>{icon ?? `#${user.rank}`}</span>
      </td>

      {/* User */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <Image
            src={user.photoURL || "/placeholder.png"}
            alt={user.username}
            width={36}
            height={36}
            className="rounded-full ring-1 ring-gray-200 dark:ring-[#30363d] shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-black dark:text-white text-sm truncate">
              @{user.username}
            </p>
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
          <StatPill label="PRs"    value={user.totalPRs}    />
          <StatPill label="Issues" value={user.totalIssues} />
          <StatPill label="Days"   value={user.activeDays}  />
        </div>
      </td>

      {/* Lang */}
      <td className="py-4 pr-5 hidden lg:table-cell">
        {user.topLang
          ? <LangDot lang={user.topLang} />
          : <span className="text-gray-300 dark:text-gray-700">—</span>
        }
      </td>
    </tr>
  );
}


function MyRankBanner({ me, onSync, syncing }: {
  me: MeResponse;
  onSync: () => void;
  syncing: boolean;
}) {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Image
          src={me.photoURL || "/placeholder.png"}
          alt={me.username}
          width={44}
          height={44}
          className="rounded-full ring-2 ring-gray-200 dark:ring-[#30363d] shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Your rank</p>
          <p className="font-bold text-black dark:text-white text-base">
            #{me.rank}
            <span className="text-gray-400 font-normal"> · @{me.username}</span>
          </p>
          <TierBadge tier={me.tier} />
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <ScoreBadge score={me.totalScore} />
        <button
          onClick={onSync}
          disabled={syncing}
          className="h-8 px-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          {syncing ? "Syncing…" : "⟳ Sync Score"}
        </button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-[#30363d]">
          <td className="py-4 pl-5 pr-3"><div className="h-4 w-6 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse" /></td>
          <td className="py-4 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="py-4 pr-4"><div className="h-4 w-16 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse ml-auto" /></td>
          <td className="py-4 pr-4 hidden md:table-cell"><div className="h-4 w-32 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse ml-auto" /></td>
          <td className="py-4 pr-5 hidden lg:table-cell"><div className="h-4 w-16 bg-gray-100 dark:bg-[#21262d] rounded animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}


export default function LeaderboardPage() {
  const [data, setData]         = useState<LeaderboardResponse | null>(null);
  const [me, setMe]             = useState<MeResponse | null>(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [expanded, setExpanded] = useState<LeaderboardUser | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchBoard = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/leaderboard?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
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
    } catch {}
  }, [token]);

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/leaderboard/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { await fetchMe(); await fetchBoard(page); }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchBoard(page); }, [fetchBoard, page]);
  useEffect(() => { fetchMe(); },       [fetchMe]);

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* ── Page title ── */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
            <p className="text-gray-400 text-xs mt-1">
              Ranked by PRs, issues, consistency, and language multiplier. Click any row to see breakdown.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Rankings
          </div>
        </div>

        {/* ── My rank banner ── */}
        {me && <MyRankBanner me={me} onSync={handleSync} syncing={syncing} />}

        {/* ── Tier legend ── */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(TIER_ICONS).map(([tier, icon]) => (
            <span
              key={tier}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${TIER_COLORS[tier]}`}
            >
              {icon} {tier}
            </span>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] overflow-hidden bg-white dark:bg-[#0d1117]">
          {error ? (
            <div className="py-20 text-center text-gray-400 text-sm">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#30363d] bg-gray-50 dark:bg-[#161b22]">
                  <th className="py-3 pl-5 pr-3 text-left w-14 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">#</th>
                  <th className="py-3 pr-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contributor</th>
                  <th className="py-3 pr-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Score</th>
                  <th className="py-3 pr-4 text-right hidden md:table-cell text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Stats</th>
                  <th className="py-3 pr-5 text-left hidden lg:table-cell text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Lang</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <SkeletonRows />
                  : data?.users.map((u) => (
                      <LeaderboardRow
                        key={u.username}
                        user={u}
                        highlight={me?.username === u.username}
                        onExpand={setExpanded}
                      />
                    ))
                }
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {data && data.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="text-xs text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-bold bg-gray-100 dark:bg-[#21262d] px-3 py-1 rounded-md">
              {data.page} / {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, data.pages))}
              disabled={page === data.pages}
              className="text-xs text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              Next Page
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-gray-300 dark:text-gray-700 text-xs">
          Scores based on the past 12 months of public GitHub activity · Sync to update your rank
        </p>

      </div>

      {/* Breakdown modal */}
      {expanded && (
        <BreakdownModal user={expanded} onClose={() => setExpanded(null)} />
      )}
    </>
  );
}