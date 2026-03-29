import type { DataChunk } from "./types";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface SearchResult {
  chunk: DataChunk;
  score: number;
}

export function searchSimilar(
  queryEmbedding: number[],
  chunks: DataChunk[],
  embeddings: number[][],
  topK = 5,
  threshold = 0.3,
): SearchResult[] {
  const scored: SearchResult[] = [];

  for (let i = 0; i < embeddings.length; i++) {
    const score = cosineSimilarity(queryEmbedding, embeddings[i]);
    if (score >= threshold) {
      scored.push({ chunk: chunks[i], score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
