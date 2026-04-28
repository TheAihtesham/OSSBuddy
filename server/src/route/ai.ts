import axios from "axios";
import { askGemini } from "../utils/gemini";
import router from "../route/auth";
import { aiLimiter, chatLimiter } from "../middleware/rateLimiter";
import { getCachedAnalysis, setCachedAnalysis } from "../utils/cache";
import { aiQueue } from "../utils/queue";

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

async function fetchRepoContext(owner: string, repo: string) {
  const [repoInfo, readmeRes] = await Promise.allSettled([
    axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers: HEADERS }),
    axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers: HEADERS }),
  ]);

  const repoData = repoInfo.status === "fulfilled" ? repoInfo.value.data : {};
  const defaultBranch = repoData.default_branch ?? "main";

  let readme = "";
  if (readmeRes.status === "fulfilled") {
    try {
      readme = Buffer.from(readmeRes.value.data.content, "base64")
        .toString("utf-8")
        .slice(0, 3000);
    } catch { }
  }

  // Get file tree
  const treeRes = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers: HEADERS }
  );

  const allFiles: string[] = treeRes.data.tree
    .filter((f: any) => f.type === "blob")
    .map((f: any) => f.path);

  const priorityFiles = allFiles
    .filter((p) => /\.(js|ts|jsx|tsx|py|go|rs|java)$/.test(p))
    .filter((p) => !p.includes("node_modules") && !p.includes(".test."))
    .sort((a, b) => {
      const priority = ["index", "main", "app", "server", "package.json", "readme"];
      const aScore = priority.findIndex((k) => a.toLowerCase().includes(k));
      const bScore = priority.findIndex((k) => b.toLowerCase().includes(k));
      return (aScore === -1 ? 99 : aScore) - (bScore === -1 ? 99 : bScore);
    })
    .slice(0, 5);

  let fileContext = "";
  const fileContents = await Promise.allSettled(
    priorityFiles.map((path) =>
      axios.get(
        `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${path}`
      )
    )
  );

  priorityFiles.forEach((path, i) => {
    const result = fileContents[i];
    if (result.status === "fulfilled") {
      fileContext += `\n\n// FILE: ${path}\n${String(result.value.data).slice(0, 1200)}`;
    }
  });

  return {
    repoData,
    readme,
    fileContext,
    allFiles: allFiles.slice(0, 50),
    defaultBranch,
  };
}

router.post("/ask-ai-repo", aiLimiter, async (req: any, res: any) => {
  const { repoURL, question } = req.body;

  if (!repoURL) {
    return res.status(400).json({ message: "repoURL is required" });
  }

  let owner: string, repo: string;
  try {
    const parts = new URL(repoURL).pathname.slice(1).split("/");
    owner = parts[0];
    repo  = parts[1];
    if (!owner || !repo) throw new Error();
  } catch {
    return res.status(400).json({
      message: "Invalid GitHub URL. Use: https://github.com/owner/repo",
    });
  }

  const cached = getCachedAnalysis(repoURL, question ?? "");
  if (cached) {
    console.log(`[cache hit] ${owner}/${repo}`);
    return res.json({ ...(cached as object), cached: true });
  }

  try {
    const { repoData, readme, fileContext, allFiles } = await fetchRepoContext(owner, repo);

    const systemPrompt = `
You are an expert code analyst. Analyze this GitHub repository and return a structured JSON response.
Repository: ${owner}/${repo}
Stars: ${repoData.stargazers_count ?? 0}
Language: ${repoData.language ?? "Unknown"}
Description: ${repoData.description ?? "None"}
Topics: ${(repoData.topics ?? []).join(", ")}

README (first 3000 chars):
${readme}

Key source files:
${fileContext}

All file paths (first 50):
${allFiles.join("\n")}

${question ? `User's specific question: ${question}` : "Provide a general deep analysis."}

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "overview": {
    "summary": "2-3 sentence plain English summary of what this project does",
    "purpose": "What problem does it solve?",
    "audience": "Who is it for?",
    "techStack": ["tech1", "tech2", "tech3"]
  },
  "architecture": {
    "pattern": "e.g. MVC, microservices, monorepo, etc.",
    "description": "How the codebase is structured in 2-3 sentences",
    "keyComponents": [
      { "name": "component name", "role": "what it does", "path": "file/path" }
    ]
  },
  "keyFiles": [
    { "path": "file/path", "importance": "why this file matters", "type": "entry|config|core|test" }
  ],
  "contribution": {
    "difficulty": "beginner|intermediate|advanced",
    "steps": ["step 1", "step 2", "step 3"],
    "goodFirstAreas": ["area1", "area2"],
    "warnings": ["gotcha1", "gotcha2"]
  },
  "insights": [
    { "title": "insight title", "body": "insight detail", "type": "tip|warning|info" }
  ],
  "answer": "${question ? "Direct answer to the user question" : ""}"
}
`.trim();

    
    const result = await aiQueue.add(async () => {
      const rawAnswer = await askGemini("", systemPrompt);

      let parsed: any;
      try {
        const clean = rawAnswer
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        parsed = JSON.parse(clean);
      } catch {
        // Fallback if Gemini doesn't return valid JSON
        parsed = {
          overview:     { summary: rawAnswer, purpose: "", audience: "", techStack: [] },
          architecture: { pattern: "", description: "", keyComponents: [] },
          keyFiles:     [],
          contribution: { difficulty: "intermediate", steps: [], goodFirstAreas: [], warnings: [] },
          insights:     [],
          answer:       question ? rawAnswer : "",
        };
      }

      return {
        success: true,
        repo: {
          owner,
          name:        repo,
          stars:       repoData.stargazers_count,
          language:    repoData.language,
          description: repoData.description,
        },
        analysis: parsed,
      };
    });

    // Cache the successful result
    setCachedAnalysis(repoURL, question ?? "", result);
    console.log(`[cache set] ${owner}/${repo}`);

    res.json(result);

  } catch (error: any) {
    console.error("ASK AI REPO ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "AI analysis failed", error: error.message });
  }
});


router.post("/ask-ai-followup", chatLimiter, async (req: any, res: any) => {
  const { repoURL, question, previousContext } = req.body;

  if (!repoURL || !question) {
    return res.status(400).json({ message: "repoURL and question are required" });
  }

  let owner: string, repo: string;
  try {
    const parts = new URL(repoURL).pathname.slice(1).split("/");
    owner = parts[0];
    repo  = parts[1];
    if (!owner || !repo) throw new Error();
  } catch {
    return res.status(400).json({ message: "Invalid GitHub URL" });
  }

  try {
    const { fileContext } = await fetchRepoContext(owner, repo);

    const prompt = `
You are analyzing the GitHub repo ${owner}/${repo}.
Previous analysis context: ${previousContext ?? "none"}
Source code context: ${fileContext}
User question: ${question}

Give a clear, direct, developer-friendly answer. Use bullet points where helpful. Be concise.
`.trim();

    const answer = await askGemini("", prompt);
    res.json({ answer });

  } catch (error: any) {
    console.error("FOLLOWUP ERROR:", error.message);
    res.status(500).json({ message: "Follow-up failed", error: error.message });
  }
});

export default router;