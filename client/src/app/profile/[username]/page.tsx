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

// ─── Tilt Card ────────────────────────────────────────────────────────────────

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProfileLoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto p-10 space-y-6">
    <Skeleton className="h-10 w-32" />
    <Skeleton className="h-64 w-full rounded-3xl" />
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  </div>
);

// ─── Tier → color ─────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileStats = () => {
  const router = useRouter();
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [copied, setCopied]     = useState(false);

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white font-mono">
        <p className="text-zinc-500 text-sm">User <span className="text-white font-bold">@{username}</span> not found on OSSBuddy.</p>
        <button onClick={() => router.push("/dashboard")} className="text-xs text-zinc-600 hover:text-zinc-400 underline">
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const tierCls = TIER_COLOR[profile.tier] ?? TIER_COLOR["New Contributor"];
  const tierIcon = TIER_ICON[profile.tier] ?? "🔹";

  // Score breakdown percentages (for bar display)
  const bd = profile.breakdown;
  const scoreMetrics = bd ? [
    { label: "PR Score",      val: bd.prScore,          max: 400, color: "bg-blue-500"    },
    { label: "Issue Score",   val: bd.issueScore,        max: 200, color: "bg-green-500"   },
    { label: "Consistency",   val: bd.consistencyScore,  max: 300, color: "bg-purple-500"  },
    { label: "AI Bonus",      val: bd.aiScore,           max: 100, color: "bg-yellow-500"  },
  ] : [];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-mono selection:bg-blue-500/30">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          System Active
        </div>
      </nav>

      <motion.div
        className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Identity */}
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
                  {profile.name}
                  <Terminal size={20} className="text-blue-500" />
                </h1>
                <p className="text-gray-500 text-sm mt-1">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-400 text-xs mt-2 max-w-sm">{profile.bio}</p>
                )}
              </div>

              {/* Tier badge */}
              <div className="flex justify-center md:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tierCls}`}>
                  {tierIcon} {profile.tier}
                  {profile.rank && (
                    <span className="ml-1 opacity-60">· #{profile.rank}</span>
                  )}
                </span>
              </div>

              {/* Top lang tags — from real data */}
              {profile.topLang && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] font-bold text-gray-400">
                    {profile.topLang}
                  </span>
                </div>
              )}

              <div className="pt-2 flex gap-3 justify-center md:justify-start">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-tighter"
                >
                  <Share2 size={14} /> {copied ? "Link Copied!" : "Copy Profile URL"}
                </button>
              </div>
            </div>
          </div>

          {/* Score breakdown — uses real breakdown from User model */}
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
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
                  <p className="text-[10px] text-gray-600 mt-2">
                    Lang multiplier: <span className="text-amber-400 font-bold">×{bd.multiplier.toFixed(1)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600">Sync your score to see breakdown.</p>
            )}
          </Card>
        </header>

        {/* Stats Grid — all from real API data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Followers",    value: profile.followers,    icon: <Users size={18} />         },
            { label: "Following",    value: profile.following,    icon: <UserPlus size={18} />       },
            { label: "Public Repos", value: profile.public_repos, icon: <BookOpen size={18} />      },
            { label: "Total Stars",  value: profile.total_stars,  icon: <Star size={18} />          },
          ].map((stat, i) => (
            <Card key={i} className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6 rounded-2xl shadow-sm">
              <div className="text-blue-500 mb-3">{stat.icon}</div>
              <h4 className="text-2xl font-black">{(stat.value ?? 0).toLocaleString()}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* OSS Contribution stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pull Requests", value: profile.totalPRs,    icon: <GitPullRequest size={16} />, color: "text-blue-500"   },
            { label: "Issues",        value: profile.totalIssues,  icon: <AlertCircle size={16} />,    color: "text-green-500"  },
            { label: "Active Days",   value: profile.activeDays,   icon: <Flame size={16} />,          color: "text-orange-500" },
          ].map((s, i) => (
            <Card key={i} className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-5 rounded-2xl flex items-center gap-4">
              <div className={`${s.color} shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-xl font-black">{(s.value ?? 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Heatmap + Top Repo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-8">
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

          {/* Top repo — null-safe */}
          {profile.top_repo ? (
            <TiltCard className="h-full">
              <a
                href={`https://github.com/${profile.username}/${profile.top_repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full border border-gray-100 dark:border-[#30363d] bg-black text-white p-8 rounded-3xl group relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-gray-700 group-hover:text-blue-500 transition-colors">
                  <ExternalLink size={20} />
                </div>
                <div className="space-y-2">
                  <Trophy size={32} className="text-yellow-500 mb-4" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top Repo</p>
                  <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                    {profile.top_repo.name}
                  </h3>
                </div>
                <div className="mt-12 space-y-4">
                  <div className="flex justify-between text-[11px] font-bold border-b border-white/10 pb-2">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Star size={14} /> Stars
                    </span>
                    <span>{(profile.top_repo.stars ?? 0).toLocaleString()}</span>
                  </div>
                  {/* Removed commits — backend doesn't return it */}
                </div>
              </a>
            </TiltCard>
          ) : (
            <Card className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-8 rounded-3xl flex items-center justify-center">
              <p className="text-xs text-gray-500 text-center">No public repos yet.</p>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileStats;