import express, { Router } from "express";
import axios from "axios";
import { authMiddleware } from "../middleware/auth";
import { User } from "../model/userModel";

const router: Router = express.Router();

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

async function fetchAllPages(url: string, maxPages = 5) {
  let results: any[] = [];
  let page = 1;

  while (page <= maxPages) {
    const { data } = await axios.get(`${url}&page=${page}&per_page=30`, { headers: HEADERS });
    const items = data.items ?? [];
    results = [...results, ...items];
    if (items.length < 30) break;
    page++;
  }

  return results;
}

router.get("/contributions", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username } = user;

    const [prs, issues] = await Promise.all([
      fetchAllPages(
        `${GITHUB_API_BASE}/search/issues?q=type:pr+author:${username}+is:merged`
      ),
      fetchAllPages(
        `${GITHUB_API_BASE}/search/issues?q=type:issue+author:${username}+is:closed`
      ),
    ]);

    const processedPRs = prs.map((pr: any) => {
      const repoParts = pr.repository_url?.replace("https://api.github.com/repos/", "").split("/") ?? [];
      const owner = repoParts[0] ?? "";
      const repo  = repoParts[1] ?? "";

      return {
        id:         pr.id,
        type:       "pr",
        title:      pr.title,
        url:        pr.html_url,
        state:      "merged",
        repo:       `${owner}/${repo}`,
        repoOwner:  owner,
        repoName:   repo,
        createdAt:  pr.created_at,
        closedAt:   pr.closed_at,
        mergedAt:   pr.pull_request?.merged_at ?? pr.closed_at,
        labels:     pr.labels?.map((l: any) => l.name) ?? [],
        number:     pr.number,
      };
    });

    const processedIssues = issues.map((issue: any) => {
      const repoParts = issue.repository_url?.replace("https://api.github.com/repos/", "").split("/") ?? [];
      const owner = repoParts[0] ?? "";
      const repo  = repoParts[1] ?? "";

      return {
        id:        issue.id,
        type:      "issue",
        title:     issue.title,
        url:       issue.html_url,
        state:     "closed",
        repo:      `${owner}/${repo}`,
        repoOwner: owner,
        repoName:  repo,
        createdAt: issue.created_at,
        closedAt:  issue.closed_at,
        labels:    issue.labels?.map((l: any) => l.name) ?? [],
        number:    issue.number,
      };
    });

    const all = [...processedPRs, ...processedIssues].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const monthlyMap: Record<string, { prs: number; issues: number }> = {};

    all.forEach((item) => {
      const month = item.createdAt?.slice(0, 7);
      if (!month) return;
      if (!monthlyMap[month]) monthlyMap[month] = { prs: 0, issues: 0 };
      if (item.type === "pr")    monthlyMap[month].prs++;
      if (item.type === "issue") monthlyMap[month].issues++;
    });

    const now = new Date();
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: key,
        label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        prs:    monthlyMap[key]?.prs    ?? 0,
        issues: monthlyMap[key]?.issues ?? 0,
      };
    });

    const repoMap: Record<string, { name: string; prs: number; issues: number; lastActivity: string }> = {};

    all.forEach((item) => {
      if (!item.repo) return;
      if (!repoMap[item.repo]) {
        repoMap[item.repo] = { name: item.repo, prs: 0, issues: 0, lastActivity: item.createdAt };
      }
      if (item.type === "pr")    repoMap[item.repo].prs++;
      if (item.type === "issue") repoMap[item.repo].issues++;
      if (item.createdAt > repoMap[item.repo].lastActivity) {
        repoMap[item.repo].lastActivity = item.createdAt;
      }
    });

    const repos = Object.values(repoMap)
      .sort((a, b) => (b.prs + b.issues) - (a.prs + a.issues))
      .slice(0, 10);

    const milestones = [];
    const totalPRs    = processedPRs.length;
    const totalIssues = processedIssues.length;

    if (totalPRs >= 1)  milestones.push({ id: "first_pr",     label: "First Merged PR 🎉",        achieved: true,  target: 1,   current: totalPRs    });
    if (totalPRs >= 5)  milestones.push({ id: "five_prs",     label: "5 PRs Merged 🚀",            achieved: true,  target: 5,   current: totalPRs    });
    if (totalPRs >= 10) milestones.push({ id: "ten_prs",      label: "10 PRs Merged 💪",           achieved: true,  target: 10,  current: totalPRs    });
    if (totalPRs >= 25) milestones.push({ id: "twenty5_prs",  label: "25 PRs Merged ⭐",           achieved: true,  target: 25,  current: totalPRs    });
    if (totalPRs >= 50) milestones.push({ id: "fifty_prs",    label: "50 PRs Merged 👑",           achieved: true,  target: 50,  current: totalPRs    });

    const nextTargets = [1, 5, 10, 25, 50, 100];
    const nextTarget  = nextTargets.find((t) => t > totalPRs);
    if (nextTarget) {
      milestones.push({
        id:       `next_${nextTarget}`,
        label:    `${nextTarget} PRs Merged`,
        achieved: false,
        target:   nextTarget,
        current:  totalPRs,
      });
    }

 
    const uniqueRepos = Object.keys(repoMap).length;
    if (uniqueRepos >= 3)  milestones.push({ id: "three_repos",  label: "Contributed to 3 repos 🌍",  achieved: true,  target: 3,  current: uniqueRepos });
    if (uniqueRepos >= 10) milestones.push({ id: "ten_repos",    label: "10 Repos Contributed 🔥",    achieved: true,  target: 10, current: uniqueRepos });


    const stats = {
      totalPRs,
      totalIssues,
      totalContributions: all.length,
      uniqueRepos,
      mostActiveMonth: monthly.reduce((a, b) =>
        (a.prs + a.issues) > (b.prs + b.issues) ? a : b
      ).label,
      firstContribution: all[all.length - 1]?.createdAt ?? null,
      latestContribution: all[0]?.createdAt ?? null,
    };

    res.json({
      username,
      stats,
      monthly,
      repos,
      milestones,
      timeline: all.slice(0, 50), 
    });

  } catch (err: any) {
    console.error("CONTRIBUTIONS ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch contributions", error: err.message });
  }
});

export default router;