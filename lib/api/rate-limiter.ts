/**
 * Rate Limiter
 * In-memory rate limiting for API endpoints
 * For production, consider using Redis-based rate limiting
 */

import { logger } from '@/lib/logger';

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * In-memory rate limiter implementation
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60 * 1000) {
    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Check if a request is allowed under the rate limit
   */
  async checkLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    // Get or create entry
    let entry = this.store.get(identifier);

    if (!entry || now >= entry.resetAt) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetAt,
      };
      this.store.set(identifier, entry);
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Update entry
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset the rate limit for an identifier
   */
  async reset(identifier: string): Promise<void> {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get current store size (for monitoring)
   */
  getStoreSize(): number {
    return this.store.size;
  }

  /**
   * Destroy the rate limiter and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
let globalRateLimiter: RateLimiter | null = null;

/**
 * Get or create the global rate limiter instance
 */
export function getGlobalRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter();
  }
  return globalRateLimiter;
}

/**
 * Reset the global rate limiter (useful for testing)
 */
export function resetGlobalRateLimiter(): void {
  if (globalRateLimiter) {
    globalRateLimiter.destroy();
  }
  globalRateLimiter = null;
}
