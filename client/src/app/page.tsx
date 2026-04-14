"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Search, Code2, Cpu, Globe, Zap, Star, ShieldCheck, Sparkles } from "lucide-react";
import { useRef } from "react";


const floatingItems = [
  { icon: <Zap className="w-5 h-5 text-yellow-500" />, text: "Real-time updates", top: "20%", left: "5%", speed: 0.2 },
  { icon: <Star className="w-5 h-5 text-blue-500" />, text: "Top-tier repos", top: "15%", right: "8%", speed: 0.5 },
  { icon: <ShieldCheck className="w-5 h-5 text-green-500" />, text: "Safe contributions", top: "60%", left: "12%", speed: 0.3 },
  { icon: <Sparkles className="w-5 h-5 text-purple-500" />, text: "AI-Powered", top: "70%", right: "15%", speed: 0.4 },
];

export default function Home() {
  const containerRef = useRef(null);

 
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });


  const steps = [
    { title: "Connect your GitHub", description: "Sync your profile to get personalized repository recommendations based on your tech stack.", icon: "01" },
    { title: "AI Analysis", description: "Pick a project. Our AI scans the codebase to explain the folder structure and logic in plain English.", icon: "02" },
    { title: "Find 'Good First Issues'", description: "We filter through thousands of issues to find ones that are actually beginner-friendly.", icon: "03" },
    { title: "Submit Your PR", description: "Use our built-in guidance to ensure your pull request meets the project's contribution standards.", icon: "04" },
  ];

  const features = [
    { title: "AI Repo Analysis", description: "Understand complex codebases in seconds. Our AI breaks down architecture and logic automatically.", icon: <Cpu className="w-6 h-6" /> },
    { title: "Guided Contributions", description: "Find issues that match your skill level and get step-by-step guidance on how to submit your first PR.", icon: <Code2 className="w-6 h-6" /> },
    { title: "Global Ecosystem", description: "Explore trending repositories across the globe and connect with maintainers directly.", icon: <Globe className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200 overflow-x-hidden">
      {/* 1. Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="text-xl font-bold tracking-tight">OSSBuddy</div>
        <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search repositories..." className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all" />
        </div>
        <Link href="/auth" className="px-5 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">Get Started</Link>
      </nav>

      {/* 2. Hero Section with Floating Elements */}
      <main className="relative flex flex-col items-center pt-24 pb-32 px-4 min-h-[90vh] overflow-visible">

        {/* Floating Icons Container */}
        <motion.div style={{ opacity, scale }} className="absolute inset-0 pointer-events-none hidden lg:block">
          {floatingItems.map((item, idx) => {
            // Each element moves at a different speed (Parallax)
            const yMove = useTransform(scrollY, [0, 500], [0, -200 * item.speed]);

            return (
              <motion.div
                key={idx}
                style={{
                  top: item.top,
                  left: item.left,
                  right: item.right,
                  y: yMove, 
                  opacity,   
                  scale      
                }}
                className="absolute flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 z-0"
                animate={{
                  y: [0, -10, 0], 
                }}
                transition={{
                  duration: 3 + idx, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {item.icon}
                <span className="text-sm font-medium whitespace-nowrap">{item.text}</span>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="absolute top-0 left-0 w-full h-[450px] opacity-10 pointer-events-none -z-10"
          style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`, backgroundSize: 'contain', backgroundPosition: 'center top', backgroundRepeat: 'repeat-x' }}
        />

        <motion.div className="max-w-4xl text-center space-y-8 z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-normal tracking-tight leading-tight">
              A unified platform for <br />
              <span className="font-light italic text-gray-600">exploring</span> <br />
              the open-source ecosystem.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto pt-6 leading-relaxed">
              OSSBuddy uses AI to help developers understand GitHub repositories faster and contribute meaningfully.
            </p>
          </div>
          <Link href="/dashboard" className="inline-block px-10 py-4 border border-gray-400 text-gray-800 text-lg font-medium rounded-xl hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm">
            Start Exploring
          </Link>
          
        </motion.div>
      </main>

    
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-8">

          {/* Tech Stack Marquee */}
          <div className="mb-20">
            <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">Integrated with the best</p>
            <div className="flex justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <Globe className="w-8 h-8" /> <Cpu className="w-8 h-8" /> <Code2 className="w-6 h-6" /> <Search className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
            {/* Large Feature Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-2 bg-gray-50 rounded-3xl p-10 border border-gray-100 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-semibold mb-4">Deep Repo Intelligence</h3>
                <p className="text-gray-500 max-w-sm text-lg">Our AI doesn't just read code; it understands intent. Get high-level architecture maps and logic flow diagrams instantly.</p>
              </div>
              {/* Abstract UI element representing AI */}
              <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-white rounded-full shadow-2xl border border-gray-100 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                <Cpu className="w-20 h-20 text-gray-200" />
              </div>
            </motion.div>

            {/* Small Card 1 */}
            <div className="bg-black text-white rounded-3xl p-8 flex flex-col justify-between">
              <Search className="w-8 h-8 text-gray-400" />
              <div>
                <h3 className="text-xl font-medium">Smart Search</h3>
                <p className="text-gray-400 text-sm mt-2">Find repos by "vibes" or tech stack.</p>
              </div>
            </div>

            {/* Small Card 2 */}
            <div className="border border-gray-200 rounded-3xl p-8 flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />)}
              </div>
              <div>
                <h3 className="text-xl font-medium">Community Driven</h3>
                <p className="text-gray-500 text-sm mt-2">Connect with 2k+ maintainers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Timeline Section */}
      <section ref={containerRef} className="relative max-w-4xl mx-auto px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-normal tracking-tight">How it works</h2>
          <p className="text-gray-500 mt-4">Master open-source contribution in four simple steps.</p>
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-100 -translate-x-1/2" />
          <motion.div style={{ scaleY }} className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-black origin-top -translate-x-1/2 z-10" />
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className={`relative flex items-center justify-between md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="ml-12 md:ml-0 md:w-[45%]">
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Step {step.icon}</span>
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

      {/* 5. CTA and Footer... (Same as before) */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gray-100/50 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto text-center border border-gray-100 bg-white/50 backdrop-blur-sm p-16 rounded-[3rem] shadow-sm">
          <motion.h2 initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="text-4xl md:text-5xl font-normal tracking-tight mb-6">
            Ready to make your <br /> <span className="italic font-light">first contribution?</span>
          </motion.h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-10 py-4 bg-black text-white text-lg font-medium rounded-2xl hover:bg-gray-800 transition-all">Start for Free</Link>
          </div>
        </div>
      </section>

      <footer className="py-12 px-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400 text-sm">
          <span>OSSBuddy © 2026</span>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-black">Twitter</Link>
            <Link href="#" className="hover:text-black">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}