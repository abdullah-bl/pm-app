import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

env.allowLocalModels = false;

const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

type EmbedProgressCallback = (info: {
  status: string;
  progress?: number;
  file?: string;
}) => void;

let embedder: FeatureExtractionPipeline | null = null;

export async function loadEmbedder(
  onProgress?: EmbedProgressCallback,
): Promise<void> {
  if (embedder) return;
  embedder = (await pipeline("feature-extraction", EMBEDDING_MODEL, {
    progress_callback: onProgress,
    dtype: "fp32",
  })) as unknown as FeatureExtractionPipeline;
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!embedder) throw new Error("Embedder not loaded");
  const results: number[][] = [];
  for (const text of texts) {
    const output = await embedder(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data as Float32Array));
  }
  return results;
}

export async function embedSingle(text: string): Promise<number[]> {
  const [result] = await embed([text]);
  return result;
}

export function isWebGPUAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!(navigator as { gpu?: unknown }).gpu
  );
}
