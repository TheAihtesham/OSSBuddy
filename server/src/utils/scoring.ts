

export interface ScoreBreakdown {
  prScore: number;
  issueScore: number;
  consistencyScore: number;
  aiScore: number;
  multiplier: number;
}

export interface GitHubStats {
  totalPRs: number;
  totalIssues: number;
  activeDays: number;
  topLang?: string;
}

const TIER_THRESHOLDS = [
  { label: "OSS Legend", min: 1000 },
  { label: "Core Contributor", min: 600 },
  { label: "Active Contributor", min: 300 },
  { label: "Rising Star", min: 100 },
  { label: "New Contributor", min: 0 },
];

const LANG_MULTIPLIERS: Record<string, number> = {
  Rust: 1.4,
  Go: 1.3,
  TypeScript: 1.2,
  Kotlin: 1.2,
  Swift: 1.2,
  Python: 1.1,
  JavaScript: 1.0,
};

export function computeScore(stats: GitHubStats): {
  totalScore: number;
  tier: string;
  breakdown: ScoreBreakdown;
} {
  const { totalPRs, totalIssues, activeDays, topLang } = stats;

  const prScore = Math.min(totalPRs * 10, 400);
  const issueScore = Math.min(totalIssues * 5, 200);
  const consistencyScore = Math.min(activeDays * 3, 300);
  const aiScore = Math.min(Math.floor((prScore + issueScore) * 0.1), 100);

  const multiplier = LANG_MULTIPLIERS[topLang ?? ""] ?? 1.0;

  const raw = (prScore + issueScore + consistencyScore + aiScore) * multiplier;
  const totalScore = Math.round(raw);

  const tier =
    TIER_THRESHOLDS.find((t) => totalScore >= t.min)?.label ??
    "New Contributor";

  return {
    totalScore,
    tier,
    breakdown: { prScore, issueScore, consistencyScore, aiScore, multiplier },
  };
}

export function getTier(score: number): string {
  return (
    TIER_THRESHOLDS.find((t) => score >= t.min)?.label ?? "New Contributor"
  );
}