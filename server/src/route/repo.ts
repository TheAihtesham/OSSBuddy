import axios from "axios";
import router from "../route/auth";

const GITHUB_API_BASE = "https://api.github.com";

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

function isEnglishRepo(text: string) {
  if (!text) return true;

  const containsChinese = /[\u4E00-\u9FFF]/.test(text);

  const containsJapanese = /[\u3040-\u30ff]/.test(text);

  const containsKorean = /[\uac00-\ud7af]/.test(text);

  return (
    !containsChinese &&
    !containsJapanese &&
    !containsKorean
  );
}

function isHighQualityRepo(repo: any) {
  const text =
    `${repo.name || ""} ${repo.description || ""}`.toLowerCase();

  const blockedWords = [
    "tutorial",
    "course",
    "demo",
    "practice",
    "test",
    "bootcamp",
    "cheatsheet",
    "awesome-",
    "interview",
    "learning",
    "example",
    "samples",
    "roadmap",
    "notes",
    "guide",
    "ebook",
    "template",
    "starter",
    "boilerplate",
    "100-days",
    "30-days",
  ];

  const hasBlockedWord = blockedWords.some((word) =>
    text.includes(word)
  );

  if (hasBlockedWord) return false;

  if (!isEnglishRepo(text)) return false;

  if (
    !repo.description ||
    repo.description.trim().length < 15
  ) {
    return false;
  }

  const pushedDate = repo.pushed_at
    ? new Date(repo.pushed_at).getTime()
    : 0;

  const daysSincePush =
    (Date.now() - pushedDate) / 86400000;

  if (daysSincePush > 180) {
    return false;
  }

  if (
    repo.stargazers_count < 50 &&
    repo.forks_count < 10
  ) {
    return false;
  }

  return true;
}

router.get("/trending-repos", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const per_page =
      Number(req.query.per_page) || 10;

    const language = req.query.language as string;

    let query =
      `stars:>500 pushed:>2025-01-01 archived:false`;

    if (language && language !== "All") {
      query += ` language:${language}`;
    }

    const { data } = await axios.get(
      `${GITHUB_API_BASE}/search/repositories`,
      {
        headers: HEADERS,
        params: {
          q: query,
          sort: "stars",
          order: "desc",
          page,
          per_page,
        },
      }
    );

    const cleanedRepos = data.items.filter(
      (repo: any) => isHighQualityRepo(repo)
    );

    res.json({
      items: cleanedRepos,
      total: cleanedRepos.length,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch trending repos",
    });
  }
});

router.get("/good-first-issues", async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const per_page = parseInt(req.query.per_page as string) || 10;
  const language = req.query.language as string;

  try {

    let query = `label:"good first issue" state:open is:issue`;

    if (language && language !== "All") {
      query += ` language:${language}`;
    }

    const response = await axios.get(
      `${GITHUB_API_BASE}/search/issues`,
      {
        headers: HEADERS,
        params: {
          q: query,
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
          const repoRes = await axios.get(issue.repository_url, {
            headers: HEADERS,
          });

          const repo = repoRes.data;

          return {
            id: issue.id,
            name: issue.title,
            html_url: issue.html_url,
            description:
              issue.body?.substring(0, 150) || "No description",
            stargazers_count: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            created_at: issue.created_at,
            pushed_at: repo.pushed_at,
            open_issues_count: repo.open_issues_count,
            owner: {
              login: repo.owner.login,
              avatar_url: repo.owner.avatar_url,
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

    res.status(500).json({
      message: "Error fetching good first issues",
    });
  }
});


router.get("/search-repos", async (req: any, res: any) => {
  const q = req.query.q as string;

  const page = Number(req.query.page) || 1;

  const per_page =
    Number(req.query.per_page) || 10;

  if (!q) {
    return res.status(400).json({
      message: "Query required",
    });
  }

  try {
    let enhancedQuery =
      `${q} stars:>50 archived:false`;

    const { data } = await axios.get(
      `${GITHUB_API_BASE}/search/repositories`,
      {
        params: {
          q: enhancedQuery,

          sort: "stars",

          order: "desc",

          page,

          per_page,
        },

        headers: HEADERS,
      }
    );

    const cleanedRepos = data.items.filter(
      (repo: any) => isHighQualityRepo(repo)
    );

    res.json({
      items: cleanedRepos,

      total: cleanedRepos.length,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Search failed",
    });
  }
});

export default router;