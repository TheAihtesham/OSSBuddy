"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bot, Globe, Star, Bookmark, Github,
  Trophy, Zap, CreditCard, Search
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

interface DecodedUser {
  id: string;
  username: string;
  photoURL: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface AppShellProps {
  children: React.ReactNode;
  topbar?: React.ReactNode;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Discovery",
    items: [
      {
        href: "/dashboard?view=trending",
        label: "Explore",
        icon: <Globe className="w-4 h-4" />,
      },
      {
        href: "/dashboard?view=good-first-issue",
        label: "First Issues",
        icon: <Star className="w-4 h-4" />,
      },
      {
        href: "/dashboard?view=bookmarks",
        label: "Bookmarks",
        icon: <Bookmark className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Productivity",
    items: [
      {
        href: "/leaderboard",
        label: "Leaderboard",
        icon: <Trophy className="w-4 h-4" />,
      },
      {
        href: "/match",
        label: "Match Me",
        icon: <Zap className="w-4 h-4" />,
        badge: "AI",
      },
      {
        href: "/plans",
        label: "My Plans",
        icon: <CreditCard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "AI Tools",
    items: [
      {
        href: "/dashboard?view=ai",
        label: "Intelligence",
        icon: <Bot className="w-4 h-4" />,
      },
    ],
  },
];

export default function AppShell({ children, topbar }: AppShellProps) {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  useEffect(() => {
    const tokenFromURL = new URLSearchParams(window.location.search).get("token");
    const token = tokenFromURL || localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
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
    }
  }, []);

  
  function isActive(href: string): boolean {
    const [hrefPath, hrefQuery] = href.split("?");

    
    if (pathname !== hrefPath) return false;

    if (!hrefQuery) return true;

    const hrefView = new URLSearchParams(hrefQuery).get("view");
    return currentView === hrefView;
  }

  return (
    <main className="min-h-screen h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-sans">
      <motion.div
        className="flex bg-white dark:bg-[#0d1117] h-screen overflow-hidden border border-gray-200 dark:border-[#30363d] shadow-2xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* ── Sidebar ──*/}
        <aside className="w-64 p-6 border-r border-gray-100 dark:border-[#30363d] flex-col hidden lg:flex">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white dark:text-black" />
            </div>
            <h2 className="text-xl font-bold tracking-tighter">OSS Buddy</h2>
          </div>

          {/* Nav sections */}
          <nav className="space-y-6 flex-1 overflow-y-auto">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">
                  {section.label}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer
                        ${isActive(item.href)
                          ? "bg-gray-100 text-black dark:bg-[#21262d] dark:text-white"
                          : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#161b22]"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-[9px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#21262d] text-gray-500 font-bold uppercase border border-gray-200 dark:border-[#30363d]">
                          {item.badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* User row */}
          <div className="flex items-center justify-between gap-2 px-2 pt-4 border-t border-gray-100 dark:border-[#30363d]">
            {user ? (
              <>
                <div
                  className="flex items-center gap-2 overflow-hidden cursor-pointer group"
                  onClick={() => router.push(`/profile/${user.username}`)}
                >
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#30363d] flex-shrink-0"
                  />
                  <span className="text-sm font-medium truncate group-hover:underline">
                    {user.username}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs flex-shrink-0"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setUser(null);
                    router.push("/");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={() => {
                  window.location.href = "http://localhost:8000/api/github";
                }}
              >
                <Github className="w-4 h-4" />
                Login with GitHub
              </Button>
            )}
          </div>
        </aside>

        {/* ── Main area ── */}
        <section className="flex-1 flex flex-col bg-[#fcfcfc] dark:bg-[#0d1117] overflow-hidden">

          {/* Topbar */}
          {/* <header className="px-6 py-4 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between bg-white dark:bg-[#0d1117] flex-shrink-0">
            {topbar ?? (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               
              </div>
            )}
          </header> */}

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {children}
          </div>

        </section>
      </motion.div>
    </main>
  );
}