"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";


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

const SKILL_LEVELS = [
  { id: "beginner",     label: "Beginner",     emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", emoji: "🔥" },
  { id: "advanced",     label: "Advanced",     emoji: "⚡" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";


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

function ToggleChip({ label, selected, onClick }: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
        selected
          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
          : "bg-white dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d] text-gray-500 hover:border-gray-400 dark:hover:border-gray-500"
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
      className="group block p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-gray-500 transition-all"
    >
      <div className="flex items-start gap-2">
        <span className="text-gray-400 font-mono text-[10px] mt-0.5 shrink-0">#{issue.number}</span>
        <div className="min-w-0">
          <p className="text-black dark:text-white text-xs font-medium leading-snug line-clamp-2 group-hover:underline">
            {issue.title}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1 items-center">
            {issue.labels.slice(0, 3).map((l) => (
              <span
                key={l}
                className="text-[9px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#161b22] text-gray-500 font-bold uppercase border border-gray-200 dark:border-[#30363d]"
              >
                {l}
              </span>
            ))}
            <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(issue.createdAt)}</span>
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
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] p-5 rounded-2xl hover:border-gray-300 dark:hover:border-gray-500 transition-all relative overflow-hidden"
    >
      {/* Language color stripe — left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
        style={{ background: langColor }}
      />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-gray-400">#{index + 1}</span>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: langColor }} />
              <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-500 font-bold uppercase">
                {repo.language}
              </span>
            </div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-black dark:text-white hover:underline"
            >
              {repo.fullName}
            </a>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium shrink-0">
            ★ <span className="font-mono">{formatStars(repo.stars)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
          {repo.description || "No description provided."}
        </p>

        {/* AI reason  */}
        <div className="flex gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d] mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] shrink-0 mt-0.5">AI</span>
          <p className="text-gray-500 text-xs leading-relaxed">{repo.reason}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400 mb-3">
          <span>{repo.openIssues} open issues</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-green-600 dark:text-green-500">
            {repo.goodFirstIssues.length} beginner-friendly
          </span>
        </div>

        {/* Good first issues toggle */}
        {repo.goodFirstIssues.length > 0 ? (
          <div>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-2"
            >
              <span className={`text-[8px] transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
                ▶
              </span>
              {expanded ? "Hide" : "Show"} issues to tackle
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {repo.goodFirstIssues.map((issue) => (
                    <IssueCard key={issue.number} issue={issue} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-xs text-gray-300 dark:text-gray-700">
            No beginner issues right now — check back soon.
          </p>
        )}

        {/* CTA  */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#30363d] flex gap-2">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg bg-gray-50 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] text-gray-500 hover:text-black dark:hover:text-white text-[11px] font-bold transition-all hover:border-gray-400"
          >
            View Repo →
          </a>
          <a
            href={`${repo.url}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold transition-all hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Browse Issues →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// Loading state 
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
    const iv = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      1200
    );
    return () => clearInterval(iv);
  });

  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-[#161b22] animate-pulse"
        />
      ))}
      <div className="flex flex-col items-center gap-3 pt-4">
        <p className="text-sm font-medium text-black dark:text-white">{steps[step]}</p>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i <= step
                  ? "bg-black dark:bg-white"
                  : "bg-gray-200 dark:bg-[#30363d]"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">This takes about 10–15 seconds</p>
      </div>
    </div>
  );
}


export default function MatchPage() {
  const [stack, setStack]           = useState<string[]>([]);
  const [interests, setInterests]   = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState<MatchedRepo[] | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  function toggle<T>(arr: T[], val: T, set: (a: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  async function handleMatch() {
    if (!stack.length || !interests.length) return;
    if (!token) { setError("You need to be logged in to use this feature."); return; }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    <div className="max-w-4xl ">

      {/* ── Page title ── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Match Me</h2>
          <p className="text-gray-400 text-xs mt-1">
            Tell us your stack — Gemini finds your perfect OSS contribution.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-[#21262d] px-3 py-1.5 rounded-full uppercase tracking-wider border border-gray-200 dark:border-[#30363d]">
          ✦ Gemini AI
        </div>
      </div>

      {/* ── Form ── */}
      <div className="space-y-8 mb-10">

        {/* Skill level */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Skill Level
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-lg w-fit">
            {SKILL_LEVELS.map(({ id, label, emoji }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSkillLevel(id)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  skillLevel === id
                    ? "bg-white dark:bg-[#0d1117] shadow-sm text-black dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Your Stack
            <span className="ml-2 text-gray-300 dark:text-gray-600 normal-case font-normal text-[10px]">
              ({stack.length} selected)
            </span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Interests
            <span className="ml-2 text-gray-300 dark:text-gray-600 normal-case font-normal text-[10px]">
              ({interests.length} selected)
            </span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
          className={`h-9 px-8 rounded-lg text-[11px] font-bold transition-all ${
            canSubmit
              ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
              : "bg-gray-100 dark:bg-[#21262d] text-gray-400 cursor-not-allowed border border-gray-200 dark:border-[#30363d]"
          }`}
        >
          {loading ? "Matching…" : "✦ Match Me to a Project"}
        </button>
      </div>

      {/* ── Divider ── */}
      {(loading || results || error) && (
        <div className="border-t border-gray-100 dark:border-[#30363d] mb-8" />
      )}

      {/* ── States ── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingState />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={handleMatch}
              className="text-xs text-gray-400 hover:text-black dark:hover:text-white underline underline-offset-2 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

        {results && !loading && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Results header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Your Matches</h2>
                <p className="text-gray-400 text-xs mt-1">
                  {results.length} repos handpicked by Gemini for your exact stack
                </p>
              </div>
              <button
                onClick={() => { setResults(null); setError(null); }}
                className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                ← Start over
              </button>
            </div>

            {/* Repo cards */}
            <div className="grid grid-cols-1 gap-4">
              {results.map((repo, i) => (
                <RepoCard key={repo.fullName} repo={repo} index={i} />
              ))}
            </div>

            <p className="mt-8 text-center text-gray-300 dark:text-gray-700 text-xs">
              Issues pulled live from GitHub · Refresh anytime to get updated matches
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}