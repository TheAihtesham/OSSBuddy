import express, { Router } from "express";
import axios from "axios";

import { User } from "../model/userModel";
import { authMiddleware } from "../middleware/auth";

const router: Router = express.Router();

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getGitHubProfile(username: string) {
  const [{ data: githubUser }, { data: repos }] = await Promise.all([
    axios.get(`${GITHUB_API_BASE}/users/${username}`, { headers: HEADERS }),
    axios.get(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100`, { headers: HEADERS }),
  ]);

  const totalStars = repos.reduce(
    (sum: number, r: any) => sum + r.stargazers_count, 0
  );

  const topRepo = [...repos].sort(
    (a: any, b: any) => b.stargazers_count - a.stargazers_count
  )[0];

  return {
    name: githubUser.name || username,
    avatar_url: githubUser.avatar_url,
    bio: githubUser.bio || null,
    location: githubUser.location || null,
    followers: githubUser.followers,
    following: githubUser.following,
    public_repos: githubUser.public_repos,
    total_stars: totalStars,
    top_repo: topRepo
      ? { name: topRepo.name, stars: topRepo.stargazers_count }
      : null,
  };
}

// ─── GET /api/profile  (own profile, authenticated) ──────────────────────────

router.get("/profile", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const github = await getGitHubProfile(user.username);

    const rank =
      (await User.countDocuments({ totalScore: { $gt: user.totalScore } })) + 1;

    res.json({
      username: user.username,
      ...github,
      // Leaderboard stats from User model
      totalScore: user.totalScore,
      tier: user.tier,
      rank,
      totalPRs: user.totalPRs,
      totalIssues: user.totalIssues,
      activeDays: user.activeDays,
      topLang: user.topLang,
      breakdown: user.breakdown,
    });
  } catch {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

// ─── GET /api/profile/:username  (public profile, no auth) ───────────────────

router.get("/profile/:username", async (req: any, res: any) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const [github, rank] = await Promise.all([
      getGitHubProfile(username),
      User.countDocuments({ totalScore: { $gt: user.totalScore } }),
    ]);

    res.json({
      username: user.username,
      ...github,
      // Leaderboard stats — all on User model, no separate model needed
      totalScore: user.totalScore,
      tier: user.tier,
      rank: rank + 1,
      totalPRs: user.totalPRs,
      totalIssues: user.totalIssues,
      activeDays: user.activeDays,
      topLang: user.topLang,
      breakdown: user.breakdown,
    });
  } catch {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

export default router;