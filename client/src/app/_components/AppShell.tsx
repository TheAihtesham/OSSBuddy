"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Bot,
  Globe,
  Star,
  Bookmark,
  Github,
  Trophy,
  Zap,
  GitPullRequest,
  Menu,
  X,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

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
        href: "/contributions",
        label: "My Contributions",
        icon: <GitPullRequest className="w-4 h-4" />,
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

export default function AppShell({
  children,
  topbar,
}: AppShellProps) {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentView = searchParams.get("view");

  useEffect(() => {
    const tokenFromURL = new URLSearchParams(
      window.location.search
    ).get("token");

    const token =
      tokenFromURL || localStorage.getItem("token");

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
        window.history.replaceState(
          null,
          "",
          "/dashboard"
        );
      }
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  function isActive(href: string): boolean {
    const [hrefPath, hrefQuery] = href.split("?");

    if (pathname !== hrefPath) return false;

    if (!hrefQuery) return true;

    const hrefView = new URLSearchParams(
      hrefQuery
    ).get("view");

    return currentView === hrefView;
  }

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-sans overflow-hidden">
  <div className="flex h-screen relative">

    {/* Mobile Topbar */}
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-black dark:bg-white rounded-md flex items-center justify-center">
          <Bot className="w-4 h-4 text-white dark:text-black" />
        </div>
        <span className="font-bold">OSS Buddy</span>
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161b22]"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>

    {/* Overlay */}
    <div
      onClick={() => setSidebarOpen(false)}
      className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${
        sidebarOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    />

    {/* Sidebar */}
    <aside
      className={`
        fixed lg:static top-0 left-0 z-50
        h-screen w-72
        bg-white dark:bg-[#0d1117]
        border-r border-gray-200 dark:border-[#30363d]
        p-6 flex flex-col
        transform transition-transform duration-300 ease-out
        will-change-transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Mobile close */}
      <div className="lg:hidden flex justify-end mb-4">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161b22]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white dark:text-black" />
        </div>
        <h2 className="text-xl font-bold tracking-tighter">
          OSS Buddy
        </h2>
      </div>

      {/* Nav */}
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
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer
                  ${
                    isActive(item.href)
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

      {/* User */}
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
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#30363d]"
              />
              <span className="text-sm font-medium truncate">
                {user.username}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
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
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/github`;
            }}
          >
            <Github className="w-4 h-4" />
            Login with GitHub
          </Button>
        )}
      </div>
    </aside>

    {/* Content */}
    <section className="flex-1 overflow-y-auto pt-14 lg:pt-0">
      <div className="p-4 md:p-6 lg:p-10">
        {children}
      </div>
    </section>
  </div>
</main>
  );
}