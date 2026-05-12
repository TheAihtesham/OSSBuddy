"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Calendar from "react-github-calendar";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Users, UserPlus, BookOpen, Star, Trophy, ExternalLink,
  ArrowLeft, GitPullRequest, AlertCircle, Flame,
  Copy, Check, Zap, TrendingUp, GitBranch,
} from "lucide-react";


interface Profile {
  username: string;
  name: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  followers: number;
  following: number;
  public_repos: number;
  total_stars: number;
  tier: string;
  rank?: number;
  totalScore: number;
  totalPRs: number;
  totalIssues: number;
  activeDays: number;
  topLang?: string;
  openToWork?: boolean;
  top_repo?: { name: string; stars: number };
  breakdown?: {
    prScore: number;
    issueScore: number;
    consistencyScore: number;
    aiScore: number;
    multiplier: number;
  };
}


const TIER_CONFIG: Record<string, { border: string; text: string; bg: string; icon: string; accent: string }> = {
  "OSS Legend": { border: "border-amber-400/30", text: "text-amber-500", bg: "bg-amber-400/10", icon: "⚡", accent: "#f59e0b" },
  "Core Contributor": { border: "border-violet-400/30", text: "text-violet-500", bg: "bg-violet-400/10", icon: "🔮", accent: "#8b5cf6" },
  "Active Contributor": { border: "border-sky-400/30", text: "text-sky-500", bg: "bg-sky-400/10", icon: "🌊", accent: "#0ea5e9" },
  "Rising Star": { border: "border-emerald-400/30", text: "text-emerald-500", bg: "bg-emerald-400/10", icon: "🌱", accent: "#10b981" },
  "New Contributor": { border: "border-gray-300 dark:border-gray-600", text: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800", icon: "🔹", accent: "#6b7280" },
};

const LANG_DOT: Record<string, string> = {
  TypeScript: "bg-blue-500", JavaScript: "bg-yellow-400", Python: "bg-green-500",
  Rust: "bg-orange-500", Go: "bg-cyan-400", Java: "bg-red-400",
  "C++": "bg-purple-500", Swift: "bg-red-500", Kotlin: "bg-violet-500",
};


function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(useSpring(y, { stiffness: 200, damping: 20 }), [-0.5, 0.5], ["6deg", "-6deg"]);
  const ry = useTransform(useSpring(x, { stiffness: 200, damping: 20 }), [-0.5, 0.5], ["-6deg", "6deg"]);

  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <Skeleton className="h-8 w-32 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5 group cursor-default"
    >
      <div className="text-gray-400 mb-3 group-hover:text-black dark:group-hover:text-white transition-colors">
        {icon}
      </div>
      <p className="text-2xl font-bold font-mono text-black dark:text-white">
        {(value ?? 0).toLocaleString()}
      </p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">{label}</p>
    </motion.div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="font-mono font-bold text-black dark:text-white">{value}</span>
      </div>
      <div className="h-1 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}


function StreakDots({ activeDays }: { activeDays: number }) {
  const filled = Math.min(activeDays % 30 || (activeDays > 0 ? 30 : 0), 30);
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.02, type: "spring", stiffness: 300 }}
          className={`w-2.5 h-2.5 rounded-sm ${i < filled
              ? "bg-black dark:bg-white"
              : "bg-gray-100 dark:bg-[#21262d]"
            }`}
        />
      ))}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{text}</span>
    </div>
  );
}

