import { CACHE_TTL } from '../config'

type CacheEntry<T> = { data: T; expiresAt: number }

class MemoryCache {
    private store = new Map<string, CacheEntry<unknown>>()

    private defaultTTL: number

    constructor(defaultTTLSeconds = 60) {

        this.defaultTTL = defaultTTLSeconds * 1000
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key)
        if (!entry) return null
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key)
            return null
        }
        return entry.data as T
    }

    set<T>(key: string, data: T, ttlSeconds?: number): void {
        const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000
        this.store.set(key, { data, expiresAt: Date.now() + ttl })
    }

    clear(): void {
        this.store.clear()
    }
}

export const cache = new MemoryCache(CACHE_TTL)
