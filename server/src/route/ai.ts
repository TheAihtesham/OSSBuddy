import axios from "axios";
import { askGemini } from "../utils/gemini";
import { saveAns } from "../model/saveAnswer";
import router from "../route/auth";

const GITHUB_API_BASE = "https://api.github.com";

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

// router.post("/ask-ai-repo", async (req, res) => {
//   const { repoURL, question } = req.body;

//   try {
//     const [owner, repo] = new URL(repoURL).pathname.slice(1).split("/");

//     const repoInfo = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
//       { headers: HEADERS }
//     );

//     const defaultBranch = repoInfo.data.default_branch;

//     const treeRes = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
//       { headers: HEADERS }
//     );

//     const files = treeRes.data.tree
//       .filter(
//         (f: any) =>
//           f.type === "blob" && /\.(js|ts|jsx|tsx)$/.test(f.path)
//       )
//       .slice(0, 4);

//     let context = "";

//     for (const file of files) {
//       const raw = await axios.get(
//         `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`
//       );

//       context += `\n// ${file.path}\n${raw.data.slice(0, 1500)}`;
//     }

//     const answer = await askGemini(context, question);
//     res.json({ answer });

//   } catch (error: any) {
//     console.error("ASK AI REPO ERROR:", error.response?.data || error.message);
//     res.status(500).json({
//       message: "AI failed",
//       error: error.response?.data || error.message,
//     });
//   }
// });

router.post("/ai/contribution-roadmap", async (req, res) => {
  const { repoURL } = req.body;

  try {
    const [owner, repo] = new URL(repoURL).pathname.slice(1).split("/");

    /* 1️⃣ Repo metadata */
    const repoRes = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers: HEADERS }
    );

    /* 2️⃣ README */
    let readme = "";
    try {
      const readmeRes = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
        { headers: HEADERS }
      );

      readme = Buffer.from(
        readmeRes.data.content,
        "base64"
      ).toString("utf-8").slice(0, 4000);
    } catch { }

    /* 3️⃣ CONTRIBUTING.md (optional) */
    let contributing = "";
    try {
      const contRes = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/CONTRIBUTING.md`,
        { headers: HEADERS }
      );

      contributing = Buffer.from(
        contRes.data.content,
        "base64"
      ).toString("utf-8").slice(0, 3000);
    } catch { }

    /* 4️⃣ Good first issues */
    const issuesRes = await axios.get(
      `${GITHUB_API_BASE}/search/issues`,
      {
        headers: HEADERS,
        params: {
          q: `repo:${owner}/${repo} label:"good first issue" state:open`,
          per_page: 5,
        },
      }
    );

    const issues = issuesRes.data.items.map((i: any) => ({
      title: i.title,
      url: i.html_url,
    }));

    /* 5️⃣ AI Prompt */
    const prompt = `
You are an expert open-source mentor.

Repository:
- Name: ${owner}/${repo}
- Description: ${repoRes.data.description}
- Language: ${repoRes.data.language}

README:
${readme || "No README found"}

CONTRIBUTING:
${contributing || "No contributing guide"}

Good First Issues:
${issues.map((i: any) => `- ${i.title}`).join("\n") || "None"}

Create a clear contribution roadmap with:
1. Project overview (simple)
2. Local setup steps
3. Beginner-friendly areas
4. Suggested first issues
5. Difficulty level (Beginner/Intermediate/Advanced)
6. Estimated time
7. Skills required

Use bullet points. Be concise and friendly.
`;

    /* 6️⃣ Call Gemini */
    const roadmap = await askGemini("", prompt);

    res.json({ roadmap });

  } catch (error: any) {
    console.error("ROADMAP AI ERROR:", error.message);
    res.status(500).json({ message: "Failed to generate roadmap" });
  }
});

router.post("/save-answer", async (req, res: any) => {
  const { repoURL, question, answer } = req.body;
  if (!repoURL || !question || !answer) {
    return res.status(400).json({ message: "All fields required" });
  }

  const saved = await saveAns.create({ repoURL, question, answer });
  res.json(saved);
});

export default router