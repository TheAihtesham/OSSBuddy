// ✅ Must be the first thing!
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db'
import passport from 'passport';
import auth from './route/auth';
import { Router } from 'express'

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api', auth as Router);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

});
