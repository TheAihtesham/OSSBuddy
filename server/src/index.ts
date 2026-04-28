import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db'
import passport from 'passport';
import auth from './route/auth';
import repo from './route/repo'
import profile from './route/profile'
import match_me from './route/match_me'
import leaderboard from './route/leaderboard'
import bookmark from './route/bookmark'
import ai from './route/ai'

import { Router } from 'express'

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api', auth as Router);
app.use('/api', repo as Router);
app.use('/api', profile as Router);
app.use('/api', leaderboard as Router);
app.use('/api', ai as Router);
app.use('/api', bookmark as Router);
app.use('/api', match_me as Router);



const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

});
