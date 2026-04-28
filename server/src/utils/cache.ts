import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export function getCachedAnalysis(repoURL: string, question: string) {
  const key = `ai:${repoURL}:${question || "full"}`;
  return cache.get<any>(key);
}

export function setCachedAnalysis(repoURL: string, question: string, data: any) {
  const key = `ai:${repoURL}:${question || "full"}`;
  cache.set(key, data);
}

export function getCacheStats() {
  return cache.getStats();
}