"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, Bot, SendHorizonal, Sparkles, AlertTriangle,
  Lightbulb, Info, FileCode, GitBranch, Users,
  Star, Zap, ChevronDown, ChevronUp, MessageSquare,
  ArrowRight, Shield, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeyComponent { name: string; role: string; path: string; }
interface KeyFile      { path: string; importance: string; type: "entry" | "config" | "core" | "test"; }
interface Insight      { title: string; body: string; type: "tip" | "warning" | "info"; }

interface Analysis {
  overview:     { summary: string; purpose: string; audience: string; techStack: string[]; };
  architecture: { pattern: string; description: string; keyComponents: KeyComponent[]; };
  keyFiles:     KeyFile[];
  contribution: { difficulty: "beginner" | "intermediate" | "advanced"; steps: string[]; goodFirstAreas: string[]; warnings: string[]; };
  insights:     Insight[];
  answer:       string;
}

interface RepoMeta { owner: string; name: string; stars: number; language: string; description: string; }
interface ChatMessage { role: "user" | "ai"; content: string; }

const API = "http://localhost:8000/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  beginner:     { color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/20", label: "🌱 Beginner Friendly" },
  intermediate: { color: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20", label: "⚡ Intermediate"       },
  advanced:     { color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/20", label: "🔥 Advanced"               },
};

const FILE_TYPE_COLOR = {
  entry:  "bg-blue-100 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  config: "bg-purple-100 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  core:   "bg-orange-100 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  test:   "bg-green-100 text-green-600 dark:bg-green-400/10 dark:text-green-400",
};

const INSIGHT_CONFIG = {
  tip:     { icon: <Lightbulb className="w-3.5 h-3.5" />,    color: "border-blue-200 bg-blue-50 dark:border-blue-400/20 dark:bg-blue-400/5",       label: "text-blue-600 dark:text-blue-400"   },
  warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "border-yellow-200 bg-yellow-50 dark:border-yellow-400/20 dark:bg-yellow-400/5", label: "text-yellow-600 dark:text-yellow-400"},
  info:    { icon: <Info className="w-3.5 h-3.5" />,          color: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",            label: "text-gray-500 dark:text-gray-400"   },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-gray-400">{icon}</div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h3>
    </div>
  );
}

