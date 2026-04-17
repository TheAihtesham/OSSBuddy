import axios from "axios";
import router from "../route/auth";

const GITHUB_API_BASE = "https://api.github.com";

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

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

export default router