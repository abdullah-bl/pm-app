import { useState, useRef, useCallback, useEffect } from "react";
import {
  AutoModelForCausalLM,
  AutoTokenizer,
  TextStreamer,
} from "@huggingface/transformers";

interface LLMState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  progress: number;
}

interface LLMInstance {
  model: any;
  tokenizer: any;
}

// Using LFM2-1.2B-RAG variant which is fine-tuned for RAG (Retrieval-Augmented Generation)
// This model is optimized for answering questions based on provided contextual documents
// See: https://huggingface.co/LiquidAI/LFM2-1.2B-RAG
const MODEL_ID = "onnx-community/LFM2-1.2B-RAG-ONNX";

let moduleCache: {
  instance: LLMInstance | null;
  loadingPromise: Promise<LLMInstance> | null;
} = { instance: null, loadingPromise: null };

export function useLLM() {
  const [state, setState] = useState<LLMState>({
    isLoading: false,
    isReady: false,
    error: null,
    progress: 0,
  });

  const instanceRef = useRef<LLMInstance | null>(null);
  const loadingPromiseRef = useRef<Promise<LLMInstance> | null>(null);
  const pastKeyValuesRef = useRef<any>(null);

  const loadModel = useCallback(async (onProgress?: (pct: number) => void) => {
    const existing = instanceRef.current || moduleCache.instance;
    if (existing) {
      instanceRef.current = existing;
      moduleCache.instance = existing;
      setState((prev) => ({ ...prev, isReady: true, isLoading: false }));
      return existing;
    }

    const existingPromise =
      loadingPromiseRef.current || moduleCache.loadingPromise;
    if (existingPromise) {
      try {
        const instance = await existingPromise;
        instanceRef.current = instance;
        moduleCache.instance = instance;
        setState((prev) => ({ ...prev, isReady: true, isLoading: false }));
        return instance;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load model",
        }));
        throw err;
      }
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
    }));

    const loadingPromise = (async () => {
      try {
        const progressCallback = (info: any) => {
          if (
            info.status === "progress" &&
            info.file?.endsWith(".onnx_data")
          ) {
            const pct = Math.round((info.loaded / info.total) * 100);
            setState((prev) => ({ ...prev, progress: pct }));
            onProgress?.(pct);
          }
        };

        const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
          progress_callback: progressCallback,
        });

        const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
          dtype: "q4f16",
          device: "webgpu",
          progress_callback: progressCallback,
        });

        // Note: LFM2-1.2B-RAG recommends greedy decoding (do_sample=false, temperature=0)
        // for factual accuracy with retrieved documents

        const instance: LLMInstance = { model, tokenizer };
        instanceRef.current = instance;
        moduleCache.instance = instance;
        loadingPromiseRef.current = null;
        moduleCache.loadingPromise = null;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isReady: true,
          progress: 100,
        }));
        return instance;
      } catch (err) {
        loadingPromiseRef.current = null;
        moduleCache.loadingPromise = null;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load model",
        }));
        throw err;
      }
    })();

    loadingPromiseRef.current = loadingPromise;
    moduleCache.loadingPromise = loadingPromise;
    return loadingPromise;
  }, []);

  const generateResponse = useCallback(
    async (
      messages: Array<{ role: string; content: string }>,
      tools: Array<any>,
      onToken?: (token: string) => void,
    ): Promise<string> => {
      const instance = instanceRef.current;
      if (!instance) throw new Error("Model not loaded. Call loadModel() first.");

      const { model, tokenizer } = instance;

      // Build input using chat template - this handles special tokens properly
      const input = tokenizer.apply_chat_template(messages, {
        add_generation_prompt: true,
        return_dict: true,
      });

      const streamer = onToken
        ? new TextStreamer(tokenizer, {
          skip_prompt: true,
          skip_special_tokens: true,  // Clean output without special tokens
          callback_function: (token: string) => {
            onToken(token);
          },
        })
        : undefined;

      // LFM2-1.2B-RAG: Use greedy decoding (temperature=0) for factual accuracy
      // See: https://huggingface.co/LiquidAI/LFM2-1.2B-RAG
      const { sequences, past_key_values } = await model.generate({
        ...input,
        past_key_values: pastKeyValuesRef.current,
        max_new_tokens: 8192,
        do_sample: false,
        streamer,
        temperature: 0,
        return_dict_in_generate: true,
      });
      pastKeyValuesRef.current = past_key_values;

      // Decode and clean up the response
      const response = tokenizer
        .batch_decode(sequences, { skip_special_tokens: true })[0]
        .trim();

      return response;
    },
    [],
  );

  const clearPastKeyValues = useCallback(() => {
    pastKeyValuesRef.current = null;
  }, []);

  useEffect(() => {
    if (moduleCache.instance) {
      instanceRef.current = moduleCache.instance;
      setState((prev) => ({ ...prev, isReady: true }));
    }
  }, []);

  return {
    ...state,
    loadModel,
    generateResponse,
    clearPastKeyValues,
  };
}