function TechBadge({ tech }: { tech: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] text-gray-500 font-bold uppercase">
      {tech}
    </span>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-300" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-[#30363d] pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading state with steps
function AnalyzingState() {
  const steps = [
    "Fetching repository metadata...",
    "Reading source files...",
    "Analyzing architecture...",
    "Generating insights...",
    "Almost there...",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-100 dark:border-[#30363d]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black dark:border-t-white animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-black dark:text-white">{steps[step]}</p>
        <p className="text-xs text-gray-400">Analyzing with Gemini AI</p>
      </div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#30363d]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Chat interface ───────────────────────────────────────────────────────────

function ChatInterface({ repoURL, analysisContext }: { repoURL: string; analysisContext: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/ask-ai-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoURL, question: userMsg, previousContext: analysisContext }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTED = [
    "How do I set up the development environment?",
    "What are the main dependencies?",
    "How does authentication work?",
    "What's the testing strategy?",
  ];

  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-[#30363d] flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Ask follow-up</span>
      </div>

      {/* Messages */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-3">Suggested questions:</p>
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="w-full text-left text-xs text-gray-500 hover:text-black dark:hover:text-white px-3 py-2 rounded-xl border border-gray-100 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-gray-500 transition-all flex items-center gap-2 group"
              >
                <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white dark:text-black" />
              </div>
            )}
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-50 dark:bg-[#21262d] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-[#30363d]"
            }`}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white dark:text-black" />
            </div>
            <div className="flex gap-1 px-3 py-2 bg-gray-50 dark:bg-[#21262d] rounded-xl border border-gray-100 dark:border-[#30363d]">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-[#30363d] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask anything about this repo..."
          className="flex-1 text-xs bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg px-3 py-2 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black disabled:opacity-30 transition-opacity hover:opacity-80"
        >
          <SendHorizonal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Analysis result display ──────────────────────────────────────────────────

function AnalysisResult({ repo, analysis, repoURL }: {
  repo: RepoMeta;
  analysis: Analysis;
  repoURL: string;
}) {
  const diff = DIFFICULTY_CONFIG[analysis.contribution.difficulty] ?? DIFFICULTY_CONFIG.intermediate;
  const analysisContext = JSON.stringify(analysis.overview);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Repo header */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Github className="w-4 h-4 text-gray-400 shrink-0" />
              <h2 className="text-base font-bold truncate">{repo.owner}/{repo.name}</h2>
            </div>
            {repo.description && (
              <p className="text-xs text-gray-500 mb-3">{repo.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {repo.language && <TechBadge tech={repo.language} />}
              {analysis.overview.techStack.map((t) => <TechBadge key={t} tech={t} />)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-gray-400 text-xs font-mono mb-1">
              ★ {(repo.stars ?? 0).toLocaleString()}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.color}`}>
              {diff.label}
            </span>
          </div>
        </div>

        {/* Direct answer if user asked a question */}
        {analysis.answer && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1.5">
              ✦ AI Answer
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.answer}</p>
          </div>
        )}
      </div>

      {/* Overview */}
      <CollapsibleSection title="Overview" icon={<Sparkles className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.overview.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Problem it solves</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{analysis.overview.purpose}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Who it's for</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{analysis.overview.audience}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Architecture */}
      <CollapsibleSection title="Architecture" icon={<GitBranch className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] text-gray-500 uppercase">
              {analysis.architecture.pattern}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            {analysis.architecture.description}
          </p>
          {analysis.architecture.keyComponents.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Key components</p>
              {analysis.architecture.keyComponents.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-black dark:text-white">{c.name}</span>
                      {c.path && (
                        <code className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{c.path}</code>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{c.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Key files */}
      {analysis.keyFiles.length > 0 && (
        <CollapsibleSection title="Key Files" icon={<FileCode className="w-3.5 h-3.5" />} defaultOpen={false}>
          <div className="space-y-2">
            {analysis.keyFiles.map((file, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d]">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${FILE_TYPE_COLOR[file.type] ?? FILE_TYPE_COLOR.core}`}>
                  {file.type}
                </span>
                <div className="min-w-0">
                  <code className="text-xs font-mono text-black dark:text-white block truncate">{file.path}</code>
                  <p className="text-[11px] text-gray-500 mt-0.5">{file.importance}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* How to contribute */}
      <CollapsibleSection title="How to Contribute" icon={<Users className="w-3.5 h-3.5" />}>
        <div className="space-y-4">
          {/* Steps */}
          {analysis.contribution.steps.length > 0 && (
            <div className="space-y-2">
              {analysis.contribution.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* Good first areas */}
          {analysis.contribution.goodFirstAreas.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">Good first areas</p>
              <div className="flex flex-wrap gap-2">
                {analysis.contribution.goodFirstAreas.map((area) => (
                  <span key={area} className="text-[10px] px-2 py-1 rounded-lg bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20 text-green-600 dark:text-green-400 font-medium">
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {analysis.contribution.warnings.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">Watch out for</p>
              <div className="space-y-1.5">
                {analysis.contribution.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.insights.map((insight, i) => {
            const cfg = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.info;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`p-4 rounded-2xl border ${cfg.color}`}
              >
                <div className={`flex items-center gap-1.5 ${cfg.label} mb-2`}>
                  {cfg.icon}
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{insight.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{insight.body}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Chat */}
      <ChatInterface repoURL={repoURL} analysisContext={analysisContext} />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AskAI() {
  const [repoURL, setRepoURL]   = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ repo: RepoMeta; analysis: Analysis } | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function handleAnalyze() {
    if (!repoURL.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API}/ask-ai-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoURL: repoURL.trim(), question: question.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Analysis failed");
      }
      const data = await res.json();
      setResult({ repo: data.repo, analysis: data.analysis });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const EXAMPLE_REPOS = [
    "https://github.com/vercel/next.js",
    "https://github.com/facebook/react",
    "https://github.com/tailwindlabs/tailwindcss",
  ];

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-gray-400" />
        <h2 className="text-2xl font-bold tracking-tight">Repo Intelligence</h2>
      </div>
      <p className="text-gray-400 text-xs mt-1 mb-6">
        Paste any GitHub repo URL — AI will analyze architecture, key files, and how to contribute.
      </p>

      {/* ── Input card ── */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5 mb-6">
        {/* URL input */}
        <div className="space-y-1.5 mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            GitHub Repository URL
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="https://github.com/owner/repo"
              value={repoURL}
              onChange={(e) => setRepoURL(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg text-xs outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors font-mono"
            />
          </div>
          {/* Example repos */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {EXAMPLE_REPOS.map((url) => (
              <button
                key={url}
                onClick={() => setRepoURL(url)}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-[#30363d] transition-colors font-mono"
              >
                {url.replace("https://github.com/", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Optional question */}
        <div className="space-y-1.5 mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Specific question <span className="font-normal normal-case text-gray-300">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. How does authentication work? or leave blank for full analysis"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg text-xs outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#30363d]">
          <p className="text-[10px] text-gray-300 dark:text-gray-600">
            Analyzes main branch · Powered by Gemini
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading || !repoURL.trim()}
            className="h-8 px-5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg disabled:opacity-30 transition-opacity hover:opacity-80 flex items-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
              : <><Zap className="w-3 h-3" /> Analyze Repo</>
            }
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-400 text-xs mb-4"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl">
          <AnalyzingState />
        </div>
      )}

      {/* ── Result ── */}
      {result && !loading && (
        <AnalysisResult
          repo={result.repo}
          analysis={result.analysis}
          repoURL={repoURL}
        />
      )}

    </div>
  );
}