"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Star, GitFork, Calendar, Bookmark,
  SlidersHorizontal, Zap, TrendingUp, GitPullRequest,
  ExternalLink, Building2, ChevronRight, Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AskAI from "../../_components/Ask-ai";

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks: number;
  created_at: string;
  pushed_at?: string;
  open_issues_count?: number;
  owner: { login: string; avatar_url?: string };
  language?: string;
  topics?: string[];
}

const LANGUAGES = ["All", "TypeScript", "Python", "Rust", "Go", "Java", "C++"];

const BIG_ORGS = [
  "google", "microsoft", "meta", "vercel", "supabase",
  "tailwindlabs", "shadcn-ui", "facebook", "nodejs",
  "huggingface", "openai", "denoland",
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3776ab",
  Rust: "#ce422b", Go: "#00acd7", Java: "#ed8b00",
  "C++": "#00599c", Ruby: "#cc342d", Swift: "#f05138",
};


function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
function getHealthSignal(repo: Repo): { label: string; color: string } {
  const daysSincePush = repo.pushed_at
    ? Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / 86400000)
    : 999;

  if (daysSincePush <= 7) return { label: "Very Active", color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/20" };
  if (daysSincePush <= 30) return { label: "Active", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20" };
  if (daysSincePush <= 90) return { label: "Moderate", color: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20" };
  return { label: "Low Activity", color: "text-gray-400 bg-gray-50 border-gray-200 dark:bg-gray-400/10 dark:border-gray-400/20" };
}

function isBigCompany(repo: Repo) {
  return BIG_ORGS.includes(repo.owner?.login?.toLowerCase() ?? "");
}

function FeaturedCard({ repo, onBookmark }: { repo: Repo; onBookmark: (r: Repo) => void }) {
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#888";
  const health = getHealthSignal(repo);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-500 transition-all overflow-hidden"
    >

      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl" style={{ background: langColor }} />

      <div className="pl-2">

        <div className="flex items-start gap-3 mb-3">
          {repo.owner?.avatar_url && (
            <img
              src={repo.owner?.avatar_url ?? ""}
              alt={repo.owner?.login ?? ""}
              className="w-8 h-8 rounded-lg border border-gray-100 dark:border-[#30363d] shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] text-gray-400 font-mono">{repo.owner.login}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${health.color}`}>
                {health.label}
              </span>
            </div>
            <h3
              onClick={() => window.open(repo.html_url, "_blank")}
              className="text-sm font-bold text-black dark:text-white hover:underline cursor-pointer truncate"
            >
              {repo.name}
            </h3>
          </div>
          <button
            onClick={() => onBookmark(repo)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#30363d] text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-400 transition-all"
          >
            <Bookmark className="w-3 h-3" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {repo.description || "No description provided."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" /> {formatStars(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {formatStars(repo.forks)}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: langColor }} />
                {repo.language}
              </span>
            )}
          </div>
          <button
            onClick={() => window.open(repo.html_url, "_blank")}
            className="text-[11px] font-bold text-black dark:text-white hover:opacity-70 transition-opacity flex items-center gap-1"
          >
            View <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RepoRow({ repo, idx, showBookmarks, onBookmark, onDeleteBookmark }: {
  repo: Repo;
  idx: number;
  showBookmarks: boolean;
  onBookmark: (r: Repo) => void;
  onDeleteBookmark: (id: string) => void;
}) {
  const health = getHealthSignal(repo);
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#888";
  const featured = isBigCompany(repo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className={`group relative bg-white dark:bg-[#161b22] border rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden ${featured
        ? "border-yellow-200 dark:border-yellow-400/20"
        : "border-gray-100 dark:border-[#30363d]"
        }`}
    >

      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl" style={{ background: langColor }} />

      <div className="flex-1 min-w-0 pl-2">

        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {repo.owner?.avatar_url && (
            <img src={repo.owner?.avatar_url ?? ""} alt={repo.owner?.login ?? ""}
              className="w-5 h-5 rounded-md border border-gray-100 dark:border-[#30363d] shrink-0" />
          )}
          <span className="text-[10px] text-gray-400 font-mono shrink-0">{repo.owner?.login ?? ""}/</span>
          <h3
            className="text-sm font-bold text-black dark:text-white hover:underline cursor-pointer truncate"
            onClick={() => window.open(repo.html_url, "_blank")}
          >
            {repo.name}
          </h3>


          <div className="flex items-center gap-1.5 flex-wrap">
            {repo.language && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-500 font-bold uppercase border border-gray-200 dark:border-[#30363d]">
                {repo.language}
              </span>
            )}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${health.color}`}>
              {health.label}
            </span>
            {featured && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-bold text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20">
                ⭐ Featured
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-1 mb-3">{repo.description}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
            <Star className="w-3 h-3" /> {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
            <GitFork className="w-3 h-3" /> {repo.forks.toLocaleString()}
          </span>
          {repo.open_issues_count !== undefined && (
            <span className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
              <GitPullRequest className="w-3 h-3" /> {repo.open_issues_count} issues
            </span>
          )}
          {repo.pushed_at && (
            <span className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
              <Flame className="w-3 h-3" /> {timeAgo(repo.pushed_at)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 shrink-0">
        <Button
          size="sm"
          className="flex-1 md:flex-none h-8 bg-black text-white text-[11px] rounded-lg px-4 hover:bg-gray-800"
          onClick={() => window.open((repo as any).html_url || (repo as any).repoURL, "_blank")}
        >
          Contribute
        </Button>
        {!showBookmarks ? (
          <Button
            variant="outline" size="sm"
            className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-[#30363d]"
            onClick={() => onBookmark(repo)}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline" size="sm"
            className="h-8 w-8 p-0 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => onDeleteBookmark((repo as any)._id)}
          >
            ✕
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle, count }: {
  icon: React.ReactNode; title: string; subtitle?: string; count?: number;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          {count !== undefined && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-[#21262d] px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5 ml-6">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="py-16 text-center">
      <p className="text-gray-400 text-sm mb-3">{message}</p>
      {action}
    </div>
  );
}

function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}


const Dashboard = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "trending";
  const showAskAI = view === "ai";
  const showBookmarks = view === "bookmarks";
  const viewMode = view === "good-first-issue" ? "good-first-issue" : "trending";

  const [repos, setRepos] = useState<Repo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [bookmarkedRepos, setBookmarkedRepos] = useState<Repo[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "newest">("stars");

  useEffect(() => { setPage(1); }, [view]);

  useEffect(() => { if (showBookmarks) fetchBookmarks(); }, [showBookmarks]);

  useEffect(() => {
    if (showBookmarks || showAskAI) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const encodedQuery = encodeURIComponent(searchTerm);
        const langFilter = selectedLanguage !== "All" ? `+language:${selectedLanguage}` : "";

        const url = isSearchMode && searchTerm
          ? `${process.env.NEXT_PUBLIC_API_URL}/search-repos?q=${encodedQuery}${langFilter}&page=${page}&per_page=12`
          : viewMode === "trending"
            ? `${process.env.NEXT_PUBLIC_API_URL}/trending-repos?page=${page}&per_page=12`
            : `${process.env.NEXT_PUBLIC_API_URL}/good-first-issues?page=${page}&per_page=12`;

        const res = await fetch(url);
        const data = await res.json();
        setRepos(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setRepos([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [page, viewMode, searchTerm, isSearchMode, selectedLanguage, showBookmarks, showAskAI]);


  const handleBookmark = async (repo: Repo) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          repoURL: repo.html_url, name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks: repo.forks, language: repo.language || "Open Source",
        }),
      });

    } catch (err) { console.error(err); }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-bookmarks`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBookmarkedRepos(data.bookmarks || []);
    } catch (err) { console.error(err); }
  };

  const handleDeleteBookmark = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-bookmark/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarkedRepos((prev) => prev.filter((b: any) => b._id !== id));
    } catch (err) { console.error(err); }
  };


  const sourceRepos = showBookmarks ? bookmarkedRepos : repos;
  const processedRepos = [...sourceRepos].sort((a, b) => {
    if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
    if (sortBy === "forks") return b.forks - a.forks;
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const featuredRepos = processedRepos.filter(isBigCompany).slice(0, 4);
  const communityRepos = processedRepos.filter((r) => !isBigCompany(r));

  return (
    <AnimatePresence mode="wait">
      {showAskAI ? (
        <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <AskAI />
        </motion.div>
      ) : (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">

          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {showBookmarks ? "Library" : viewMode === "good-first-issue" ? "Good First Issues" : "Discover"}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {showBookmarks
                  ? "Your saved repos"
                  : viewMode === "good-first-issue"
                    ? "Beginner-friendly issues from top repos"
                    : "Curated open source excellence"}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-lg">
              {["stars", "forks", "newest"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type as any)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${sortBy === type
                    ? "bg-white dark:bg-[#0d1117] shadow-sm text-black dark:text-white"
                    : "text-gray-400"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {!showBookmarks && (
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setIsSearchMode(true); if (!e.target.value) setIsSearchMode(false); }}
                placeholder="Search repositories by name, topic, or language..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl text-xs outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
              />
              {isSearchMode && searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setIsSearchMode(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mb-8">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all border shrink-0 ${selectedLanguage === lang
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-white dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d] text-gray-500 hover:border-gray-400"
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <SkeletonRows count={2} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SkeletonRows count={2} />
              </div>
            </div>
          ) : processedRepos.length === 0 ? (
            <EmptyState
              message={showBookmarks ? "No bookmarks yet." : "No repos found."}
              action={
                showBookmarks ? (
                  <a href="/dashboard" className="text-xs text-black dark:text-white font-bold hover:underline">
                    Browse repos →
                  </a>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-8">

              {/* ── Featured: Big company repos ── */}
              {!showBookmarks && !isSearchMode && featuredRepos.length > 0 && (
                <section>
                  <SectionHeader
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    title="Featured Projects"
                    subtitle="From top engineering teams"
                    count={featuredRepos.length}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {featuredRepos.map((repo) => (
                      <FeaturedCard key={repo.id} repo={repo} onBookmark={handleBookmark} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                {!showBookmarks && !isSearchMode && featuredRepos.length > 0 && (
                  <SectionHeader
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                    title={viewMode === "good-first-issue" ? "Good First Issues" : "Community Trending"}
                    subtitle={viewMode === "good-first-issue" ? "Start contributing today" : "Rising projects to watch"}
                    count={communityRepos.length}
                  />
                )}

                <div className="space-y-3">
                  {(showBookmarks || isSearchMode || featuredRepos.length === 0
                    ? processedRepos
                    : communityRepos
                  ).map((repo, idx) => (
                    <RepoRow
                      key={(repo as any)._id || repo.id}
                      repo={repo}
                      idx={idx}
                      showBookmarks={showBookmarks}
                      onBookmark={handleBookmark}
                      onDeleteBookmark={handleDeleteBookmark}
                    />
                  ))}
                </div>
              </section>

              {!showBookmarks && !isSearchMode && page >= 1 && (
                <div className="bg-black dark:bg-white rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-white dark:text-black font-bold text-sm mb-1">
                      Not finding the right project?
                    </p>
                    <p className="text-white/60 dark:text-black/60 text-xs">
                      Let AI match you to repos based on your exact stack.
                    </p>
                  </div>
                  <a
                    href="/match"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-black text-black dark:text-white text-xs font-bold rounded-xl hover:opacity-80 transition-opacity shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" /> Match Me
                  </a>
                </div>
              )}
            </div>
          )}


          <div className="mt-10 flex justify-center items-center gap-4 pb-10">
            <Button
              variant="ghost" size="sm" className="text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs font-bold bg-gray-100 dark:bg-[#21262d] px-3 py-1 rounded-md">
              {page}
            </span>
            <Button
              variant="ghost" size="sm" className="text-xs"
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </Button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;