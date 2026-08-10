/**
 * Local Storage and In-Memory Cache Service for Open-Meteo API Responses
 */

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_PREFIX = 'weather_analytics_cache_';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for historical weather data

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Generates a deterministic cache key from parameters
   */
  public generateKey(prefix: string, params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys.map((k) => `${k}=${String(params[k])}`).join('&');
    return `${CACHE_PREFIX}${prefix}_${str}`;
  }

  /**
   * Retrieves item from cache if not expired
   */
  public get<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
    // 1. Check memory cache
    const mem = this.memoryCache.get(key);
    if (mem) {
      if (Date.now() - mem.timestamp < ttlMs) {
        return mem.data as T;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // 2. Check localStorage
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < ttlMs) {
        // Store back in memory cache for fast access
        this.memoryCache.set(key, parsed);
        return parsed.data;
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    return null;
  }

  /**
   * Stores item in cache
   */
  public set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    this.memoryCache.set(key, entry);

    const serializedEntry = JSON.stringify(entry);
    try {
      localStorage.setItem(key, serializedEntry);
    } catch (initialError) {
      // Historical ranges can be large. Evict the oldest cached responses and
      // retry, while retaining the new response in memory if storage is full.
      try {
        const candidates: Array<{ key: string; timestamp: number }> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const candidateKey = localStorage.key(i);
          if (!candidateKey || candidateKey === key || !candidateKey.startsWith(CACHE_PREFIX)) continue;
          try {
            const raw = localStorage.getItem(candidateKey);
            const timestamp = raw ? JSON.parse(raw)?.timestamp ?? 0 : 0;
            candidates.push({ key: candidateKey, timestamp });
          } catch {
            candidates.push({ key: candidateKey, timestamp: 0 });
          }
        }

        candidates.sort((a, b) => a.timestamp - b.timestamp);
        for (const candidate of candidates) {
          localStorage.removeItem(candidate.key);
          try {
            localStorage.setItem(key, serializedEntry);
            return;
          } catch {
            // Continue evicting until enough space is available.
          }
        }
      } catch {
        // Memory cache remains available even when persistent storage fails.
      }
      console.warn('LocalStorage cache is full; response retained in memory only.', initialError);
    }
  }

  /**
   * Removes item from cache
   */
  public delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  /**
   * Clears all weather analytics cached data
   */
  public clearAll(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }
}

export const cacheService = new CacheService();
