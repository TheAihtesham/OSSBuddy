"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoodFirstIssue {
  title: string;
  url: string;
  number: number;
  createdAt: string;
  labels: string[];
}

interface MatchedRepo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  reason: string;
  openIssues: number;
  goodFirstIssues: GoodFirstIssue[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STACK_OPTIONS = [
  "TypeScript", "JavaScript", "Python", "Rust", "Go",
  "Java", "Kotlin", "Swift", "C++", "C#",
  "React", "Vue", "Angular", "Next.js", "Svelte",
  "Node.js", "Express", "FastAPI", "Django", "Spring",
  "GraphQL", "PostgreSQL", "MongoDB", "Redis", "Docker",
];

const INTEREST_OPTIONS = [
  "Web Dev", "CLI Tools", "AI / ML", "DevOps", "Compilers",
  "Databases", "Mobile", "Security", "Networking", "Game Dev",
  "Developer Experience", "Open Data", "Accessibility", "Education",
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3776ab",
  Rust: "#ce422b", Go: "#00acd7", Java: "#ed8b00", Kotlin: "#7f52ff",
  Swift: "#f05138", "C++": "#00599c", "C#": "#68217a",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
        selected
          ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.35)]"
          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

function IssueCard({ issue }: { issue: GoodFirstIssue }) {
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-150"
    >
      <div className="flex items-start gap-2">
        <span className="text-zinc-600 font-mono text-xs mt-0.5 shrink-0">#{issue.number}</span>
        <div className="min-w-0">
          <p className="text-zinc-300 text-xs font-medium leading-snug group-hover:text-white transition-colors line-clamp-2">
            {issue.title}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1 items-center">
            {issue.labels.slice(0, 3).map((l) => (
              <span key={l} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {l}
              </span>
            ))}
            <span className="text-[10px] text-zinc-600 ml-auto">{timeAgo(issue.createdAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function RepoCard({ repo, index }: { repo: MatchedRepo; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const langColor = LANG_COLORS[repo.language] ?? "#888";

  return (
    <div
      className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-all duration-200 overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Rank stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, ${langColor}88, transparent)` }}
      />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-600">#{index + 1}</span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: langColor }}
              />
              <span className="text-xs text-zinc-500">{repo.language}</span>
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-white hover:text-emerald-400 transition-colors"
            >
              {repo.fullName}
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
            <span>★</span>
            <span className="font-mono">{formatStars(repo.stars)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-2">
          {repo.description || "No description provided."}
        </p>

        {/* AI reason */}
        <div className="flex gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 mb-4">
          <span className="text-emerald-400 text-xs mt-0.5 shrink-0">✦</span>
          <p className="text-emerald-300/80 text-xs leading-relaxed">{repo.reason}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-zinc-600 mb-4">
          <span>{repo.openIssues} open issues</span>
          <span>·</span>
          <span className="text-emerald-500">{repo.goodFirstIssues.length} beginner-friendly</span>
        </div>

        {/* Good first issues */}
        {repo.goodFirstIssues.length > 0 ? (
          <div>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2 font-medium"
            >
              <span
                className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              >
                ▶
              </span>
              {expanded ? "Hide" : "Show"} open issues to tackle
            </button>
            {expanded && (
              <div className="space-y-2 mt-2">
                {repo.goodFirstIssues.map((issue) => (
                  <IssueCard key={issue.number} issue={issue} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-700">No beginner issues found right now — check back soon.</p>
        )}

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex gap-2">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
          >
            View Repo →
          </a>
          <a
            href={`${repo.url}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-all"
          >
            Browse Issues ✦
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingState() {
  const steps = [
    "Reading your stack...",
    "Querying GitHub activity...",
    "Asking Gemini AI...",
    "Finding open issues...",
    "Ranking matches...",
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1200);
    return () => clearInterval(iv);
  });

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border border-transparent border-t-emerald-600 animate-spin [animation-duration:1.5s]" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold mb-1">{steps[step]}</p>
        <p className="text-zinc-600 text-sm">This takes about 10–15 seconds</p>
      </div>
      {/* Step dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? "bg-emerald-400" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MatchPage() {
  const [stack, setStack]         = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<MatchedRepo[] | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  function toggle<T>(arr: T[], val: T, set: (a: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  async function handleMatch() {
    if (!stack.length || !interests.length) return;
    if (!token) {
      setError("You need to be logged in to use this feature.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stack, skillLevel, interests }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Failed to get matches");
      }

      const data = await res.json();
      setResults(data.repos);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = stack.length > 0 && interests.length > 0 && !loading;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <div className="border-b border-zinc-900 sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-black tracking-tight">
            OSS<span className="text-emerald-400">Buddy</span>
          </Link>
          <span className="text-xs text-zinc-600 font-mono">AI Project Matching</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Hero */}
        <div className="mb-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
            ✦ Powered by Gemini AI
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none mb-3">
            Find your perfect<br />
            <span className="text-emerald-400">open-source match.</span>
          </h1>
          <p className="text-zinc-500 text-base leading-relaxed">
            Tell us your stack and skill level — Gemini will find 5 repos with real open issues waiting for you right now.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8 mb-10">
          {/* Skill level */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Skill Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSkillLevel(lvl)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border capitalize transition-all duration-150 ${
                    skillLevel === lvl
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {lvl === "beginner" && "🌱 "}
                  {lvl === "intermediate" && "🔥 "}
                  {lvl === "advanced" && "⚡ "}
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Your Stack
              <span className="ml-2 text-zinc-700 normal-case font-normal">
                ({stack.length} selected)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STACK_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt}
                  label={opt}
                  selected={stack.includes(opt)}
                  onClick={() => toggle(stack, opt, setStack)}
                />
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Interests
              <span className="ml-2 text-zinc-700 normal-case font-normal">
                ({interests.length} selected)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt}
                  label={opt}
                  selected={interests.includes(opt)}
                  onClick={() => toggle(interests, opt, setInterests)}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleMatch}
            disabled={!canSubmit}
            className={`w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              canSubmit
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_24px_rgba(52,211,153,0.3)] hover:shadow-[0_0_32px_rgba(52,211,153,0.5)]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {loading ? "Matching…" : "✦ Match Me to a Project"}
          </button>
        </div>

        {/* Divider */}
        {(loading || results || error) && (
          <div className="border-t border-zinc-900 mb-10" />
        )}

        {/* States */}
        {loading && <LoadingState />}

        {error && !loading && (
          <div className="py-12 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={handleMatch}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {results && !loading && (
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black">Your Matches</h2>
                <p className="text-zinc-600 text-sm mt-0.5">
                  {results.length} repos · handpicked by Gemini for your exact stack
                </p>
              </div>
              <button
                onClick={() => { setResults(null); setError(null); }}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                ← Start over
              </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-4">
              {results.map((repo, i) => (
                <RepoCard key={repo.fullName} repo={repo} index={i} />
              ))}
            </div>

            {/* Bottom note */}
            <p className="mt-8 text-center text-zinc-700 text-xs">
              Issues pulled live from GitHub · Refresh anytime to get updated matches
            </p>
          </div>
        )}
      </div>
    </div>
  );
}