/**
 * Cache Monitoring
 * Utilities for tracking cache performance metrics
 */

import { logger } from '@/lib/logger';

/**
 * Cache metrics for a specific key
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  lastReset: Date;
}

/**
 * Cache statistics with calculated hit rate
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
  total: number;
}

/**
 * Cache monitoring utilities
 */
export class CacheMonitor {
  private static metrics: Map<string, CacheMetrics> = new Map();

  /**
   * Record a cache hit
   * 
   * @param key - The cache key that was hit
   */
  static recordHit(key: string): void {
    const metric = this.metrics.get(key) || { hits: 0, misses: 0, lastReset: new Date() };
    metric.hits++;
    this.metrics.set(key, metric);
  }

  /**
   * Record a cache miss
   * 
   * @param key - The cache key that was missed
   */
  static recordMiss(key: string): void {
    const metric = this.metrics.get(key) || { hits: 0, misses: 0, lastReset: new Date() };
    metric.misses++;
    this.metrics.set(key, metric);
  }

  /**
   * Get cache statistics for all keys
   * 
   * @returns Object with stats for each cache key
   */
  static getStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    
    for (const [key, metric] of this.metrics.entries()) {
      const total = metric.hits + metric.misses;
      const hitRate = total > 0 ? (metric.hits / total) * 100 : 0;
      
      stats[key] = {
        hits: metric.hits,
        misses: metric.misses,
        hitRate: hitRate.toFixed(2) + '%',
        total,
      };
    }
    
    return stats;
  }

  /**
   * Get overall cache statistics
   * 
   * @returns Aggregated statistics across all cache keys
   */
  static getOverallStats(): CacheStats {
    let totalHits = 0;
    let totalMisses = 0;
    
    for (const metric of this.metrics.values()) {
      totalHits += metric.hits;
      totalMisses += metric.misses;
    }
    
    const total = totalHits + totalMisses;
    const hitRate = total > 0 ? (totalHits / total) * 100 : 0;
    
    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: hitRate.toFixed(2) + '%',
      total,
    };
  }

  /**
   * Log cache statistics
   * 
   * @param detailed - Whether to log detailed per-key stats
   */
  static logStats(detailed: boolean = false): void {
    const overall = this.getOverallStats();
    
    logger.info('Cache statistics', {
      overall,
      detailed: detailed ? this.getStats() : undefined,
    });
  }

  /**
   * Reset metrics for a specific key
   * 
   * @param key - The cache key to reset
   */
  static resetKey(key: string): void {
    this.metrics.delete(key);
    logger.debug(`Cache metrics reset for key: ${key}`);
  }

  /**
   * Reset all metrics
   */
  static resetMetrics(): void {
    this.metrics.clear();
    logger.info('All cache metrics reset');
  }

  /**
   * Get metrics for a specific key
   * 
   * @param key - The cache key to get stats for
   * @returns Cache stats or null if key not found
   */
  static getKeyStats(key: string): CacheStats | null {
    const metric = this.metrics.get(key);
    if (!metric) return null;

    const total = metric.hits + metric.misses;
    const hitRate = total > 0 ? (metric.hits / total) * 100 : 0;

    return {
      hits: metric.hits,
      misses: metric.misses,
      hitRate: hitRate.toFixed(2) + '%',
      total,
    };
  }

  /**
   * Get the number of tracked cache keys
   * 
   * @returns Number of tracked keys
   */
  static getTrackedKeysCount(): number {
    return this.metrics.size;
  }

  /**
   * Get all tracked cache keys
   * 
   * @returns Array of tracked keys
   */
  static getTrackedKeys(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Export metrics as JSON
   * 
   * @returns JSON string of metrics
   */
  static exportMetrics(): string {
    return JSON.stringify(this.getStats(), null, 2);
  }
}

/**
 * Wrap a function with cache monitoring
 * Automatically records hits/misses based on function execution
 * 
 * @param fn - The function to wrap
 * @param cacheKey - The cache key to track
 * @returns Wrapped function with monitoring
 * 
 * @example
 * ```ts
 * const monitoredFn = withCacheMonitoring(
 *   async () => await fetchData(),
 *   'data-fetch'
 * );
 * ```
 */
export function withCacheMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: string
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      CacheMonitor.recordHit(cacheKey);
      return result;
    } catch (error) {
      CacheMonitor.recordMiss(cacheKey);
      throw error;
    }
  }) as T;
}

/**
 * Decorator for class methods to add cache monitoring
 * 
 * @param cacheKey - The cache key to track
 * @returns Method decorator
 * 
 * @example
 * ```ts
 * class DataService {
 *   @withCacheMonitor('get-users')
 *   async getUsers() {
 *     return await prisma.user.findMany();
 *   }
 * }
 * ```
 */
export function withCacheMonitor(cacheKey: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        CacheMonitor.recordHit(cacheKey);
        return result;
      } catch (error) {
        CacheMonitor.recordMiss(cacheKey);
        throw error;
      }
    };
    
    return descriptor;
  };
}
