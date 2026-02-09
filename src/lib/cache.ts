// src/lib/cache.ts

const CACHE_TTL_SECONDS = 60;

const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

/** Build a cache key scoped by user (or "anon") to avoid sharing data across users */
export function cacheKey(
    pb: { authStore?: { model?: { id?: string } | null } },
    ...parts: string[]
): string {
    const uid = pb.authStore?.model?.id ?? "anon";
    return [uid, ...parts].join(":");
}

class SimpleCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private defaultTTL: number;

    constructor(defaultTTLSeconds = CACHE_TTL_SECONDS) {
        this.defaultTTL = defaultTTLSeconds * 1000;
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }

    set<T>(key: string, data: T, ttlSeconds?: number): void {
        const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000;
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttl,
        });
    }

    invalidate(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) this.cache.delete(key);
        }
    }

    // Wrapper for async fetch with cache
    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds?: number
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            if (isDev) console.log("[cache] cache hit:", key);
            return cached;
        }

        if (isDev) console.log("[cache] cache miss:", key);
        const data = await fetcher();
        this.set(key, data, ttlSeconds);
        return data;
    }
}

export const cache = new SimpleCache(CACHE_TTL_SECONDS);