export default function ProfileStats() {
  const router = useRouter();
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "contributions">("overview");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${username}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [username]);

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-gray-500 text-sm">
          <span className="text-black dark:text-white font-bold">@{username}</span> not found on OSSBuddy.
        </p>
        <button onClick={() => router.push("/dashboard")}
          className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4">
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const tc = TIER_CONFIG[profile.tier] ?? TIER_CONFIG["New Contributor"];
  const bd = profile.breakdown;
  const langDot = LANG_DOT[profile.topLang ?? ""] ?? "bg-gray-400";

  const scoreMetrics = bd ? [
    { label: "PR Score", value: bd.prScore, max: 400, color: "bg-blue-500" },
    { label: "Issues", value: bd.issueScore, max: 200, color: "bg-green-500" },
    { label: "Consistency", value: bd.consistencyScore, max: 300, color: "bg-purple-500" },
    { label: "AI Bonus", value: bd.aiScore, max: 100, color: "bg-amber-500" },
  ] : [];

  const streakEmoji = profile.activeDays >= 30 ? "🔥"
    : profile.activeDays >= 7 ? "⚡"
      : profile.activeDays >= 1 ? "🌱" : "💤";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-sans">

      {/* ── Nav ── */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="group flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>

        <div className="flex items-center gap-3">
          {profile.openToWork && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 px-3 py-1 rounded-full border border-green-200 dark:border-green-400/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              OPEN TO WORK
            </motion.div>
          )}
          <span className="text-[10px] font-mono text-gray-300 dark:text-gray-600 hidden sm:block">
            ossbuddy.dev/u/{username}
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-4">

        {/* ── Hero: Identity + Score ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Identity */}
          <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-20 h-20 rounded-2xl border border-gray-200 dark:border-[#30363d] grayscale hover:grayscale-0 transition-all duration-500"
                />
                {/* Tier dot */}
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-[#161b22] flex items-center justify-center text-[11px]"
                  style={{ background: tc.accent }}
                >
                  {tc.icon}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-black dark:text-white mb-0.5">
                  {profile.name || profile.username}
                </h1>
                <p className="text-gray-400 text-sm font-mono mb-3">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-gray-500 text-xs leading-relaxed mb-3 max-w-sm">{profile.bio}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${tc.text} ${tc.bg} ${tc.border}`}>
                    {tc.icon} {profile.tier}
                    {profile.rank && <span className="opacity-50">· #{profile.rank}</span>}
                  </span>
                  {profile.topLang && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#21262d] text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${langDot}`} />
                      {profile.topLang}
                    </span>
                  )}
                  {profile.location && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      📍 {profile.location}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-2 h-8 px-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg hover:opacity-80 transition-opacity"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Share Profile"}
                  </button>
                  <a
                    href={`https://github.com/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 h-8 px-4 border border-gray-200 dark:border-[#30363d] text-[11px] font-bold rounded-lg text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-400 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                  <a
                    href="/contributions"
                    className="flex items-center gap-2 h-8 px-4 border border-gray-200 dark:border-[#30363d] text-[11px] font-bold rounded-lg text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-400 transition-all"
                  >
                    <GitPullRequest size={12} /> My Contributions
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Score card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
            <SectionLabel icon={<Zap size={13} />} text="OSS Score" />
            <div className="mb-5">
              <p className="text-4xl font-bold font-mono text-black dark:text-white tabular-nums">
                {(profile.totalScore ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">points earned</p>
            </div>

            {scoreMetrics.length > 0 ? (
              <div className="space-y-3">
                {scoreMetrics.map((m) => <ScoreBar key={m.label} {...m} />)}
                {bd?.multiplier && bd.multiplier !== 1 && (
                  <p className="text-[10px] text-gray-400 font-mono pt-1">
                    ×{bd.multiplier.toFixed(1)} lang multiplier
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-1 bg-gray-100 dark:bg-[#21262d] rounded-full" />
                ))}
                <p className="text-[10px] text-gray-400 mt-2">Sync score to see breakdown</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── GitHub Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatCard icon={<Users size={16} />} value={profile.followers} label="Followers" />
          <StatCard icon={<UserPlus size={16} />} value={profile.following} label="Following" />
          <StatCard icon={<BookOpen size={16} />} value={profile.public_repos} label="Public Repos" />
          <StatCard icon={<Star size={16} />} value={profile.total_stars} label="Total Stars" />
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-xl w-fit">
          {(["overview", "contributions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === t
                  ? "bg-white dark:bg-[#0d1117] shadow-sm text-black dark:text-white"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Overview tab ── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 cursor-pointer"
            >
              {/* Streak + OSS Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Streak */}
                <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
                  <SectionLabel icon={<Flame size={13} className="text-orange-500" />} text="Activity Streak" />

                  <div className="flex items-end gap-3 mb-5">
                    <span className={`text-5xl font-bold font-mono tabular-nums leading-none ${profile.activeDays > 0 ? "text-black dark:text-white" : "text-gray-300 dark:text-gray-700"
                      }`}>
                      {profile.activeDays ?? 0}
                    </span>
                    <span className="text-2xl mb-1">{streakEmoji}</span>
                  </div>

                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] mb-2">Last 30 days</p>
                  <StreakDots activeDays={profile.activeDays ?? 0} />

                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <GitPullRequest size={13} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{profile.totalPRs ?? 0}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">PRs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={13} className="text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{profile.totalIssues ?? 0}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Issues</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
                  <SectionLabel icon={<TrendingUp size={13} />} text="Contribution Graph" />
                  <div className="flex justify-center overflow-x-auto py-2 grayscale dark:invert">
                    <Calendar
                      username={profile.username}
                      colorScheme="light"
                      blockSize={11}
                      blockMargin={3}
                      fontSize={11}
                    />
                  </div>
                </div>
              </div>

              {/* Top repo */}
              {profile.top_repo && (
                <TiltCard>
                  <a
                    href={`https://github.com/${profile.username}/${profile.top_repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-black text-white p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all relative overflow-hidden"
                  >
                    {/* Subtle grid */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                    />
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Trophy size={20} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-0.5">
                            ⭐ Top Repository
                          </p>
                          <h3 className="text-lg font-bold text-white group-hover:text-white/80 transition-colors">
                            {profile.top_repo.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-bold font-mono">
                            {(profile.top_repo.stars ?? 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/30">stars</p>
                        </div>
                        <ExternalLink size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                      </div>
                    </div>
                  </a>
                </TiltCard>
              )}
            </motion.div>
          )}

          {/* ── Contributions tab ── */}
          {activeTab === "contributions" && (
            <motion.div
              key="contributions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stats summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <GitPullRequest size={16} className="text-blue-500" />, label: "PRs Merged", value: profile.totalPRs },
                  { icon: <AlertCircle size={16} className="text-green-500" />, label: "Issues Closed", value: profile.totalIssues },
                  { icon: <Flame size={16} className="text-orange-500" />, label: "Active Days", value: profile.activeDays },
                ].map((s) => (
                  <div key={s.label} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#21262d] flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-black dark:text-white">{s.value ?? 0}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Heatmap full width */}
              <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-6">
                <SectionLabel icon={<TrendingUp size={13} />} text="GitHub Activity" />
                <div className="flex justify-center overflow-x-auto grayscale dark:invert py-2">
                  <Calendar
                    username={profile.username}
                    colorScheme="light"
                    blockSize={13}
                    blockMargin={4}
                    fontSize={12}
                  />
                </div>
              </div>

              {/* CTA to full contributions page */}
              <div className="bg-black dark:bg-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-white dark:text-black font-bold text-sm mb-1">
                    See your full contribution history
                  </p>
                  <p className="text-white/60 dark:text-black/60 text-xs">
                    Timeline, milestones, repos, and monthly activity chart.
                  </p>
                </div>
                <a
                  href="/contributions"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-black text-black dark:text-white text-xs font-bold rounded-xl hover:opacity-80 transition-opacity shrink-0"
                >
                  <GitBranch size={13} /> View All
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Match Me CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-black dark:text-white mb-0.5">
              Looking for your next contribution?
            </p>
            <p className="text-xs text-gray-400">
              AI finds repos that match your exact stack right now.
            </p>
          </div>
          <a
            href="/match"
            className="flex items-center gap-2 h-8 px-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg hover:opacity-80 transition-opacity shrink-0"
          >
            <Zap size={12} /> Match Me
          </a>
        </motion.div>

      </main>
    </div>
  );
}