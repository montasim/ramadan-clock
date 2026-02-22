/**
 * Cache Manager
 * Unified cache management for the application
 * Provides a single interface for all caching operations
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { CACHE_CONFIG, CACHE_TAGS } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';

/**
 * Check if running in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Cache entry metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache Manager
 * Provides unified caching interface with automatic TTL management
 * In development mode, caching is disabled for better hot reload experience
 */
export class CacheManager {
  private static instance: CacheManager;
  private inMemoryCache: Map<string, CacheEntry<any>>;

  private constructor() {
    this.inMemoryCache = new Map();
    // Only start periodic cleanup in production
    if (!isDevelopment) {
      this.startCleanupInterval();
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    // In development, bypass cache to see changes immediately
    if (isDevelopment) {
      return null;
    }

    try {
      const entry = this.inMemoryCache.get(key);
      
      if (!entry) {
        return null;
      }

      // Check if expired
      if (Date.now() > entry.timestamp + entry.ttl) {
        this.inMemoryCache.delete(key);
        logger.debug('Cache entry expired', { key });
        return null;
      }

      logger.debug('Cache hit', { key });
      return entry.data as T;
    } catch (error) {
      logger.error('Error getting from cache', { key }, error as Error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // In development, skip caching
    if (isDevelopment) {
      return;
    }

    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || CACHE_TTL.LONG * 1000, // Default to long cache
      };

      this.inMemoryCache.set(key, entry);
      logger.debug('Cache set', { key, ttl: entry.ttl });
    } catch (error) {
      logger.error('Error setting cache', { key }, error as Error);
    }
  }

  /**
   * Invalidate cache by key pattern
   * @param pattern - Key pattern to match (supports wildcards *)
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let count = 0;

      for (const key of this.inMemoryCache.keys()) {
        if (regex.test(key)) {
          this.inMemoryCache.delete(key);
          count++;
        }
      }

      logger.info('Cache invalidated', { pattern, count });
    } catch (error) {
      logger.error('Error invalidating cache', { pattern }, error as Error);
    }
  }

  /**
   * Invalidate cache by tags
   * @param tags - Array of cache tags to invalidate
   */
  async invalidateTags(tags: string[]): Promise<void> {
    try {
      // Use Next.js revalidateTag for tag-based invalidation
      tags.forEach((tag) => {
        revalidateTag(tag, tag);
      });

      logger.info('Cache tags invalidated', { tags });
    } catch (error) {
      logger.error('Error invalidating cache tags', { tags }, error as Error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      const size = this.inMemoryCache.size;
      this.inMemoryCache.clear();
      logger.info('Cache cleared', { size });
    } catch (error) {
      logger.error('Error clearing cache', {}, error as Error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.inMemoryCache.size,
      keys: Array.from(this.inMemoryCache.keys()),
    };
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.inMemoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { cleaned });
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    // Clean up every hour
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Create a cached version of a function
   * In development, returns the function without caching
   * @param fn - Function to cache
   * @param keyPrefix - Prefix for cache keys
   * @param config - Cache configuration
   * @returns Cached function
   */
  cached<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyPrefix: string,
    config: { duration: number; tags: string[] }
  ): T {
    // In development, return function without caching
    if (isDevelopment) {
      return fn;
    }

    return (async (...args: any[]) => {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn(...args);
      await this.set(key, result, config.duration * 1000);

      return result;
    }) as T;
  }

  /**
   * Invalidate all schedule-related cache
   */
  async invalidateSchedule(): Promise<void> {
    await this.invalidateTags([CACHE_TAGS.SCHEDULE]);
    await this.invalidate('schedule:*');
  }

  /**
   * Invalidate all location-related cache
   */
  async invalidateLocations(): Promise<void> {
    await this.invalidateTags([CACHE_TAGS.LOCATIONS]);
    await this.invalidate('location:*');
  }

  /**
   * Invalidate all stats-related cache
   */
  async invalidateStats(): Promise<void> {
    await this.invalidateTags([CACHE_TAGS.STATS]);
    await this.invalidate('stats:*');
  }

  /**
   * Invalidate all cache
   */
  async invalidateAll(): Promise<void> {
    await this.invalidateTags([CACHE_TAGS.ALL]);
    await this.clear();
  }
}

/**
 * Get cache manager instance
 */
export function getCacheManager(): CacheManager {
  return CacheManager.getInstance();
}

/**
 * Create a cached function using Next.js unstable_cache
 * @param fn - Function to cache
 * @param keyParts - Cache key parts
 * @param config - Cache configuration
 * @returns Cached function
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  config: { revalidate: number; tags: string[] }
): T {
  return unstable_cache(fn, keyParts, config) as T;
}
