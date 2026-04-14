"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github, Globe, Bot, GitPullRequest, Search,
  Bookmark, Star, GitFork, Calendar, ChevronRight,
  SlidersHorizontal, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AskAI from "../_components/Ask-ai";
import { jwtDecode } from "jwt-decode";

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

interface DecodedUser {
  id: string;
  username: string;
  photoURL: string;
}

const Dashboard = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"trending" | "good-first-issue">("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedRepos, setBookmarkedRepos] = useState<Repo[]>([]);

  // New Filter States
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "newest">("stars");

  const router = useRouter();

  // Handle Auth
  useEffect(() => {
    const tokenFromURL = new URLSearchParams(window.location.search).get("token");
    const token = tokenFromURL || localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      setUser({
        id: decoded.id,
        username: decoded.username,
        photoURL: decoded.photoURL,
      });

      if (tokenFromURL) {
        localStorage.setItem("token", tokenFromURL);
        window.history.replaceState(null, "", "/dashboard");
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  // Fetch Logic
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const encodedQuery = encodeURIComponent(searchTerm);
        const langFilter = selectedLanguage !== "All" ? `+language:${selectedLanguage}` : "";

        let url = isSearchMode && searchTerm
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
  }, [page, viewMode, searchTerm, isSearchMode, selectedLanguage]);

  // Client-side Sorting
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("Bookmark API:", data);

      setBookmarkedRepos(data.bookmarks || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(
        `http://localhost:8000/api/delete-bookmark/${bookmarkId}`,

        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Bookmark deleted")
      setBookmarkedRepos((prev) =>
        prev.filter((b: any) => b._id !== bookmarkId)
      );
    } catch (err) {
      console.error("Failed to delete bookmark", err);
    }
  };



  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-sans p-0 md:p-4">
      <motion.div
        className="flex bg-white dark:bg-[#0d1117] md:rounded-3xl h-screen md:h-[95vh] overflow-hidden border border-gray-200 dark:border-[#30363d] shadow-2xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Sidebar */}
        <aside className="w-64 p-6 border-r border-gray-100 dark:border-[#30363d] flex flex-col hidden lg:flex">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white dark:text-black" />
            </div>
            <h2 className="text-xl font-bold tracking-tighter">OSS Buddy</h2>
          </div>

          <nav className="space-y-8 flex-1">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Discovery</h3>
              <ul className="space-y-1">
                {[
                  { id: 'trending', label: 'Explore', icon: <Globe className="w-4 h-4" /> },
                  { id: 'good-first-issue', label: 'First Issues', icon: <Star className="w-4 h-4" /> },
                  { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
                ].map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setIsSearchMode(false);
                      if (item.id === 'bookmarks') { setShowBookmarks(true); fetchBookmarks(); setViewMode("trending"); }
                      else { setShowBookmarks(false); setViewMode(item.id as any); }
                      setShowAskAI(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${((viewMode === item.id && !showBookmarks && !showAskAI) || (showBookmarks && item.id === 'bookmarks' && !showAskAI))
                      ? "bg-gray-100 text-black dark:bg-[#21262d] dark:text-white"
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#161b22]"
                      }`}
                  >
                    {item.icon} {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">AI Tools</h3>
              <Button
                onClick={() => setShowAskAI(true)}
                variant={showAskAI ? "default" : "outline"}
                className={`w-full justify-start gap-2 rounded-xl h-10 ${showAskAI ? "bg-black text-white" : "border-gray-200"}`}
              >
                <Bot className="w-4 h-4" /> Intelligence
              </Button>
            </div>
          </nav>

          <div className="flex items-center justify-between gap-2 px-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 overflow-hidden"
                  onClick={() => router.push("/profile")}
                >
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border"
                  />
                  <span className="text-sm font-medium truncate">
                    {user.username}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setUser(null);
                    router.push("/");
                  }}
                  className="text-xs"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = "http://localhost:8000/api/github";
                }}
                className="w-full gap-2"
              >
                <Github className="w-4 h-4" />
                Login with GitHub
              </Button>
            )}
          </div>

        </aside>

        {/* Main Section */}
        <section className="flex-1 flex flex-col bg-[#fcfcfc] dark:bg-[#0d1117] overflow-hidden">
          <header className="p-4 md:p-6 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between bg-white dark:bg-[#0d1117]">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setIsSearchMode(true); }}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#161b22] border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-black/5"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Sync
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
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
                        {['stars', 'forks', 'newest'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSortBy(type as any)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${sortBy === type ? "bg-white dark:bg-[#0d1117] shadow-sm text-black dark:text-white" : "text-gray-400"
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
                          className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all border ${selectedLanguage === lang
                            ? "bg-black text-white border-black"
                            : "bg-white dark:bg-[#0d1117] border-gray-200 dark:border-[#30363d] text-gray-500 hover:border-gray-400"
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
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
                              <h3 className="text-base font-bold truncate hover:underline cursor-pointer" onClick={() => window.open(repo.html_url, "_blank")}>
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
                                {new Date(repo.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
                            <Button
                              size="sm"
                              className="flex-1 md:flex-none h-8 bg-black text-white text-[11px] rounded-lg px-4"
                              onClick={() =>
                                window.open(
                                  (repo as any).html_url || (repo as any).repoURL,
                                  "_blank"
                                )
                              }
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

                  {/* Pagination Footer */}
                  <div className="mt-10 flex justify-center items-center gap-4 pb-10">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-md">{page}</span>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage(p => p + 1)}>Next Page</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </motion.div>
    </main>
  );
};

export default Dashboard;