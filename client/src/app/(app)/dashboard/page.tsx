"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Star,
  GitFork,
  Bookmark,
  SlidersHorizontal,
  Zap,
  TrendingUp,
  GitPullRequest,
  ExternalLink,
  Building2,
  Flame,
  Sparkles,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AskAI from "../../_components/Ask-ai";
import { toast } from "sonner";

interface Repo {
  id: number;
  _id?: string;
  name: string;
  html_url?: string;
  repoURL?: string;
  description: string;
  stargazers_count: number;
  forks: number;
  created_at: string;
  pushed_at?: string;
  open_issues_count?: number;
  owner: {
    login: string;
    avatar_url?: string;
  };
  language?: string;
  topics?: string[];
}

const LANGUAGES = [
  "All",
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "C++",
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  Rust: "#ce422b",
  Go: "#00acd7",
  Java: "#ed8b00",
  "C++": "#00599c",
};

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso?: string) {
  if (!iso) return "unknown";

  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;

  return `${Math.floor(days / 365)}y ago`;
}

function getHealthSignal(repo: Repo) {
  const daysSincePush = repo.pushed_at
    ? Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000
    )
    : 999;

  if (daysSincePush <= 7) {
    return {
      label: "Very Active",
      color:
        "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/20",
    };
  }

  if (daysSincePush <= 30) {
    return {
      label: "Active",
      color:
        "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
    };
  }

  if (daysSincePush <= 90) {
    return {
      label: "Moderate",
      color:
        "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20",
    };
  }

  return {
    label: "Low Activity",
    color:
      "text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-400/10 dark:border-gray-400/20",
  };
}

function getRepoInsight(repo: Repo) {
  const stars = repo.stargazers_count;
  const forks = repo.forks;

  const activeDays = repo.pushed_at
    ? Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000
    )
    : 999;

  if (stars > 50000)
    return "Widely adopted by large engineering teams";

  if (activeDays < 7 && forks > 1000)
    return "Extremely active open source community";

  if (repo.open_issues_count && repo.open_issues_count < 20)
    return "Good maintainership and issue management";

  if (stars > 10000)
    return "Popular among developers this month";

  if (activeDays < 14)
    return "Maintainers actively shipping updates";

  return "Growing community-driven project";
}

function calculateRepoScore(repo: Repo) {
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks || 0;
  const issues = repo.open_issues_count || 0;

  const recentActivity = repo.pushed_at
    ? Math.max(
      0,
      100 -
      Math.floor(
        (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000
      )
    )
    : 0;

  return (
    stars * 0.45 +
    forks * 0.25 +
    recentActivity * 8 +
    Math.max(0, 100 - issues)
  );
}

function FeaturedCard({
  repo,
  onBookmark,
  isBookmarked,
}: {
  repo: Repo;
  onBookmark: (repo: Repo) => void;
  isBookmarked: boolean;
}) {
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#888";
  const health = getHealthSignal(repo);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-3xl p-5 hover:border-gray-300 dark:hover:border-gray-500 transition-all overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: langColor }}
      />

      <div className="pl-3">
        <div className="flex items-start gap-3 mb-4">
          <img
            src={repo.owner?.avatar_url}
            alt={repo.owner?.login}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-[#30363d]"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono text-gray-400">
                {repo.owner.login}
              </span>

              <span
                className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${health.color}`}
              >
                {health.label}
              </span>
            </div>

            <h3
              onClick={() =>
                window.open(repo.html_url || repo.repoURL, "_blank")
              }
              className="text-sm font-bold truncate cursor-pointer hover:underline"
            >
              {repo.name}
            </h3>
          </div>

          <button
            onClick={() => onBookmark(repo)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${isBookmarked
              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
              : "border-gray-200 dark:border-[#30363d] text-gray-400 hover:text-black dark:hover:text-white"
              }`}
          >
            <Bookmark
              className="w-3.5 h-3.5"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {repo.description || "No description available."}
        </p>

        <div className="mb-4 flex items-center gap-2 text-[10px] text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>{getRepoInsight(repo)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {formatStars(repo.stargazers_count)}
            </span>

            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {formatStars(repo.forks)}
            </span>

            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: langColor }}
                />
                {repo.language}
              </span>
            )}
          </div>

          <button
            onClick={() =>
              window.open(repo.html_url || repo.repoURL, "_blank")
            }
            className="text-[11px] cursor-pointer font-bold flex items-center gap-1 hover:opacity-70"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RepoRow({
  repo,
  idx,
  showBookmarks,
  onBookmark,
  onDeleteBookmark,
  isBookmarked,
}: any) {
  const health = getHealthSignal(repo);

  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#888";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.02 }}
      className="group relative bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-3xl p-5 hover:border-gray-300 dark:hover:border-gray-500 transition-all overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: langColor }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pl-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <img
              src={repo.owner?.avatar_url}
              alt={repo.owner?.login}
              className="w-6 h-6 rounded-md"
            />

            <span className="text-[10px] text-gray-400 font-mono">
              {repo.owner?.login}/
            </span>

            <h3
              onClick={() =>
                window.open(repo.html_url || repo.repoURL, "_blank")
              }
              className="text-sm font-bold cursor-pointer hover:underline truncate"
            >
              {repo.name}
            </h3>

            {repo.language && (
              <span className="text-[9px] px-2 py-1 rounded-full bg-gray-100 dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] uppercase font-bold text-gray-500">
                {repo.language}
              </span>
            )}

            <span
              className={`text-[9px] px-2 py-1 rounded-full border font-bold ${health.color}`}
            >
              {health.label}
            </span>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 mb-4">
            {repo.description || "No description available"}
          </p>

          <div className="flex items-center gap-4 flex-wrap mb-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Star className="w-3 h-3" />
              {repo.stargazers_count.toLocaleString()}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <GitFork className="w-3 h-3" />
              {repo.forks.toLocaleString()}
            </span>

            {repo.open_issues_count !== undefined && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <GitPullRequest className="w-3 h-3" />
                {repo.open_issues_count} issues
              </span>
            )}

            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Activity className="w-3 h-3" />
              {timeAgo(repo.pushed_at)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <Sparkles className="w-3 h-3" />
            <span>{getRepoInsight(repo)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            size="sm"
            className="flex-1 cursor-pointer lg:flex-none h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            onClick={() =>
              window.open(repo.html_url || repo.repoURL, "_blank")
            }
          >
            Contribute
          </Button>

          {!showBookmarks ? (
            <Button
              variant="outline"
              size="sm"
              className={`h-9 w-9 cursor-pointer rounded-xl ${isBookmarked
                ? "bg-black text-white dark:bg-white dark:text-black"
                : ""
                }`}
              onClick={() => onBookmark(repo)}
            >
              <Bookmark
                className="w-4 h-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-xl border-red-200 text-red-500"
              onClick={() => onDeleteBookmark(repo._id)}
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-3xl w-full" />
      ))}
    </div>
  );
}

