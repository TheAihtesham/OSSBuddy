"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // ← add this
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, GitFork, Calendar, Bookmark, SlidersHorizontal } from "lucide-react";
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
  owner: { login: string };
  language?: string;
}

const Dashboard = () => {
  const searchParams = useSearchParams(); 
  const view = searchParams.get("view") ?? "trending"; 

  const showAskAI     = view === "ai";
  const showBookmarks = view === "bookmarks";
  const viewMode      = (view === "good-first-issue") ? "good-first-issue" : "trending";

  const [repos, setRepos]                   = useState<Repo[]>([]);
  const [page, setPage]                     = useState(1);
  const [isLoading, setIsLoading]           = useState(false);
  const [searchTerm, setSearchTerm]         = useState("");
  const [isSearchMode, setIsSearchMode]     = useState(false);
  const [bookmarkedRepos, setBookmarkedRepos] = useState<Repo[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy]                 = useState<"stars" | "forks" | "newest">("stars");

  useEffect(() => {
    if (showBookmarks) fetchBookmarks();
  }, [showBookmarks]);

  useEffect(() => {
    setPage(1);
  }, [view]);

  // Fetch repos
  useEffect(() => {
    if (showBookmarks || showAskAI) return; 

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const encodedQuery = encodeURIComponent(searchTerm);
        const langFilter = selectedLanguage !== "All" ? `+language:${selectedLanguage}` : "";

        const url = isSearchMode && searchTerm
          ? `http://localhost:8000/api/search-repos?q=${encodedQuery}${langFilter}&page=${page}&per_page=10`
          : viewMode === "trending"
            ? `http://localhost:8000/api/trending-repos?page=${page}&per_page=10`
            : `http://localhost:8000/api/good-first-issues?page=${page}&per_page=10`;

        const response = await fetch(url);
        const data = await response.json();
        setRepos(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [page, viewMode, searchTerm, isSearchMode, selectedLanguage, showBookmarks, showAskAI]);

  const processedRepos = [...(showBookmarks ? bookmarkedRepos : repos)].sort((a, b) => {
    if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
    if (sortBy === "forks") return b.forks - a.forks;
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const handleBookmark = async (repo: Repo) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("http://localhost:8000/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          repoURL: repo.html_url,
          name: repo.name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks: repo.forks,
          language: repo.language || "Open Source",
        }),
      });
      alert("Added to Bookmarks");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/get-bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookmarkedRepos(data.bookmarks || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`http://localhost:8000/api/delete-bookmark/${bookmarkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Bookmark deleted");
      setBookmarkedRepos((prev) => prev.filter((b: any) => b._id !== bookmarkId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showAskAI ? (
        <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <AskAI />
        </motion.div>
      ) : (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
          
          {/* Filters Bar */}
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {showBookmarks ? "Library" : "Discover"}
                </h2>
                <p className="text-gray-400 text-xs mt-1">Curated open source excellence.</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-lg">
                {["stars", "forks", "newest"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortBy(type as any)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      sortBy === type
                        ? "bg-white dark:bg-[#0d1117] shadow-sm text-black dark:text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-2" />
              {["All", "TypeScript", "Python", "Rust", "Go", "Java", "C++"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                    selectedLanguage === lang
                      ? "bg-black text-white border-black"
                      : "bg-white dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d] text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Repo List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {processedRepos.map((repo, idx) => (
                <motion.div
                  key={(repo as any)._id || repo.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] p-5 rounded-2xl hover:border-gray-300 dark:hover:border-gray-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-base font-bold truncate hover:underline cursor-pointer"
                        onClick={() => window.open(repo.html_url, "_blank")}
                      >
                        {repo.name}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-500 font-bold uppercase">
                        {repo.language || "Docs"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-1 mb-4">{repo.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
                        <Star className="w-3 h-3" /> {repo.stargazers_count.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
                        <GitFork className="w-3 h-3" /> {repo.forks}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(repo.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
                    <Button
                      size="sm"
                      className="flex-1 md:flex-none h-8 bg-black text-white text-[11px] rounded-lg px-4"
                      onClick={() => window.open((repo as any).html_url || (repo as any).repoURL, "_blank")}
                    >
                      Contribute
                    </Button>
                    {!showBookmarks ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg border-gray-200"
                        onClick={() => handleBookmark(repo)}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteBookmark((repo as any)._id)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-10 flex justify-center items-center gap-4 pb-10">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="text-xs font-bold bg-gray-100 dark:bg-[#21262d] px-3 py-1 rounded-md">{page}</span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage((p) => p + 1)}>
              Next Page
            </Button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;