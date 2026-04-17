import { Schema, Document, model, models } from "mongoose";

interface ScoreBreakdown {
  prScore: number;
  issueScore: number;
  consistencyScore: number;
  aiScore: number;
  multiplier: number;
}

export interface IUSER extends Document {
  email: string;
  githubID: string;
  username: string;
  photoURL: string;

  // GitHub contribution stats
  totalPRs: number;
  totalIssues: number;
  activeDays: number;
  topLang?: string;

  // Leaderboard system
  totalScore: number;
  tier: string;
  breakdown?: ScoreBreakdown;

  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUSER>(
  {
    githubID: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      index: true,
    },

    photoURL: {
      type: String,
    },

    totalPRs: {
      type: Number,
      default: 0,
    },

    totalIssues: {
      type: Number,
      default: 0,
    },

    activeDays: {
      type: Number,
      default: 0,
    },

    topLang: {
      type: String,
    },

    totalScore: {
      type: Number,
      default: 0,
      index: true,
    },

    tier: {
      type: String,
      default: "New Contributor",
    },

    breakdown: {
      prScore: { type: Number },
      issueScore: { type: Number },
      consistencyScore: { type: Number },
      aiScore: { type: Number },
      multiplier: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model<IUSER>("User", userSchema);
