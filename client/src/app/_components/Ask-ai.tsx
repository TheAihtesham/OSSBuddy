// "use client";

// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { ChevronRight } from "lucide-react";

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { Bot, Sparkles, Save, Github, MessageSquareText, SendHorizonal } from "lucide-react";
// import { motion } from "framer-motion";

// export default function AskAI() {
//     const [repoURL, setRepoURL] = useState("");
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [open, setOpen] = useState(false);

//     const [history, setHistory] = useState([
//         { id: 1, repo: "facebook/react", query: "Explain the Fiber architecture", date: "2 mins ago" },
//         { id: 2, repo: "vercel/next.js", query: "How does App Router handle metadata?", date: "1 hour ago" },
//     ]);

//     const handleAskAi = async () => {
//         if (!repoURL || !question) return;
//         setLoading(true);
//         try {
//             const res = await fetch("http://localhost:8000/api/ask-ai-repo", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ repoURL, question }),
//             });
//             const data = await res.json();
//             setAnswer(data.answer);
//             setOpen(true);
//         } catch (err: any) {
//             setAnswer(err?.message || "Something went wrong.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-3xl mx-auto mt-4">
//             {/* Header - More subtle */}
//             <div className="flex items-center gap-2 mb-5 px-1">
//                 <Sparkles className="w-4 h-4 text-green-600" />
//                 <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Repo Intelligence</h2>
//             </div>

//             <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Repo Input - Compact */}
//                     <div className="space-y-1.5">
//                         <label className="text-[11px] font-medium text-gray-400 ml-1">GitHub URL</label>
//                         <div className="relative">
//                             <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
//                             <Input
//                                 type="text"
//                                 placeholder="username/repo"
//                                 value={repoURL}
//                                 onChange={e => setRepoURL(e.target.value)}
//                                 className="pl-9 h-9 text-xs bg-gray-50 dark:bg-[#0d1117] border-none rounded-lg focus:ring-1 focus:ring-green-500/30"
//                             />
//                         </div>
//                     </div>

//                     {/* Question Input - Compact */}
//                     <div className="space-y-1.5">
//                         <label className="text-[11px] font-medium text-gray-400 ml-1">Your Query</label>
//                         <div className="relative">
//                             <MessageSquareText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
//                             <Input
//                                 placeholder="What does this code do?"
//                                 value={question}
//                                 onChange={(e) => setQuestion(e.target.value)}
//                                 className="pl-9 h-9 text-xs bg-gray-50 dark:bg-[#0d1117] border-none rounded-lg focus:ring-1 focus:ring-green-500/30"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-4 flex justify-end items-center gap-3 pt-4 border-t border-gray-50 dark:border-[#30363d]">
//                     <p className="text-[10px] text-gray-400 italic">Buddy will analyze the main branch by default.</p>
//                     <Button
//                         onClick={handleAskAi}
//                         disabled={loading || !question}
//                         size="sm"
//                         className="h-9 px-5 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-medium transition-all"
//                     >
//                         {loading ? (
//                             <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }} className="flex items-center gap-2">
//                                 <Bot className="w-3.5 h-3.5 animate-spin" /> Analyzing...
//                             </motion.div>
//                         ) : (
//                             <span className="flex items-center gap-2">Ask AI <SendHorizonal className="w-3 h-3" /></span>
//                         )}
//                     </Button>
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 <div className="flex items-center justify-between px-1">
//                     <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Intelligence</h3>
//                     <Button variant="ghost" className="text-[10px] h-6 text-gray-400 hover:text-black">Clear All</Button>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2">
//                     {history.map((item) => (
//                         <motion.div
//                             key={item.id}
//                             whileHover={{ x: 4 }}
//                             className="flex items-center justify-between p-3 bg-white dark:bg-[#0d1117] border border-gray-100 dark:border-[#30363d] rounded-xl group cursor-pointer"
//                         >
//                             <div className="flex items-center gap-4">
//                                 <div className="p-2 bg-gray-50 dark:bg-[#161b22] rounded-lg">
//                                     <Github className="w-3.5 h-3.5 text-gray-400" />
//                                 </div>
//                                 <div>
//                                     <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{item.repo}</p>
//                                     <p className="text-[11px] text-gray-400 truncate max-w-[300px]">{item.query}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-4">
//                                 <span className="text-[10px] text-gray-300 font-medium">{item.date}</span>
//                                 <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-black transition-colors" />
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>

