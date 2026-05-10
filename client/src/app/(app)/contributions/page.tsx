"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest, AlertCircle, Star, Trophy,
  Calendar, TrendingUp, GitBranch, ExternalLink,
  Flame, Lock, ChevronRight, Zap,
} from "lucide-react";

interface ContributionItem {
  id: number;
  type: "pr" | "issue";
  title: string;
  url: string;
  state: string;
  repo: string;
  createdAt: string;
  mergedAt?: string;
  labels: string[];
  number: number;
}

interface MonthlyData {
  month: string;
  label: string;
  prs: number;
  issues: number;
}

interface RepoData {
  name: string;
  prs: number;
  issues: number;
  lastActivity: string;
}

interface Milestone {
  id: string;
  label: string;
  achieved: boolean;
  target: number;
  current: number;
}

interface Stats {
  totalPRs: number;
  totalIssues: number;
  totalContributions: number;
  uniqueRepos: number;
  mostActiveMonth: string;
  firstContribution: string | null;
  latestContribution: string | null;
}

interface ContributionData {
  username: string;
  stats: Stats;
  monthly: MonthlyData[];
  repos: RepoData[];
  milestones: Milestone[];
  timeline: ContributionItem[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function ActivityChart({ monthly }: { monthly: MonthlyData[] }) {
  const max = Math.max(...monthly.map((m) => m.prs + m.issues), 1);

  return (
    <div className="flex items-end gap-1.5 h-20">
      {monthly.map((m, i) => {
        const total = m.prs + m.issues;
        const pct   = (total / max) * 100;
        return (
          <div key={m.month} className="group flex-1 flex flex-col items-center gap-1 relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                {m.label}: {m.prs}PR {m.issues}issue
              </div>
            </div>

            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 4)}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
              className="w-full rounded-t-sm"
              style={{
                background: total > 0
                  ? "linear-gradient(to top, #000, #555)"
                  : "#f3f4f6",
              }}
            />

            {/* Month label — show every 3 */}
            {i % 3 === 0 && (
              <span className="text-[8px] text-gray-300 dark:text-gray-600 font-mono">
                {m.label.split(" ")[0]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, value, label, sub }: {
  icon: React.ReactNode; value: number | string; label: string; sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5">
      <div className="text-gray-400 mb-3">{icon}</div>
      <p className="text-2xl font-bold font-mono text-black dark:text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const pct = Math.min((milestone.current / milestone.target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-2xl border transition-all ${
        milestone.achieved
          ? "bg-white dark:bg-[#161b22] border-gray-100 dark:border-[#30363d]"
          : "bg-gray-50 dark:bg-[#0d1117] border-gray-100 dark:border-[#30363d] opacity-60"
      }`}
    >
      {!milestone.achieved && (
        <Lock className="absolute top-3 right-3 w-3 h-3 text-gray-300" />
      )}
      <p className={`text-sm font-bold mb-2 ${
        milestone.achieved ? "text-black dark:text-white" : "text-gray-400"
      }`}>
        {milestone.label}
      </p>
      <div className="h-1 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${milestone.achieved ? "bg-black dark:bg-white" : "bg-gray-300"}`}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1 font-mono">
        {milestone.current} / {milestone.target}
      </p>
    </motion.div>
  );
}

function TimelineItem({ item, index }: { item: ContributionItem; index: number }) {
  const isPR = item.type === "pr";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex gap-3 group"
    >
      {/* Icon */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isPR
          ? "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400"
          : "bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400"
      }`}>
        {isPR
          ? <GitPullRequest className="w-3.5 h-3.5" />
          : <AlertCircle className="w-3.5 h-3.5" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4 border-b border-gray-50 dark:border-[#21262d]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-black dark:text-white hover:underline line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {item.title}
            </a>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">
                {item.repo}
              </span>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span className="text-[10px] text-gray-400">{timeAgo(item.createdAt)}</span>
            </div>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-black dark:hover:text-white transition-colors shrink-0 mt-0.5"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Labels */}
        {item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.labels.slice(0, 3).map((l) => (
              <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-500 font-bold uppercase border border-gray-200 dark:border-[#30363d]">
                {l}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RepoRow({ repo, index }: { repo: RepoData; index: number }) {
  const total = repo.prs + repo.issues;
  const [owner, name] = repo.name.split("/");

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#21262d] last:border-0"
    >
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#21262d] flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-gray-500">{owner?.[0]?.toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={`https://github.com/${repo.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-black dark:text-white hover:underline truncate block"
        >
          {name}
        </a>
        <p className="text-[10px] font-mono text-gray-400">{owner}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <GitPullRequest className="w-3 h-3 text-blue-400" /> {repo.prs}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-green-400" /> {repo.issues}
        </span>
      </div>
    </motion.div>
  );
}


function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="h-8 w-48 bg-gray-100 dark:bg-[#21262d] rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-[#21262d] animate-pulse" />)}
      </div>
      <div className="h-48 rounded-2xl bg-gray-100 dark:bg-[#21262d] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1,2].map((i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-[#21262d] animate-pulse" />)}
      </div>
    </div>
  );
}

