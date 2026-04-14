import express, { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import axios from "axios";
import { Strategy as GitHubStrategy } from "passport-github2";

import { User } from "../model/userModel";
import { Bookmark } from "../model/bookmark";
import { saveAns } from "../model/saveAnswer";
import { askGemini } from "../utils/gemini";
import { authMiddleware } from "../middleware/auth";

const router: Router = express.Router();

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

// --------------------- GitHub OAuth ---------------------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.CALL_BACK_URL!,
    },
    async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
      try {
        let user = await User.findOne({ githubID: profile.id });

        if (!user) {
          user = await User.create({
            githubID: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value || "",
            photoURL: profile.photos?.[0]?.value || "",
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        photoURL: user.photoURL,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

// --------------------- Trending Repos ---------------------
router.get("/trending-repos", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 10;

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const date = since.toISOString().split("T")[0];

    const { data } = await axios.get(
      `${GITHUB_API_BASE}/search/repositories?q=created:>${date}+stars:>10&sort=stars&order=desc&page=${page}&per_page=${per_page}`,
      { headers: HEADERS }
    );

    res.json({ items: data.items, total: data.total_count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trending repos" });
  }
});

// --------------------- Good First Issues ---------------------
router.get("/good-first-issues", async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const per_page = parseInt(req.query.per_page as string) || 10;

  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/search/issues`,
      {
        headers: HEADERS,
        params: {
          q: 'label:"good first issue" state:open is:issue',
          sort: "created",
          order: "desc",
          page,
          per_page,
        },
      }
    );

    const items = response.data.items;

    const formattedItems = await Promise.all(
      items.map(async (issue: any) => {
        try {
          // 🔥 Fetch repository details
          const repoRes = await axios.get(issue.repository_url, {
            headers: HEADERS,
          });

          const repo = repoRes.data;

          return {
            id: issue.id,
            name: `${issue.title}`,
            html_url: issue.html_url,
            description: issue.body?.substring(0, 150) || "No description",
            stargazers_count: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            created_at: issue.created_at,
            owner: {
              login: repo.owner.login,
            },
          };
        } catch {
          return null;
        }
      })
    );

    res.status(200).json({
      items: formattedItems.filter(Boolean),
      current_page: page,
      per_page,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching good first issues" });
  }
});


// --------------------- Search Repos ---------------------
router.get("/search-repos", async (req: any, res: any) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ message: "Query required" });

  try {
    const { data } = await axios.get(
      "https://api.github.com/search/repositories",
      {
        params: { q, sort: "stars", order: "desc" },
        headers: HEADERS,
      }
    );

    res.json({ items: data.items });
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
});

// --------------------- Ask AI Repo ---------------------
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


// --------------------- Save Answer ---------------------
router.post("/save-answer", async (req, res: any) => {
  const { repoURL, question, answer } = req.body;
  if (!repoURL || !question || !answer) {
    return res.status(400).json({ message: "All fields required" });
  }

  const saved = await saveAns.create({ repoURL, question, answer });
  res.json(saved);
});

// --------------------- Bookmarks ---------------------
router.post("/bookmarks", authMiddleware, async (req: any, res: any) => {
  const { repoURL, name, description, language, forks, stargazers_count } = req.body;

  const exists = await Bookmark.findOne({
    githubID: req.user.id,
    repoURL,
  });

  if (exists) return res.json({ message: "Already bookmarked" });

  const bookmark = await Bookmark.create({
    githubID: req.user.id,
    repoURL,
    name,
    description,
    language,
    forks,
    stargazers_count,
  });

  res.status(201).json(bookmark);
});

router.get("/get-bookmarks", authMiddleware, async (req: any, res) => {
  const bookmarks = await Bookmark.find({ githubID: req.user.id });
  res.json({ bookmarks });
});

router.delete("/delete-bookmark/:bookmarkId", authMiddleware, async(req: any, res: any) => {
  try {
    const { bookmarkId } = req.params;

    const deletedBookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      githubID: req.user.id, 
    });

    if (!deletedBookmark) {
      return res.status(404).json({
        message: "Bookmark not found or not authorized",
      });
    }

    res.json({
      message: "Bookmark deleted successfully",
      bookmark: deletedBookmark,
    });
  } catch (error) {
    console.error("DELETE BOOKMARK ERROR:", error);
    res.status(500).json({ message: "Failed to delete bookmark" });
  }
}
);


// --------------------- Profile ---------------------
router.get("/profile", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { data: githubUser } = await axios.get(
      `${GITHUB_API_BASE}/users/${user.username}`,
      { headers: HEADERS }
    );

    const { data: repos } = await axios.get(
      `${GITHUB_API_BASE}/users/${user.username}/repos?per_page=100`,
      { headers: HEADERS }
    );

    const totalStars = repos.reduce(
      (sum: number, r: any) => sum + r.stargazers_count,
      0
    );

    const topRepo = repos.sort(
      (a: any, b: any) => b.stargazers_count - a.stargazers_count
    )[0];

    res.json({
      username: user.username,
      name: githubUser.name || user.username,
      avatar_url: githubUser.avatar_url,
      followers: githubUser.followers,
      following: githubUser.following,
      public_repos: githubUser.public_repos,
      total_stars: totalStars,
      top_repo: topRepo
        ? { name: topRepo.name, stars: topRepo.stargazers_count }
        : null,
    });
  } catch {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});


export default router;
