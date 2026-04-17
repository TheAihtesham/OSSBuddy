import { askGemini } from "../utils/gemini";
import router from "../route/auth";
import { authMiddleware } from "../middleware/auth";
import axios from 'axios';


const GITHUB_API_BASE = "https://api.github.com";

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};


interface MatchRequest {
  stack: string[];        
  skillLevel: string;     
  interests: string[];    
}

interface GeminiRepo {
  name: string;
  reason: string;
  goodFirstIssueQuery: string;
}

interface MatchedRepo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  reason: string;
  openIssues: number;
  goodFirstIssues: GoodFirstIssue[];
}

interface GoodFirstIssue {
  title: string;
  url: string;
  number: number;
  createdAt: string;
  labels: string[];
}

async function fetchGoodFirstIssues(
  repoFullName: string,
  skillLevel: string
): Promise<GoodFirstIssue[]> {
  const labelMap: Record<string, string> = {
    beginner:     "good+first+issue",
    intermediate: "help+wanted",
    advanced:     "help+wanted",
  };
  const label = labelMap[skillLevel] ?? "good+first+issue";

  try {
    const { data } = await axios.get(
      `${GITHUB_API_BASE}/repos/${repoFullName}/issues?labels=${label}&state=open&per_page=3&sort=created&direction=desc`,
      { headers: HEADERS }
    );
    return data.map((issue: any) => ({
      title: issue.title,
      url: issue.html_url,
      number: issue.number,
      createdAt: issue.created_at,
      labels: issue.labels.map((l: any) => l.name),
    }));
  } catch {
    return [];
  }
}

async function fetchRepoMeta(repoFullName: string) {
  try {
    const { data } = await axios.get(
      `${GITHUB_API_BASE}/repos/${repoFullName}`,
      { headers: HEADERS }
    );
    return {
      fullName: data.full_name,
      description: data.description ?? "",
      url: data.html_url,
      stars: data.stargazers_count,
      language: data.language ?? "Unknown",
      openIssues: data.open_issues_count,
    };
  } catch {
    return null;
  }
}

function buildGeminiContext(body: MatchRequest): string {
  return `You are OSSBuddy's AI project matcher. Your job is to recommend exactly 5 real, active open-source GitHub repositories that perfectly match a developer's profile.

Developer Profile:
- Tech Stack: ${body.stack.join(", ")}
- Skill Level: ${body.skillLevel}
- Interests: ${body.interests.join(", ")}

Rules:
1. Return ONLY a valid JSON array, no markdown, no explanation, no backticks.
2. Each item must have exactly: "name" (owner/repo format), "reason" (1 sentence why it matches), "goodFirstIssueQuery" (label to search for issues).
3. Only recommend repos that are actively maintained (recent commits), have good-first-issue or help-wanted labels, and match the stack closely.
4. For beginners: prefer repos with friendly communities and good documentation.
5. For advanced: prefer core infrastructure, compilers, runtimes, or complex systems.
6. Vary the domains — don't recommend 5 repos of the same type.

Return format (strict JSON array, no other text):
[
  {
    "name": "owner/repo",
    "reason": "Why this is a great match for this developer",
    "goodFirstIssueQuery": "good first issue"
  }
]`;
}

router.post("/match", authMiddleware, async (req: any, res:any) => {
  try {
    const body: MatchRequest = req.body;

    if (!body.stack?.length || !body.skillLevel || !body.interests?.length) {
      return res.status(400).json({
        message: "stack, skillLevel, and interests are required",
      });
    }

    // 1. Ask Gemini for repo recommendations
    const context = buildGeminiContext(body);
    const rawResponse = await askGemini(context, "Recommend 5 repos now.");

    // 2. Parse Gemini JSON
    let geminiRepos: GeminiRepo[] = [];
    try {
      const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      geminiRepos = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: "Failed to parse Gemini response" });
    }

    if (!Array.isArray(geminiRepos) || geminiRepos.length === 0) {
      return res.status(500).json({ message: "Gemini returned no recommendations" });
    }

    // 3. Enrich each recommendation with live GitHub data (parallel)
    const enriched = await Promise.all(
      geminiRepos.slice(0, 5).map(async (rec): Promise<MatchedRepo | null> => {
        const [meta, issues] = await Promise.all([
          fetchRepoMeta(rec.name),
          fetchGoodFirstIssues(rec.name, body.skillLevel),
        ]);

        if (!meta) return null;

        return {
          name: rec.name.split("/")[1],
          fullName: meta.fullName,
          description: meta.description,
          url: meta.url,
          stars: meta.stars,
          language: meta.language,
          reason: rec.reason,
          openIssues: meta.openIssues,
          goodFirstIssues: issues,
        };
      })
    );

    const results = enriched.filter(Boolean) as MatchedRepo[];

    res.json({ repos: results, count: results.length });
  } catch (err) {
    console.error("[match] error:", err);
    res.status(500).json({ message: "Failed to match projects" });
  }
});

export default router