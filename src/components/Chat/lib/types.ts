export interface DataChunk {
  id: string;
  text: string;
  category:
    | "budget"
    | "project"
    | "obligation"
    | "payment"
    | "transfer"
    | "summary";
  sourceId?: string;
}

export interface StoredData {
  chunks: DataChunk[];
  embeddings: Float32Array[];
  lastSynced: number;
}

export interface InitStatus {
  stage:
    | "idle"
    | "fetching-data"
    | "loading-embedder"
    | "embedding"
    | "loading-llm"
    | "ready"
    | "error";
  progress: number;
  message: string;
  error?: string;
}

export interface RenderInfo {
  call: string;
  result?: any;
  error?: string;
  input?: Record<string, any>;
}

export interface BaseMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ToolMessage {
  id: string;
  role: "tool";
  content: string;
  timestamp: number;
  renderInfo: RenderInfo[];
}

export type ChatMessage = BaseMessage | ToolMessage;
