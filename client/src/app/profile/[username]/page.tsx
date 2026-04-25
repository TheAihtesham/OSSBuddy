"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Calendar from "react-github-calendar";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Users, UserPlus, BookOpen, Star,
  GitCommit, Trophy, ExternalLink,
  Share2, Zap, ArrowLeft, Terminal,
  ShieldCheck, GitPullRequest, AlertCircle, Flame,
} from "lucide-react";


const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Skeleton ──

const ProfileLoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto p-10 space-y-6">
    <Skeleton className="h-10 w-32" />
    <Skeleton className="h-64 w-full rounded-3xl" />
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  </div>
);

// ─── Tier config ──

const TIER_COLOR: Record<string, string> = {
  "OSS Legend":         "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "Core Contributor":   "text-violet-400 border-violet-400/30 bg-violet-400/10",
  "Active Contributor": "text-sky-400   border-sky-400/30   bg-sky-400/10",
  "Rising Star":        "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "New Contributor":    "text-zinc-400  border-zinc-400/30  bg-zinc-400/10",
};

const TIER_ICON: Record<string, string> = {
  "OSS Legend": "⚡", "Core Contributor": "🔮",
  "Active Contributor": "🌊", "Rising Star": "🌱", "New Contributor": "🔹",
};


function getStreakMilestone(days: number): { label: string; color: string } | null {
  if (days >= 100) return { label: "👑 Century", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
  if (days >= 30)  return { label: "💎 Month",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20"     };
  if (days >= 7)   return { label: "🔥 Week",    color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
  if (days >= 3)   return { label: "⚡ Rising",  color: "text-green-400 bg-green-400/10 border-green-400/20"   };
  return null;
}

// ─── Streak Card component ────────────────────────────────────────────────────

function StreakCard({ activeDays, totalPRs, totalIssues }: {
  activeDays: number;
  totalPRs: number;
  totalIssues: number;
}) {
  const milestone = getStreakMilestone(activeDays);

  const dots = Array.from({ length: 30 }, (_, i) => i < activeDays % 30);

  return (
    <Card className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Activity Streak
          </h3>
        </div>
        {milestone && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${milestone.color}`}>
            {milestone.label}
          </span>
        )}
      </div>

      {/* Big streak number */}
      <div className="flex items-end gap-3 mb-6">
        <div>
          <p className="text-5xl font-black tabular-nums leading-none">{activeDays}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Active Days
          </p>
        </div>
        <div className="pb-1 text-3xl">
          {activeDays >= 30 ? "🔥" : activeDays >= 7 ? "⚡" : activeDays >= 1 ? "🌱" : "💤"}
        </div>
      </div>

      {/* 30-day dot grid */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Last 30 days</p>
        <div className="flex flex-wrap gap-1">
          {dots.map((active, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`w-3 h-3 rounded-sm ${
                active
                  ? "bg-black dark:bg-white"
                  : "bg-gray-100 dark:bg-[#21262d]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <GitPullRequest size={14} className="text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-black">{totalPRs}</p>
            <p className="text-[10px] text-gray-400 uppercase">PRs merged</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-black">{totalIssues}</p>
            <p className="text-[10px] text-gray-400 uppercase">Issues closed</p>
          </div>
        </div>
      </div>
    </Card>
  );
}


const ProfileStats = () => {
  const router = useRouter();
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [username]);

  if (loading) return <ProfileLoadingSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-white font-mono">
        <p className="text-gray-500 text-sm">
          User <span className="text-black dark:text-white font-bold">@{username}</span> not found on OSSBuddy.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-gray-400 hover:text-black dark:hover:text-white underline"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const tierCls  = TIER_COLOR[profile.tier]  ?? TIER_COLOR["New Contributor"];
  const tierIcon = TIER_ICON[profile.tier]   ?? "🔹";

  const bd = profile.breakdown;
  const scoreMetrics = bd ? [
    { label: "PR Score",    val: bd.prScore,         max: 400, color: "bg-blue-500"   },
    { label: "Issues",      val: bd.issueScore,       max: 200, color: "bg-green-500"  },
    { label: "Consistency", val: bd.consistencyScore, max: 300, color: "bg-purple-500" },
    { label: "AI Bonus",    val: bd.aiScore,          max: 100, color: "bg-yellow-500" },
  ] : [];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-mono selection:bg-blue-500/30">

      {/* ── Nav ── */}
      <nav className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
      </nav>

      <motion.div
        className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto pb-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {/* ── Header ── */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Identity card */}
          <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8 bg-white dark:bg-[#0d1117] p-8 rounded-3xl border border-gray-100 dark:border-[#30363d]">
            <div className="relative group shrink-0">
              <img
                src={profile.avatar_url}
                className="w-32 h-32 rounded-2xl grayscale hover:grayscale-0 transition-all duration-500 border border-gray-200 dark:border-[#30363d]"
                alt={profile.username}
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg text-white shadow-xl">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                  {profile.name || profile.username}
                  <Terminal size={20} className="text-blue-500" />
                </h1>
                <p className="text-gray-500 text-sm mt-1">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-400 text-xs mt-2 max-w-sm">{profile.bio}</p>
                )}
                {profile.location && (
                  <p className="text-gray-400 text-xs mt-1">📍 {profile.location}</p>
                )}
              </div>

              {/* Tier + rank */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tierCls}`}>
                  {tierIcon} {profile.tier}
                  {profile.rank && <span className="ml-1 opacity-60">· #{profile.rank}</span>}
                </span>
                {/* Open to work badge */}
                {profile.openToWork && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold text-green-500 bg-green-500/10 border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Open to Work
                  </span>
                )}
              </div>

              {/* Top language */}
              {profile.topLang && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] font-bold text-gray-400">
                    {profile.topLang}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-tighter hover:opacity-80 transition-opacity"
                >
                  <Share2 size={14} />
                  {copied ? "Copied!" : "Share Profile"}
                </button>
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#30363d] rounded-xl text-[11px] font-bold uppercase tracking-tighter text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <ExternalLink size={14} /> GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <Card className="h-full bg-white dark:bg-[#0d1117] border-gray-100 dark:border-[#30363d] rounded-3xl p-8">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              OSS Score
            </h3>
            <p className="text-4xl font-black mb-6 tabular-nums">
              {(profile.totalScore ?? 0).toLocaleString()}
              <span className="text-xs text-gray-500 font-normal ml-1">pts</span>
            </p>
            {scoreMetrics.length > 0 ? (
              <div className="space-y-4">
                {scoreMetrics.map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-gray-500 uppercase">{m.label}</span>
                      <span>{m.val}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.val / m.max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${m.color}`}
                      />
                    </div>
                  </div>
                ))}
                {bd?.multiplier && bd.multiplier !== 1 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    Lang multiplier: <span className="text-amber-400 font-bold">×{bd.multiplier.toFixed(1)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Sync your score to see breakdown.</p>
            )}
          </Card>
        </header>

        {/* ── GitHub Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Followers",    value: profile.followers,    icon: <Users size={18} />    },
            { label: "Following",    value: profile.following,    icon: <UserPlus size={18} /> },
            { label: "Public Repos", value: profile.public_repos, icon: <BookOpen size={18} /> },
            { label: "Total Stars",  value: profile.total_stars,  icon: <Star size={18} />     },
          ].map((stat, i) => (
            <Card key={i} className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6 rounded-2xl">
              <div className="text-blue-500 mb-3">{stat.icon}</div>
              <h4 className="text-2xl font-black">{(stat.value ?? 0).toLocaleString()}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* ── Streak + Heatmap + Top Repo ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Streak card  */}
          <StreakCard
            activeDays={profile.activeDays ?? 0}
            totalPRs={profile.totalPRs ?? 0}
            totalIssues={profile.totalIssues ?? 0}
          />

          {/* Heatmap */}
          <Card className="lg:col-span-2 border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={16} className="text-yellow-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Contribution Heatmap</h3>
            </div>
            <div className="flex justify-center py-4 grayscale dark:invert overflow-x-auto">
              <Calendar
                username={profile.username}
                colorScheme="light"
                blockSize={12}
                blockMargin={4}
                fontSize={12}
              />
            </div>
          </Card>
        </div>

        {/* ── Top Repo ── */}
        {profile.top_repo && (
          <TiltCard>
            <a
              href={`https://github.com/${profile.username}/${profile.top_repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-100 dark:border-[#30363d] bg-black text-white p-8 rounded-3xl group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-gray-700 group-hover:text-blue-500 transition-colors">
                <ExternalLink size={20} />
              </div>
              <div className="flex items-start gap-6">
                <Trophy size={40} className="text-yellow-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Top Repo</p>
                  <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors mb-4">
                    {profile.top_repo.name}
                  </h3>
                  <div className="flex items-center gap-6 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Star size={14} /> {(profile.top_repo.stars ?? 0).toLocaleString()} stars
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </TiltCard>
        )}

      </motion.div>
    </div>
  );
};

export default ProfileStats;