//             {/* Modern Compact Response Dialog */}
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] shadow-xl rounded-xl p-0 overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-100 dark:border-[#30363d] flex justify-between items-center bg-gray-50/50">
//                         <DialogHeader>
//                             <DialogTitle className="flex items-center gap-2 text-sm font-bold">
//                                 <Bot className="w-4 h-4 text-green-600" /> Buddy's Insight
//                             </DialogTitle>
//                         </DialogHeader>
//                     </div>

//                     <div className="p-6 space-y-4">
//                         <div className="bg-gray-50 dark:bg-[#0d1117] rounded-lg p-4 border border-gray-100 dark:border-[#30363d] max-h-[350px] overflow-y-auto">
//                             <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono text-gray-600 dark:text-gray-300">
//                                 {answer}
//                             </pre>
//                         </div>

//                         <div className="flex justify-end gap-2">
//                             <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[11px] rounded-md px-4">
//                                 Close
//                             </Button>
//                             <Button onClick={() => { }} className="h-8 bg-black text-white text-[11px] rounded-md px-4 flex gap-1.5">
//                                 <Save className="w-3 h-3" /> Save to Profile
//                             </Button>
//                         </div>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }

"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Bot,
  Sparkles,
  Save,
  Github,
  SendHorizonal,
} from "lucide-react";

import { motion } from "framer-motion";

type Roadmap = {
  beginner: string[];
  intermediate: string[];
  advanced: string[];
};

export default function ContributionRoadmap() {
  const [repoURL, setRepoURL] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [history, setHistory] = useState([
    { id: 1, repo: "facebook/react", date: "5 mins ago" },
    { id: 2, repo: "vercel/next.js", date: "1 hour ago" },
  ]);

  const handleGenerateRoadmap = async () => {
    if (!repoURL) return;
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/ai/contribution-roadmap",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoURL }),
        }
      );

      const data = await res.json();
      setRoadmap(data.roadmap);
      setOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <Sparkles className="w-4 h-4 text-green-600" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Contribution Intelligence
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-gray-400 ml-1">
            GitHub Repository
          </label>

          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="https://github.com/vercel/next.js"
              value={repoURL}
              onChange={(e) => setRepoURL(e.target.value)}
              className="pl-9 h-9 text-xs bg-gray-50 dark:bg-[#0d1117] border-none rounded-lg focus:ring-1 focus:ring-green-500/30"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50 dark:border-[#30363d]">
          <p className="text-[10px] text-gray-400 italic">
            Buddy analyzes repo structure, issues & contribution guides.
          </p>

          <Button
            onClick={handleGenerateRoadmap}
            disabled={loading || !repoURL}
            size="sm"
            className="h-9 px-5 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-medium"
          >
            {loading ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <Bot className="w-3.5 h-3.5 animate-spin" />
                Analyzing Repo...
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                Generate Roadmap <SendHorizonal className="w-3 h-3" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Saved Roadmaps */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Saved Roadmaps
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {history.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-3 bg-white dark:bg-[#0d1117] border border-gray-100 dark:border-[#30363d] rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 dark:bg-[#161b22] rounded-lg">
                  <Github className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">
                    {item.repo}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Contribution Roadmap
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-300">
                  {item.date}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Roadmap Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl p-0 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2 bg-gray-50/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                <Bot className="w-4 h-4 text-green-600" />
                Contribution Roadmap
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[420px] overflow-y-auto">
            {roadmap &&
              (["beginner", "intermediate", "advanced"] as const).map(
                (level) => (
                  <div key={level}>
                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                      {level}
                    </h4>

                    <ul className="space-y-2">
                      {roadmap[level]?.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-[#30363d] rounded-lg p-3"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-8 text-[11px]"
            >
              Close
            </Button>
            <Button className="h-8 bg-black text-white text-[11px] flex gap-1.5">
              <Save className="w-3 h-3" /> Save Roadmap
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