const Dashboard = () => {
  const searchParams = useSearchParams();

  const view = searchParams.get("view") ?? "trending";

  const showAskAI = view === "ai";
  const showBookmarks = view === "bookmarks";

  const viewMode =
    view === "good-first-issue" ? "good-first-issue" : "trending";

  const [repos, setRepos] = useState<Repo[]>([]);
  const [featuredRepos, setFeaturedRepos] = useState<Repo[]>([]);
  const [featuredInitialized, setFeaturedInitialized] = useState(false);
  const [bookmarkedRepos, setBookmarkedRepos] = useState<Repo[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const [sortBy, setSortBy] = useState<
    "stars" | "forks" | "newest" | "score"
  >("score");

  useEffect(() => {
    setPage(1);
  }, [view]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (showBookmarks || showAskAI) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const encodedQuery = encodeURIComponent(searchTerm);

        let url = "";

        if (isSearchMode && searchTerm.trim()) {
          let query = encodedQuery;

          if (selectedLanguage !== "All") {
            query += `+language:${selectedLanguage}`;
          }

          url = `${process.env.NEXT_PUBLIC_API_URL}/search-repos?q=${query}&page=${page}&per_page=12`;
        } else if (viewMode === "trending") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/trending-repos?page=${page}&per_page=12`;

          if (selectedLanguage !== "All") {
            url += `&language=${selectedLanguage}`;
          }
        } else {
          url = `${process.env.NEXT_PUBLIC_API_URL}/good-first-issues?page=${page}&per_page=12`;

          if (selectedLanguage !== "All") {
            url += `&language=${selectedLanguage}`;
          }
        }

        const res = await fetch(url);

        const data = await res.json();

        const rawRepos = Array.isArray(data.items) ? data.items : [];

        setRepos(rawRepos);
      } catch (err) {
        console.error(err);
        setRepos([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 350);

    return () => clearTimeout(timeout);
  }, [
    page,
    selectedLanguage,
    viewMode,
    searchTerm,
    isSearchMode,
    showBookmarks,
    showAskAI,
  ]);

  useEffect(() => {
    if (repos.length === 0) return;

    // only initialize once
    if (!featuredInitialized) {
      const featured = [...repos]
        .sort((a, b) => calculateRepoScore(b) - calculateRepoScore(a))
        .slice(0, 4);

      setFeaturedRepos(featured);

      localStorage.setItem(
        "ossbuddy_featured",
        JSON.stringify(featured)
      );

      localStorage.setItem(
        "ossbuddy_featured_date",
        Date.now().toString()
      );

      setFeaturedInitialized(true);

      return;
    }

    const cached = localStorage.getItem("ossbuddy_featured");

    const cachedDate = localStorage.getItem(
      "ossbuddy_featured_date"
    );

    if (!cached || !cachedDate) return;

    const cachedRepos: Repo[] = JSON.parse(cached);

    const lastUpdated = Number(cachedDate);

    const daysPassed =
      (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);

    const newTopRepos = [...repos]
      .sort((a, b) => calculateRepoScore(b) - calculateRepoScore(a))
      .slice(0, 4);

    const currentBestScore = calculateRepoScore(
      newTopRepos[0]
    );

    const oldBestScore = calculateRepoScore(
      cachedRepos[0]
    );

    const significantUpgrade =
      currentBestScore > oldBestScore * 1.25;

    if (daysPassed >= 5 || significantUpgrade) {
      setFeaturedRepos(newTopRepos);

      localStorage.setItem(
        "ossbuddy_featured",
        JSON.stringify(newTopRepos)
      );

      localStorage.setItem(
        "ossbuddy_featured_date",
        Date.now().toString()
      );
    } else {
      setFeaturedRepos(cachedRepos);
    }
  }, [repos, featuredInitialized]);

  async function fetchBookmarks() {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-bookmarks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const bookmarks = data.bookmarks || [];

      setBookmarkedRepos(bookmarks);

      const ids = bookmarks.map((b: any) => b.id);

      setBookmarkedIds(ids);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBookmark(repo: Repo) {
    const token = localStorage.getItem("token");

    if (!token) return;

    if (bookmarkedIds.includes(repo.id)) {
      toast.info("Already bookmarked");
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          id: repo.id,
          repoURL: repo.html_url,
          name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks: repo.forks,
          language: repo.language,
          owner: repo.owner,
        }),
      });

      setBookmarkedIds((prev) => [...prev, repo.id]);

      toast.success("Added to bookmarks");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteBookmark(id: string) {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delete-bookmark/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookmarkedRepos((prev) =>
        prev.filter((repo) => repo._id !== id)
      );

      toast.success("Bookmark removed");
    } catch (err) {
      console.error(err);
    }
  }

  const sourceRepos = showBookmarks ? bookmarkedRepos : repos;

  const processedRepos = useMemo(() => {
    return [...sourceRepos].sort((a, b) => {
      if (sortBy === "stars")
        return b.stargazers_count - a.stargazers_count;

      if (sortBy === "forks")
        return b.forks - a.forks;

      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );

      return calculateRepoScore(b) - calculateRepoScore(a);
    });
  }, [sourceRepos, sortBy]);

  const communityRepos = processedRepos.filter(
    (repo) => !featuredRepos.some((f) => f.id === repo.id)
  );

  return (
    <AnimatePresence mode="wait">
      {showAskAI ? (
        <AskAI />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {showBookmarks
                  ? "Bookmarks"
                  : viewMode === "good-first-issue"
                    ? "Good First Issues"
                    : "Discover"}
              </h1>

              <p className="text-sm text-gray-400 mt-2">
                AI-ranked open source projects curated for developers
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-xl overflow-x-auto">
              {["score", "stars", "forks", "newest"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type as any)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${sortBy === type
                    ? "bg-white dark:bg-[#0d1117] shadow-sm"
                    : "text-gray-400"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          {!showBookmarks && (
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchMode(e.target.value.trim().length > 0);
                }}
                placeholder="Search repositories..."
                className="w-full h-12 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] pl-11 pr-4 text-sm outline-none"
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap mb-8 no-scrollbar">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />

            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 cursor-pointer py-2 rounded-full text-[11px] border transition-all ${selectedLanguage === lang
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d] text-gray-500"
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {isLoading ? (
            <SkeletonRows />
          ) : (
            <div className="space-y-8">
              {!showBookmarks &&
                !isSearchMode &&
                featuredRepos.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-5">
                      <Building2 className="w-4 h-4 text-gray-400" />

                      <h2 className="font-bold text-lg">
                        Featured Projects
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {featuredRepos.map((repo) => (
                        <FeaturedCard
                          key={repo.id}
                          repo={repo}
                          onBookmark={handleBookmark}
                          isBookmarked={bookmarkedIds.includes(repo.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

              <section>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-gray-400" />

                  <h2 className="font-bold text-lg">
                    {viewMode === "good-first-issue"
                      ? "Beginner Friendly"
                      : "Trending Repositories"}
                  </h2>
                </div>

                <div className="space-y-4">
                  {(processedRepos
                  ).map((repo, idx) => (
                    <RepoRow
                      key={repo._id || repo.id}
                      repo={repo}
                      idx={idx}
                      showBookmarks={showBookmarks}
                      onBookmark={handleBookmark}
                      onDeleteBookmark={handleDeleteBookmark}
                      isBookmarked={bookmarkedIds.includes(repo.id)}
                    />
                  ))}
                </div>
              </section>

              {!showBookmarks && (
                <div className="bg-black dark:bg-white rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div>
                    <h3 className="text-white dark:text-black text-lg font-bold mb-1">
                      Find repos matched to your stack
                    </h3>

                    <p className="text-white/60 dark:text-black/60 text-sm">
                      AI-powered repository matching for contributors
                    </p>
                  </div>

                  <a
                    href="/match"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-black text-black dark:text-white font-semibold text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Match Me
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-center gap-4 pb-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>

            <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#161b22] text-sm font-bold">
              {page}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;