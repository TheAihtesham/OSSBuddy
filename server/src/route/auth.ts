import express, { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../model/userModel";


const router: Router = express.Router();

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};


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


export default router;
