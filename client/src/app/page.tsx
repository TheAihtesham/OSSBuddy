"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Search, Code2, Cpu, Globe, Zap, Star, ShieldCheck, Sparkles, GitPullRequest, Trophy, Bot } from "lucide-react";
import { useRef } from "react";


const FLOATING_ITEMS = [
  { icon: <Zap className="w-4 h-4 text-yellow-500" />, text: "Real-time updates", delay: 0 },
  { icon: <Star className="w-4 h-4 text-blue-500" />, text: "Top-tier repos", delay: 0.5 },
  { icon: <ShieldCheck className="w-4 h-4 text-green-500" />, text: "Safe contributions", delay: 1 },
  { icon: <Sparkles className="w-4 h-4 text-purple-500" />, text: "AI-Powered", delay: 1.5 },
];

const STEPS = [
  {
    num: "01",
    title: "Connect your GitHub",
    description: "Sign in with GitHub OAuth. We sync your profile to personalize your experience instantly.",
  },
  {
    num: "02",
    title: "AI matches you to projects",
    description: "Tell us your stack and interests — Gemini finds repos with open issues waiting for you right now.",
  },
  {
    num: "03",
    title: "Contribute & climb the ranks",
    description: "Merge PRs, close issues, and build your streak. Your score updates in real time on the leaderboard.",
  },
  {
    num: "04",
    title: "Get noticed by recruiters",
    description: "Top contributors get discovered by companies actively hiring OSS developers. Turn contributions into a career.",
  },
];

const FEATURES = [
  {
    icon: <Bot className="w-5 h-5" />,
    title: "AI Project Matching",
    description: "Gemini analyzes your stack and finds repos with real open issues that match your exact skill level.",
    tag: "Powered by Gemini",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Contributor Leaderboard",
    description: "Ranked by PRs merged, issues closed, and consistency. Your public profile is shareable on LinkedIn.",
    tag: "Live Rankings",
  },
  {
    icon: <GitPullRequest className="w-5 h-5" />,
    title: "Good First Issues",
    description: "Curated beginner-friendly issues from top repos. No more scrolling through thousands of issues.",
    tag: "Beginner Friendly",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Recruiter Portal",
    description: "Companies browse the leaderboard and reach out to top contributors directly for job opportunities.",
    tag: "Get Hired",
  },
];

const MOCK_LEADERBOARD = [
  { rank: 1, username: "prathikshetty", score: "4,820", lang: "TypeScript", tier: "OSS Legend" },
  { rank: 2, username: "devmehta_oss", score: "3,950", lang: "Python", tier: "Core Contributor" },
  { rank: 3, username: "rustacean_girl", score: "3,200", lang: "Rust", tier: "Core Contributor" },
  { rank: 4, username: "golangguru", score: "2,890", lang: "Go", tier: "Active Contributor" },
];


function FloatingBadge({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
      className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-medium text-gray-600"
    >
      {icon} {text}
    </motion.div>
  );
}



