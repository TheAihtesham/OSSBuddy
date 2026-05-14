import axios from "axios";

const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_API_TOKEN!}`,
  Accept: "application/vnd.github+json",
};

export async function fetchGitHubStats(username: string) {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const sinceISO = since.toISOString();
 
  const [prsRes, issuesRes, eventsRes, langsRes] = await Promise.allSettled([
    axios.get(
      `${GITHUB_API_BASE}/search/issues?q=author:${username}+type:pr+created:>${sinceISO}&per_page=1`,
      { headers: HEADERS }
    ),
    axios.get(
      `${GITHUB_API_BASE}/search/issues?q=author:${username}+type:issue+created:>${sinceISO}&per_page=1`,
      { headers: HEADERS }
    ),
    axios.get(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=100`, {
      headers: HEADERS,
    }),
    axios.get(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, {
      headers: HEADERS,
    }),
  ]);
 
  const totalPRs =
    prsRes.status === "fulfilled" ? prsRes.value.data.total_count ?? 0 : 0;
  const totalIssues =
    issuesRes.status === "fulfilled" ? issuesRes.value.data.total_count ?? 0 : 0;
 
  // Unique active days from public events
  const activeDays =
    eventsRes.status === "fulfilled"
      ? new Set(
          eventsRes.value.data.map((e: any) =>
            new Date(e.created_at).toISOString().split("T")[0]
          )
        ).size
      : 0;
 
  // Top language from most recently pushed repos
  let topLang: string | undefined;
  if (langsRes.status === "fulfilled") {
    const langCount: Record<string, number> = {};
    for (const repo of langsRes.value.data) {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] ?? 0) + 1;
      }
    }
    topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
 
  return { totalPRs, totalIssues, activeDays, topLang };
}