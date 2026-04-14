"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Calendar from "react-github-calendar";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Users, UserPlus, BookOpen, Star, 
  GitCommit, Trophy, Layout, ExternalLink,
  Share2, Zap, ArrowLeft, Terminal, ShieldCheck
} from "lucide-react";

// Hover Tilt Effect Component
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - rect.left) / rect.width - 0.5);
                y.set((e.clientY - rect.top) / rect.height - 0.5);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const ProfileStats = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !profile) return <ProfileLoadingSkeleton />;

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-gray-200 font-mono selection:bg-blue-500/30">
            {/* Top Navigation Bar */}
            <nav className="max-w-6xl mx-auto p-6 flex justify-between items-center">
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        System Active
                    </div>
                </div>
            </nav>

            <motion.div 
                className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Developer Identity Header */}
                <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8 bg-white dark:bg-[#0d1117] p-8 rounded-3xl border border-gray-100 dark:border-[#30363d]">
                        <div className="relative group">
                            <img 
                                src={profile.avatar_url} 
                                className="w-32 h-32 rounded-2xl grayscale hover:grayscale-0 transition-all duration-500 border border-gray-200 dark:border-[#30363d]" 
                                alt="dev" 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg text-white shadow-xl">
                                <ShieldCheck size={16} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                                    {profile.name}
                                    <Terminal size={20} className="text-blue-500" />
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Full-Stack Engineer / Open Source Contributor</p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {['Typescript', 'Rust', 'Go', 'Next.js'].map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] font-bold text-gray-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-2 flex gap-3 justify-center md:justify-start">
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        setCopied(true); setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-tighter"
                                >
                                    <Share2 size={14} /> {copied ? "Link Copied" : "Copy Profile URL"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Card className="h-full bg-white dark:bg-[#0d1117] border-gray-100 dark:border-[#30363d] rounded-3xl p-8">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Execution Pulse</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Deployment Rate", val: "94%", color: "bg-blue-500" },
                                { label: "Code Coverage", val: "88%", color: "bg-green-500" },
                                { label: "Uptime", val: "99.9%", color: "bg-purple-500" }
                            ].map(metric => (
                                <div key={metric.label}>
                                    <div className="flex justify-between text-[11px] font-bold mb-2">
                                        <span className="text-gray-500 uppercase">{metric.label}</span>
                                        <span>{metric.val}</span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: metric.val }} className={`h-full ${metric.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </header>

                {/* Technical Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Network", value: profile.followers, icon: <Users size={18}/>, sub: "Followers" },
                        { label: "Connections", value: profile.following, icon: <UserPlus size={18}/>, sub: "Following" },
                        { label: "Source", value: profile.public_repos, icon: <BookOpen size={18}/>, sub: "Public Repos" },
                        { label: "Stars", value: profile.total_stars, icon: <Star size={18}/>, sub: "Recognition" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6 rounded-2xl shadow-sm">
                            <div className="text-blue-500 mb-3">{stat.icon}</div>
                            <h4 className="text-2xl font-black">{stat.value.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.sub}</p>
                        </Card>
                    ))}
                </div>

                {/* Deep Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap size={16} className="text-yellow-500" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Contribution Heatmap</h3>
                        </div>
                        <div className="flex justify-center py-4 grayscale dark:invert">
                            <Calendar
                                username={profile.username}
                                colorScheme="light"
                                blockSize={12}
                                blockMargin={4}
                                fontSize={12}
                            />
                        </div>
                    </Card>

                    {/* Masterpiece Repo - Interactive Redirect */}
                    <TiltCard className="h-full">
                        <a 
                            href={`https://github.com/${profile.username}/${profile.top_repo.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full border border-gray-100 dark:border-[#30363d] bg-black text-white p-8 rounded-3xl group relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 text-gray-700 group-hover:text-blue-500 transition-colors">
                                <ExternalLink size={20} />
                            </div>
                            
                            <div className="space-y-2">
                                <Trophy size={32} className="text-yellow-500 mb-4" />
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Masterpiece Repo</p>
                                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{profile.top_repo.name}</h3>
                            </div>

                            <div className="mt-12 space-y-4">
                                <div className="flex justify-between text-[11px] font-bold border-b border-white/10 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><GitCommit size={14}/> Commits</span>
                                    <span>{profile.top_repo.commits}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold border-b border-white/10 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><Star size={14}/> Stars</span>
                                    <span>{profile.top_repo.stars}</span>
                                </div>
                            </div>
                        </a>
                    </TiltCard>
                </div>
            </motion.div>
        </div>
    );
};

const ProfileLoadingSkeleton = () => (
    <div className="max-w-6xl mx-auto p-10 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
    </div>
);

export default ProfileStats;