export default function Home() {
  const stepsRef = useRef(null);
  const GITHUB_LOGIN = "http://localhost:8000/api/github";

  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 0.8", "end 0.3"],
  });

    const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tighter">OSSBuddy</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
          <a href="#leaderboard" className="hover:text-black transition-colors">Leaderboard</a>
          <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
        </div>

        <a
          href={GITHUB_LOGIN}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center pt-24 pb-32 px-4 min-h-[90vh] overflow-hidden">

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />

        {/* Floating badges */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-[22%] left-[6%]">
            <FloatingBadge icon={<Zap className="w-4 h-4 text-yellow-500" />} text="Real-time updates" delay={0} />
          </div>
          <div className="absolute top-[16%] right-[8%]">
            <FloatingBadge icon={<Star className="w-4 h-4 text-blue-500" />} text="Top-tier repos" delay={0.5} />
          </div>
          <div className="absolute top-[62%] left-[10%]">
            <FloatingBadge icon={<ShieldCheck className="w-4 h-4 text-green-500" />} text="Safe contributions" delay={1} />
          </div>
          <div className="absolute top-[68%] right-[12%]">
            <FloatingBadge icon={<Sparkles className="w-4 h-4 text-purple-500" />} text="AI-Powered" delay={1.5} />
          </div>
        </div>

        {/* Hero text */}
        <motion.div
          className="max-w-4xl text-center space-y-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          

          <h1 className="text-5xl md:text-7xl font-normal tracking-tight leading-tight">
            A unified platform for <br />
            <span className="font-light italic text-gray-500">exploring</span> <br />
            the open-source ecosystem.
          </h1>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            OSSBuddy uses AI to match developers with the perfect open-source projects, track contributions, and help students get hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={GITHUB_LOGIN}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Start for free
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
            >
              See how it works →
            </a>
          </div>

          <p className="text-xs text-gray-400">Free forever · No credit card required · GitHub OAuth</p>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
              Everything you need to contribute
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              From finding your first issue to getting hired — OSSBuddy covers the full journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview ── */}
      <section id="leaderboard" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
              Compete. Contribute. Get noticed.
            </h2>
            <p className="text-gray-500 text-base">
              Top contributors get discovered by companies hiring OSS developers.
            </p>
          </div>

          {/* Mock leaderboard */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold">Top Contributors</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>

            {MOCK_LEADERBOARD.map((user, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-mono text-gray-400 w-6">
                  {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">@{user.username}</p>
                  <p className="text-[10px] text-gray-400">{user.lang}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {user.tier}
                </span>
                <span className="font-mono text-sm font-bold">{user.score} <span className="text-gray-400 font-normal text-xs">pts</span></span>
              </motion.div>
            ))}

            <div className="px-6 py-4 text-center">
              <a
                href={GITHUB_LOGIN}
                className="text-xs font-medium text-gray-400 hover:text-black transition-colors"
              >
                Sign in to see your rank →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section ref={stepsRef} id="how-it-works" className="relative max-w-4xl mx-auto px-8 py-32" >
        <div className="text-center mb-20">
          <h2 className="text-4xl font-normal tracking-tight">How it works</h2>
          <p className="text-gray-500 mt-4">Master open-source contribution in four simple steps.</p>
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-100 -translate-x-1/2" />
          <motion.div style={{ scaleY }} className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-black origin-top -translate-x-1/2 z-10" />
          <div className="space-y-24">
            {STEPS.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className={`relative flex items-center justify-between md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="ml-12 md:ml-0 md:w-[45%]">
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Step {step.num}</span>
                  <h3 className="text-2xl font-semibold mt-2">{step.title}</h3>
                  <p className="text-gray-600 mt-3 leading-relaxed">{step.description}</p>
                </div>
                <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full -translate-x-1/2 flex items-center justify-center z-20">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                </div>
                <div className="hidden md:block md:w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">Simple pricing</h2>
            <p className="text-gray-500">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Free</p>
              <p className="text-3xl font-bold mb-1">₹0</p>
              <p className="text-gray-400 text-xs mb-6">Forever free</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {["Browse trending repos", "3 AI matches/day", "Leaderboard access", "Public profile"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href={GITHUB_LOGIN} className="block text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                Get started
              </a>
            </div>

            {/* Pro — highlighted */}
            <div className="bg-black text-white rounded-2xl border-2 border-black p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                Most Popular
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Pro</p>
              <p className="text-3xl font-bold mb-1">₹199<span className="text-lg font-normal text-gray-400">/mo</span></p>
              <p className="text-gray-400 text-xs mb-6">~$2.5/month</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                {["Unlimited AI matches", "Streak freeze (1/month)", "Priority leaderboard listing", "Resume PDF export", "Early recruiter visibility"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href={GITHUB_LOGIN} className="block text-center py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-100 transition-colors">
                Upgrade to Pro
              </a>
            </div>

            {/* Recruiter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Recruiter</p>
              <p className="text-3xl font-bold mb-1">₹2,999<span className="text-lg font-normal text-gray-400">/mo</span></p>
              <p className="text-gray-400 text-xs mb-6">~$35/month</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {["Browse full leaderboard", "20 contact unlocks/mo", "Advanced filters", "1 job spotlight/mo", "Candidate saved lists"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@ossbuddy.dev" className="block text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center border border-gray-100 p-16 rounded-3xl bg-gray-50">
          <motion.h2
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-normal tracking-tight mb-6"
          >
            Ready to make your <br />
            <span className="italic font-light text-gray-500">first contribution?</span>
          </motion.h2>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
            Join developers already using OSSBuddy to find projects, build streaks, and get hired.
          </p>
          <a
            href={GITHUB_LOGIN}
            className="inline-flex items-center gap-2 px-10 py-4 bg-black text-white text-base font-medium rounded-2xl hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Start for free with GitHub
          </a>
          <p className="text-xs text-gray-400 mt-4">No credit card · Free forever on the base plan</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 md:px-10 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium text-black">OSSBuddy</span>
            <span className="text-gray-300">·</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
            <a href="https://github.com/TheAihtesham/OSSBuddy" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
            <a href="mailto:hello@ossbuddy.dev" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}