import { openDB, type IDBPDatabase } from "idb";
import type { DataChunk } from "./types";
import type { StructuredStore } from "./dataStore";
import { serializeStore, deserializeStore } from "./dataStore";

const DB_NAME = "pm-chat";
const DB_VERSION = 2; // Bump version for structured store
const STORE_DATA = "data";
const STORE_META = "meta";

const TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const SESSION_KEY_NAME = "pm-chat-secret";

interface EncryptedPayload {
  iv: string;
  ciphertext: string;
}

interface StoredRecord {
  key: string;
  payload: EncryptedPayload;
}

interface MetaRecord {
  key: string;
  value: string | number | boolean;
}

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
      // Migration logic can be added here if needed
      if (oldVersion < 2) {
        // Clear old data on version upgrade to ensure clean slate
        // (user will need to resync)
        console.log("[Chat DB] Upgrading to v2 - clearing old data");
      }
    },
  });
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("pm-chat-salt"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(
  key: CryptoKey,
  data: unknown,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data)),
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decrypt<T>(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<T> {
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

export function storeSecret(secret: string) {
  sessionStorage.setItem(SESSION_KEY_NAME, secret);
}

export function getStoredSecret(): string | null {
  return sessionStorage.getItem(SESSION_KEY_NAME);
}

export async function isCacheValid(): Promise<boolean> {
  try {
    const db = await getDB();
    const meta = (await db.get(STORE_META, "lastSynced")) as
      | MetaRecord
      | undefined;
    if (!meta) return false;

    // Also check version compatibility
    const version = (await db.get(STORE_META, "version")) as
      | MetaRecord
      | undefined;
    if (!version || version.value !== DB_VERSION) return false;

    return Date.now() - (meta.value as number) < TTL_MS;
  } catch {
    return false;
  }
}

// Legacy function for backward compatibility
export async function storeEncryptedData(
  secret: string,
  chunks: DataChunk[],
  embeddings: number[][],
): Promise<void> {
  const key = await deriveKey(secret);
  const db = await getDB();

  const encryptedChunks = await encrypt(key, chunks);
  const encryptedEmbeddings = await encrypt(key, embeddings);

  const tx = db.transaction([STORE_DATA, STORE_META], "readwrite");
  await Promise.all([
    tx.objectStore(STORE_DATA).put({
      key: "chunks",
      payload: encryptedChunks,
    } satisfies StoredRecord),
    tx.objectStore(STORE_DATA).put({
      key: "embeddings",
      payload: encryptedEmbeddings,
    } satisfies StoredRecord),
    tx.objectStore(STORE_META).put({
      key: "lastSynced",
      value: Date.now(),
    } satisfies MetaRecord),
    tx.objectStore(STORE_META).put({
      key: "version",
      value: DB_VERSION,
    } satisfies MetaRecord),
    tx.done,
  ]);
}

// New function that stores structured data as well
export async function storeChatData(
  secret: string,
  data: {
    chunks: DataChunk[];
    embeddings: number[][];
    store: StructuredStore;
  },
): Promise<void> {
  const key = await deriveKey(secret);
  const db = await getDB();

  const encryptedChunks = await encrypt(key, data.chunks);
  const encryptedEmbeddings = await encrypt(key, data.embeddings);
  const encryptedStore = await encrypt(key, serializeStore(data.store));

  const tx = db.transaction([STORE_DATA, STORE_META], "readwrite");
  await Promise.all([
    tx.objectStore(STORE_DATA).put({
      key: "chunks",
      payload: encryptedChunks,
    } satisfies StoredRecord),
    tx.objectStore(STORE_DATA).put({
      key: "embeddings",
      payload: encryptedEmbeddings,
    } satisfies StoredRecord),
    tx.objectStore(STORE_DATA).put({
      key: "structured",
      payload: encryptedStore,
    } satisfies StoredRecord),
    tx.objectStore(STORE_META).put({
      key: "lastSynced",
      value: Date.now(),
    } satisfies MetaRecord),
    tx.objectStore(STORE_META).put({
      key: "version",
      value: DB_VERSION,
    } satisfies MetaRecord),
    tx.objectStore(STORE_META).put({
      key: "hasStructured",
      value: true,
    } satisfies MetaRecord),
    tx.done,
  ]);
}

// Legacy function for backward compatibility
export async function loadEncryptedData(
  secret: string,
): Promise<{ chunks: DataChunk[]; embeddings: number[][] } | null> {
  try {
    const key = await deriveKey(secret);
    const db = await getDB();

    const [chunksRecord, embeddingsRecord] = await Promise.all([
      db.get(STORE_DATA, "chunks") as Promise<StoredRecord | undefined>,
      db.get(STORE_DATA, "embeddings") as Promise<StoredRecord | undefined>,
    ]);

    if (!chunksRecord || !embeddingsRecord) return null;

    const chunks = await decrypt<DataChunk[]>(key, chunksRecord.payload);
    const embeddings = await decrypt<number[][]>(
      key,
      embeddingsRecord.payload,
    );

    return { chunks, embeddings };
  } catch {
    return null;
  }
}

// New function that loads structured data as well
export async function loadChatData(
  secret: string,
): Promise<{
  chunks: DataChunk[];
  embeddings: number[][];
  store: StructuredStore | null;
} | null> {
  try {
    const key = await deriveKey(secret);
    const db = await getDB();

    const [chunksRecord, embeddingsRecord, storeRecord] = await Promise.all([
      db.get(STORE_DATA, "chunks") as Promise<StoredRecord | undefined>,
      db.get(STORE_DATA, "embeddings") as Promise<StoredRecord | undefined>,
      db.get(STORE_DATA, "structured") as Promise<StoredRecord | undefined>,
    ]);

    if (!chunksRecord || !embeddingsRecord) return null;

    const chunks = await decrypt<DataChunk[]>(key, chunksRecord.payload);
    const embeddings = await decrypt<number[][]>(
      key,
      embeddingsRecord.payload,
    );

    let store: StructuredStore | null = null;
    if (storeRecord) {
      try {
        const storeStr = await decrypt<string>(key, storeRecord.payload);
        store = deserializeStore(storeStr);
      } catch (e) {
        console.warn("[Chat DB] Failed to deserialize structured store:", e);
      }
    }

    return { chunks, embeddings, store };
  } catch {
    return null;
  }
}

// Check if structured data is available
export async function hasStructuredData(): Promise<boolean> {
  try {
    const db = await getDB();
    const meta = (await db.get(STORE_META, "hasStructured")) as
      | MetaRecord
      | undefined;
    return meta?.value === true;
  } catch {
    return false;
  }
}

export async function clearChatDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_DATA, STORE_META], "readwrite");
  await Promise.all([
    tx.objectStore(STORE_DATA).clear(),
    tx.objectStore(STORE_META).clear(),
    tx.done,
  ]);
  sessionStorage.removeItem(SESSION_KEY_NAME);
}
