/**
 * Cache Helpers
 * Utility functions for cache operations
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_CONFIG, CACHE_TAGS } from './cache-config';

/**
 * Create a cached version of an async function with tags
 * 
 * @param fn - The async function to cache
 * @param keyParts - Array of strings to build the cache key
 * @param config - Cache configuration with duration and tags
 * @returns Cached version of the function
 * 
 * @example
 * ```ts
 * const cachedFn = createCachedFn(
 *   async () => await prisma.user.findMany(),
 *   ['users'],
 *   CACHE_CONFIG.users
 * );
 * ```
 */
export function createCachedFn<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  config: { duration: number; tags: string[] }
): T {
  return unstable_cache(fn, keyParts, {
    revalidate: config.duration,
    tags: config.tags,
  }) as T;
}

/**
 * Invalidate all schedule-related caches
 * This should be called when schedule data is created, updated, or deleted
 */
export function invalidateScheduleCache(): void {
  revalidateTag(CACHE_TAGS.SCHEDULE, CACHE_TAGS.SCHEDULE);
  revalidateTag(CACHE_TAGS.STATS, CACHE_TAGS.STATS);
  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/admin/dashboard');
}

/**
 * Invalidate location caches
 * This should be called when locations are added or removed
 */
export function invalidateLocationCache(): void {
  revalidateTag(CACHE_TAGS.LOCATIONS, CACHE_TAGS.LOCATIONS);
}

/**
 * Invalidate PDF caches
 * This should be called when schedule data changes that affects PDFs
 */
export function invalidatePdfCache(): void {
  revalidateTag(CACHE_TAGS.PDF, CACHE_TAGS.PDF);
}

/**
 * Invalidate all caches (for emergency use)
 * This should rarely be used, as it clears all cached data
 */
export function invalidateAllCaches(): void {
  Object.values(CACHE_TAGS).forEach(tag => revalidateTag(tag, tag));
  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/admin/dashboard');
}

/**
 * Get cache key with prefix
 * 
 * @param prefix - The prefix for the cache key
 * @param parts - Additional parts to append to the key
 * @returns Formatted cache key
 * 
 * @example
 * ```ts
 * getCacheKey('schedule', 'dhaka', '2024-03-01')
 * // Returns: 'schedule:dhaka:2024-03-01'
 * ```
 */
export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(':');
}

/**
 * Create a cache key for location-based data
 * 
 * @param baseKey - Base key for the data type
 * @param location - Location name (or 'all' for all locations)
 * @returns Formatted cache key
 */
export function getLocationCacheKey(baseKey: string, location?: string | null): string {
  return location ? getCacheKey(baseKey, location) : getCacheKey(baseKey, 'all');
}

/**
 * Create a cache key for date-based data
 * 
 * @param baseKey - Base key for the data type
 * @param date - Date string in YYYY-MM-DD format
 * @param location - Optional location name
 * @returns Formatted cache key
 */
export function getDateCacheKey(baseKey: string, date: string, location?: string | null): string {
  return location 
    ? getCacheKey(baseKey, date, location)
    : getCacheKey(baseKey, date);
}

/**
 * Batch invalidate multiple cache tags
 * 
 * @param tags - Array of cache tags to invalidate
 */
export function invalidateTags(...tags: string[]): void {
  tags.forEach(tag => revalidateTag(tag, tag));
}

/**
 * Batch revalidate multiple paths
 * 
 * @param paths - Array of paths to revalidate
 */
export function revalidatePaths(...paths: string[]): void {
  paths.forEach(path => revalidatePath(path));
}
