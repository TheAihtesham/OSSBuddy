import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import passport from 'passport';
import auth from './route/auth';
import repo from './route/repo';
import profile from './route/profile';
import match_me from './route/match_me';
import leaderboard from './route/leaderboard';
import bookmark from './route/bookmark';
import ai from './route/ai';
import contributions from './route/contributions';
import { Router } from 'express';

const app = express();

app.use(cors({
  origin: [
    process.env.CLIENT_URL!,         
    "http://localhost:3000",          
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(passport.initialize());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use('/api', auth         as Router);
app.use('/api', repo         as Router);
app.use('/api', profile      as Router);
app.use('/api', leaderboard  as Router);
app.use('/api', ai           as Router);
app.use('/api', bookmark     as Router);
app.use('/api', match_me     as Router);
app.use('/api', contributions as Router);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status ?? 500).json({
    message: err.message ?? "Internal server error",
  });
});

function keepAlive() {
  if (process.env.NODE_ENV !== "production") return;
  const url = `${process.env.RENDER_URL ?? ""}/health`;
  setInterval(async () => {
    try {
      await fetch(url);
      console.log("Keep-alive ping sent");
    } catch {
      console.log("Keep-alive ping failed");
    }
  }, 10 * 60 * 1000); 
}

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    keepAlive();
  });
}).catch((err) => {
  console.error("DB connection failed:", err.message);
  process.exit(1);
});