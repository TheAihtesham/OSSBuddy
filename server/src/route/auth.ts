import express, { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

import { User } from "../model/userModel";
import { computeScore } from "../utils/scoring";
import { fetchGitHubStats } from "../utils/fetchgithuStats";

const router: Router = express.Router();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.CALL_BACK_URL!,
    },

    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        let user = await User.findOne({
          githubID: profile.id,
        });

        if (!user) {
          user = await User.create({
            githubID: profile.id,
            username: profile.username.toLowerCase(),
            email: profile.emails?.[0]?.value || "",
            photoURL: profile.photos?.[0]?.value || "",

            // defaults
            totalScore: 0,
            tier: "New Contributor",
            totalPRs: 0,
            totalIssues: 0,
            activeDays: 0,
            topLang: "",
          });
        }

        try {
          const stats = await fetchGitHubStats(user.username);

          const { totalScore, tier, breakdown } =
            computeScore(stats);

          user.totalPRs = stats.totalPRs;
          user.totalIssues = stats.totalIssues;
          user.activeDays = stats.activeDays;
          user.topLang = stats.topLang;

          user.totalScore = totalScore;
          user.tier = tier;
          user.breakdown = breakdown;

          await user.save();

          console.log(`Leaderboard synced for ${user.username}`);
        } catch (syncErr) {
          console.error("GitHub auto-sync failed:", syncErr);
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),

  async (req: any, res) => {
    try {
      const user = req.user;

      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          photoURL: user.photoURL,
        },

        process.env.JWT_SECRET!,
        {
          expiresIn: "7d",
        }
      );

      res.redirect(
        `${process.env.CLIENT_URL}/dashboard?token=${token}`
      );
    } catch (err) {
      console.error("GitHub callback error:", err);

      res.redirect(
        `${process.env.CLIENT_URL}/login?error=auth_failed`
      );
    }
  }
);

export default router;