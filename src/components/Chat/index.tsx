import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ChatMessage as ChatMessageType,
  DataChunk,
  InitStatus,
} from "./lib/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { StatusBar } from "./StatusBar";
import {
  isCacheValid,
  storeSecret,
  getStoredSecret,
  storeChatData,
  loadChatData,
  clearChatDB,
  hasStructuredData,
} from "./lib/db";
import { prepareDashboardChunks } from "./lib/prepare";
import { loadEmbedder, embedSingle, isWebGPUAvailable } from "./lib/ai";
import { useLLM } from "./lib/useLLM";
import { searchSimilar } from "./lib/vector";
import { createStructuredStore, type StructuredStore } from "./lib/dataStore";

// Build RAG messages for the LLM
// Uses proper message format that apply_chat_template will convert to ChatML
function buildRAGMessages(query: string, contextDocs: string[]): Array<{ role: string; content: string }> {
  const context = contextDocs.length > 0
    ? contextDocs.join("\n\n")
    : "No relevant documents found.";

  const systemContent = `You are a project management assistant. Answer questions based on the provided context documents.

Guidelines:
- For 'most expensive' or 'highest value' questions: Find the project with the largest 'total' value in the context
- For 'cheapest' or 'lowest' questions: Find the project with the smallest 'total' value
- Always include the exact project name and value in your answer
- For project lists, include the phase and assignees if available
- Be concise but include specific numbers and names
- If the context doesn't contain enough information, say so clearly`;

  const userContent = `Use the following context to answer my question:

---
${context}
---

Question: ${query}`;

  return [
    { role: "system", content: systemContent },
    { role: "user", content: userContent },
  ];
}

// Direct answer messages (when no context needed)
function buildDirectMessages(query: string): Array<{ role: string; content: string }> {
  return [
    {
      role: "system",
      content: "You are a project management assistant. Help the user with their project, budget, payment, and obligation questions. Be concise and helpful."
    },
    { role: "user", content: query },
  ];
}

const EXAMPLE_QUESTIONS = [
  "How much remaining cash do I have?",
  "What are my active projects?",
  "Show me the planned payments",
  "What is the total obligated amount?",
];

