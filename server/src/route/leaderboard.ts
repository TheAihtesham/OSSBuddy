
import { computeScore } from "../utils/scoring";
import { User } from "../model/userModel";
import { authMiddleware } from "../middleware/auth";
import { fetchGitHubStats } from "../utils/fetchgithuStats"
import express from "express";

const router = express.Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
 
    const [users, total] = await Promise.all([
      User.find({ })
        .sort({ totalScore: -1 })
        .skip(skip)
        .limit(limit)
        .select("username photoURL totalScore tier topLang totalPRs totalIssues activeDays breakdown"),
      User.countDocuments({ }),
    ]);
 
    const ranked = users.map((u, i) => ({
      rank: skip + i + 1,
      username: u.username,
      photoURL: u.photoURL,
      totalScore: u.totalScore,
      tier: u.tier,
      topLang: u.topLang,
      totalPRs: u.totalPRs,
      totalIssues: u.totalIssues,
      activeDays: u.activeDays,
      breakdown: u.breakdown,
    }));
 
    res.json({ users: ranked, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
 
router.post("/leaderboard/sync", authMiddleware, async (req: any, res:any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const stats = await fetchGitHubStats(user.username);
    const { totalScore, tier, breakdown } = computeScore(stats);
 
    user.totalPRs = stats.totalPRs;
    user.totalIssues = stats.totalIssues;
    user.activeDays = stats.activeDays;
    user.topLang = stats.topLang;
    user.totalScore = totalScore;
    user.tier = tier;
    user.breakdown = breakdown;
 
    await user.save();
 
    res.json({
      message: "Score synced",
      totalScore,
      tier,
      breakdown,
      stats,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to sync score" });
  }
});
 

router.get("/leaderboard/me", authMiddleware, async (req: any, res:any) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username photoURL totalScore tier topLang totalPRs totalIssues activeDays breakdown"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const rank =
      (await User.countDocuments({ totalScore: { $gt: user.totalScore } })) + 1;
 
    res.json({
      rank,
      username: user.username,
      photoURL: user.photoURL,
      totalScore: user.totalScore,
      tier: user.tier,
      topLang: user.topLang,
      totalPRs: user.totalPRs,
      totalIssues: user.totalIssues,
      activeDays: user.activeDays,
      breakdown: user.breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your rank" });
  }
});
 

router.get("/leaderboard/user/:username", async (req:any, res:any) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "username photoURL totalScore tier topLang totalPRs totalIssues activeDays breakdown"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const rank =
      (await User.countDocuments({ totalScore: { $gt: user.totalScore } })) + 1;
 
    res.json({
      rank,
      username: user.username,
      photoURL: user.photoURL,
      totalScore: user.totalScore,
      tier: user.tier,
      topLang: user.topLang,
      totalPRs: user.totalPRs,
      totalIssues: user.totalIssues,
      activeDays: user.activeDays,
      breakdown: user.breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

export default router