function FirstContributionBanner({ username }: { username: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 rounded-2xl bg-black text-white text-center"
    >
      <p className="text-2xl mb-1">🎉</p>
      <p className="font-bold text-sm">No contributions yet, @{username}!</p>
      <p className="text-white/60 text-xs mt-1">
        Use Match Me to find your first repo and get started.
      </p>
      <a
        href="/match"
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-black bg-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
      >
        <Zap className="w-3.5 h-3.5" /> Find a repo to contribute →
      </a>
    </motion.div>
  );
}


export default function ContributionsPage() {
  const [data, setData]       = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<"timeline" | "repos">("timeline");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Not logged in"); setLoading(false); return; }

    fetch(`${API}/contributions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-gray-400 text-sm">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  const { stats, monthly, repos, milestones, timeline, username } = data;
  const hasContributions = stats.totalContributions > 0;
  const achievedMilestones = milestones.filter((m) => m.achieved);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Contributions</h2>
          <p className="text-gray-400 text-xs mt-1">
            Your open source journey · all time
          </p>
        </div>
        {stats.latestContribution && (
          <span className="text-[10px] text-gray-400 font-mono hidden sm:block">
            Last active {timeAgo(stats.latestContribution)}
          </span>
        )}
      </div>

      {!hasContributions && <FirstContributionBanner username={username} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<GitPullRequest className="w-4 h-4" />}
          value={stats.totalPRs}
          label="PRs Merged"
          sub={stats.firstContribution ? `Since ${formatDate(stats.firstContribution)}` : undefined}
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4" />}
          value={stats.totalIssues}
          label="Issues Closed"
        />
        <StatCard
          icon={<GitBranch className="w-4 h-4" />}
          value={stats.uniqueRepos}
          label="Repos Contributed"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4" />}
          value={achievedMilestones.length}
          label="Milestones"
          sub="unlocked"
        />
      </div>

      {hasContributions && (
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Activity — Last 12 months
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-black dark:bg-white" /> Contributions
              </span>
              <span className="font-mono font-bold text-black dark:text-white">
                {stats.mostActiveMonth}
              </span>
              <span>most active</span>
            </div>
          </div>
          <ActivityChart monthly={monthly} />
        </div>
      )}

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Milestones
          </span>
          {achievedMilestones.length > 0 && (
            <span className="ml-auto text-[10px] font-bold text-black dark:text-white">
              {achievedMilestones.length} unlocked
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map((m) => <MilestoneCard key={m.id} milestone={m} />)}
          {milestones.length === 0 && (
            <div className="col-span-3 py-8 text-center text-gray-400 text-sm">
              Complete your first PR to unlock milestones 
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Recent Activity
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#21262d] p-0.5 rounded-lg">
              {(["timeline", "repos"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                    tab === t
                      ? "bg-white dark:bg-[#0d1117] text-black dark:text-white shadow-sm"
                      : "text-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {tab === "timeline" ? (
              <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-0 max-h-96 overflow-y-auto pr-1">
                {timeline.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No contributions yet.</p>
                ) : (
                  timeline.map((item, i) => <TimelineItem key={item.id} item={item} index={i} />)
                )}
              </motion.div>
            ) : (
              <motion.div key="repos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-h-96 overflow-y-auto pr-1">
                {repos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No repos yet.</p>
                ) : (
                  repos.map((r, i) => <RepoRow key={r.name} repo={r} index={i} />)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
        
          <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Overview</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "PR / Issue ratio", value: stats.totalIssues > 0
                    ? `${(stats.totalPRs / stats.totalIssues).toFixed(1)}x`
                    : `${stats.totalPRs} PRs` },
                { label: "Most active month", value: stats.mostActiveMonth },
                { label: "Repos contributed", value: `${stats.uniqueRepos} repos` },
                { label: "Total contributions", value: stats.totalContributions.toLocaleString() },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">{row.label}</span>
                  <span className="text-[11px] font-bold font-mono text-black dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black dark:bg-white rounded-2xl p-5 text-white dark:text-black">
            <p className="text-sm font-bold mb-1">Ready to contribute more?</p>
            <p className="text-white/60 dark:text-black/60 text-xs mb-4">
              Match Me finds repos perfectly suited to your skill level right now.
            </p>
            <a
              href="/match"
              className="flex items-center justify-between text-xs font-bold hover:opacity-80 transition-opacity"
            >
              Find next repo
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Share profile */}
          {hasContributions && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/profile/${username}`);
              }}
              className="w-full p-4 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-all text-left"
            >
              Share your contribution profile
              <p className="font-normal text-gray-400 mt-0.5 text-[10px]">
                ossbuddy.dev/profile/{username}
              </p>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}