// Get direct answer from structured data for common queries
function getStructuredAnswer(query: string, store: StructuredStore): string | null {
  const q = query.toLowerCase();

  // Budget totals
  if (q.includes("budget") && (q.includes("total") || q.includes("summary"))) {
    const b = store.summaries.budget;
    return `Budget Summary:\n• Total Cash: ${fmtCurrency(b.totalCash)}\n• Total Cost: ${fmtCurrency(b.totalCost)}\n• Obligated Cash: ${fmtCurrency(b.obligatedCash)}\n• Obligated Cost: ${fmtCurrency(b.obligatedCost)}\n• Remaining Cash: ${fmtCurrency(b.remainingCash)}\n• Remaining Cost: ${fmtCurrency(b.remainingCost)}`;
  }

  // Remaining cash
  if (q.includes("remaining") && q.includes("cash")) {
    return `Remaining Cash: ${fmtCurrency(store.summaries.budget.remainingCash)}`;
  }

  // Obligated amount
  if (q.includes("obligated") || q.includes("obligation")) {
    if (q.includes("cash")) {
      return `Total Obligated Cash: ${fmtCurrency(store.summaries.budget.obligatedCash)}`;
    }
    if (q.includes("cost")) {
      return `Total Obligated Cost: ${fmtCurrency(store.summaries.budget.obligatedCost)}`;
    }
    return `Obligated Amounts:\n• Cash: ${fmtCurrency(store.summaries.budget.obligatedCash)}\n• Cost: ${fmtCurrency(store.summaries.budget.obligatedCost)}`;
  }

  // Project count
  if (q.includes("how many") && q.includes("project")) {
    const p = store.summaries.projects;
    return `Projects: ${p.totalCount} total (${p.activeCount} active)`;
  }

  // Most expensive / highest value project
  if ((q.includes("most expensive") || q.includes("highest value") || q.includes("biggest project")) && q.includes("project")) {
    const projects = Array.from(store.entities.projects.values());
    if (projects.length === 0) return null;

    const sorted = projects.sort((a, b) => b.total - a.total);
    const top = sorted[0];
    return `Most Expensive Project:\n• Name: ${top.name}\n• Value: ${fmtCurrency(top.total)}\n• Phase: ${top.phase}\n• Assignees: ${top.assignees.join(", ") || "None"}`;
  }

  // Cheapest / lowest value project
  if ((q.includes("cheapest") || q.includes("lowest value") || q.includes("smallest project")) && q.includes("project")) {
    const projects = Array.from(store.entities.projects.values());
    if (projects.length === 0) return null;

    const sorted = projects.sort((a, b) => a.total - b.total);
    const bottom = sorted[0];
    return `Lowest Value Project:\n• Name: ${bottom.name}\n• Value: ${fmtCurrency(bottom.total)}\n• Phase: ${bottom.phase}\n• Assignees: ${bottom.assignees.join(", ") || "None"}`;
  }

  // Payment totals
  if (q.includes("payment") && (q.includes("total") || q.includes("paid"))) {
    const p = store.summaries.payments;
    return `Payments:\n• Total Paid: ${fmtCurrency(p.totalPaid)}\n• Planned: ${fmtCurrency(p.totalPlanned)}`;
  }

  // Transfers
  if (q.includes("transfer")) {
    const p = store.summaries.payments;
    return `Transfers:\n• Cash In: ${fmtCurrency(p.cashInTransfers)}\n• Cash Out: ${fmtCurrency(p.cashOutTransfers)}`;
  }

  return null;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [status, setStatus] = useState<InitStatus>({
    stage: "idle",
    progress: 0,
    message: "Initializing...",
  });
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chunksRef = useRef<DataChunk[]>([]);
  const embeddingsRef = useRef<number[][]>([]);
  const storeRef = useRef<StructuredStore | null>(null);
  const initRef = useRef(false);

  const {
    isReady: llmReady,
    loadModel,
    generateResponse,
    clearPastKeyValues,
  } = useLLM();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initializeChat();
  }, []);

  async function initializeChat() {
    try {
      setStatus({
        stage: "fetching-data",
        progress: 0,
        message: "Checking local data...",
      });

      let chunks: DataChunk[] | null = null;
      let storedEmbeddings: number[][] | null = null;
      let structuredStore: StructuredStore | null = null;

      const cacheValid = await isCacheValid();
      let secret = getStoredSecret();

      if (cacheValid && secret) {
        setStatus({
          stage: "fetching-data",
          progress: 30,
          message: "Loading cached data...",
        });
        const cached = await loadChatData(secret);
        if (cached) {
          chunks = cached.chunks;
          storedEmbeddings = cached.embeddings;
          structuredStore = cached.store;
        }
      }

      if (!chunks) {
        setStatus({
          stage: "fetching-data",
          progress: 10,
          message: "Fetching data from server...",
        });
        const res = await fetch("/api/chat/data", {
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const { data, chatSecret } = await res.json();
        secret = chatSecret;
        storeSecret(chatSecret);

        setStatus({
          stage: "fetching-data",
          progress: 40,
          message: "Building structured data...",
        });

        structuredStore = createStructuredStore(data);

        setStatus({
          stage: "fetching-data",
          progress: 50,
          message: "Preparing text chunks...",
        });
        chunks = prepareDashboardChunks(data);
      }

      chunksRef.current = chunks;
      storeRef.current = structuredStore;

      setStatus({
        stage: "loading-embedder",
        progress: 0,
        message: "Loading embedding model...",
      });
      await loadEmbedder((info) => {
        if (info.progress != null) {
          setStatus((s) => ({
            ...s,
            progress: info.progress!,
            message: info.file
              ? `Downloading ${info.file.split("/").pop()}...`
              : s.message,
          }));
        }
      });

      if (!storedEmbeddings) {
        setStatus({
          stage: "embedding",
          progress: 0,
          message: "Generating embeddings...",
        });
        const texts = chunks.map((c) => c.text);
        const batchSize = 8;
        const allEmbeddings: number[][] = [];

        for (let i = 0; i < texts.length; i += batchSize) {
          const batch = texts.slice(i, i + batchSize);
          const batchEmb = await Promise.all(batch.map(t => embedSingle(t)));
          allEmbeddings.push(...batchEmb);
          setStatus((s) => ({
            ...s,
            progress: Math.round(
              ((i + batch.length) / texts.length) * 100,
            ),
            message: `Embedding data... (${Math.min(i + batch.length, texts.length)}/${texts.length})`,
          }));
        }

        storedEmbeddings = allEmbeddings;

        if (secret && structuredStore) {
          await storeChatData(secret, {
            chunks,
            embeddings: allEmbeddings,
            store: structuredStore,
          });
        }
      }

      embeddingsRef.current = storedEmbeddings;

      if (isWebGPUAvailable()) {
        setStatus({
          stage: "loading-llm",
          progress: 0,
          message: "Loading LFM2-RAG model (WebGPU)...",
        });
        await loadModel((pct) => {
          setStatus((s) => ({
            ...s,
            progress: pct,
            message:
              pct < 100
                ? `Downloading LFM2 model... ${pct}%`
                : "Preparing model...",
          }));
        });
      }

      setStatus({ stage: "ready", progress: 100, message: "Ready" });
    } catch (err) {
      console.error("[Chat] Init error:", err);
      setStatus({
        stage: "error",
        progress: 0,
        message: "Failed to initialize chat",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleSend(text: string) {
    if (generating || status.stage !== "ready") return;

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setGenerating(true);

    try {
      const store = storeRef.current;

      // First, try to get a direct answer from structured data
      if (store) {
        const directAnswer = getStructuredAnswer(text, store);
        if (directAnswer) {
          const assistantMsg: ChatMessageType = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: directAnswer,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          return;
        }
      }

      // If no direct answer, use RAG with semantic search
      if (!llmReady) {
        // Fallback: return search results directly
        const queryEmbedding = await embedSingle(text);
        const results = searchSimilar(
          queryEmbedding,
          chunksRef.current,
          embeddingsRef.current,
          5,
          0.2
        );

        const contextText = results.length > 0
          ? results.map(r => r.chunk.text).join("\n\n")
          : "No relevant data found.";

        const assistantMsg: ChatMessageType = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I found this relevant information:\n\n${contextText}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // RAG approach: retrieve context and generate answer
      const queryEmbedding = await embedSingle(text);
      const results = searchSimilar(
        queryEmbedding,
        chunksRef.current,
        embeddingsRef.current,
        5,
        0.2
      );

      const contextDocs = results.map(r => r.chunk.text);
      const messages = buildRAGMessages(text, contextDocs);

      const assistantMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      let accumulatedContent = "";
      await generateResponse(
        messages,
        [],
        (token: string) => {
          accumulatedContent += token;
          setMessages((current) => {
            const updated = [...current];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulatedContent,
            };
            return updated;
          });
        }
      );
    } catch (err) {
      console.error("[Chat] Generate error:", err);
      const errorMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setGenerating(false);
    }
  }

  function handleStop() {
    setGenerating(false);
  }

  const handleClearChat = useCallback(() => {
    setMessages([]);
    clearPastKeyValues();
  }, [clearPastKeyValues]);

  const handleClearData = async () => {
    await clearChatDB();
    handleClearChat();
    initRef.current = false;
    setStatus({ stage: "idle", progress: 0, message: "Initializing..." });
    initRef.current = true;
    initializeChat();
  };

  const isReady = status.stage === "ready";
  const hasWebGPU = isWebGPUAvailable();

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {!isReady && (
        <div className="mb-6">
          <StatusBar status={status} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && isReady && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Ask me anything
            </h3>

            <p className="text-sm text-muted-foreground mb-8 max-w-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              I can help you with budgets, projects, payments, obligations, and transfers using your local data.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {generating &&
          messages.length > 0 &&
          messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                <div className="flex gap-1">
                  <span
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-border">
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          disabled={!isReady}
          generating={generating}
        />

        {isReady && (
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/60">
            <span style={{ fontFamily: "'Space Mono', monospace" }}>
              {hasWebGPU
                ? llmReady
                  ? "LFM2-RAG WebGPU"
                  : "WebGPU (loading...)"
                : "Search only"}
              {" "}&middot;{" "}
              {chunksRef.current.length} chunks
              {storeRef.current && " + structured"}
            </span>
            <div className="flex items-center gap-4">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="hover:text-foreground transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Clear chat
                </button>
              )}
              <button
                onClick={handleClearData}
                className="hover:text-foreground transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Resync data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
