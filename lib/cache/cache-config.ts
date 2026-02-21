/**
 * Cache Configuration
 * Centralized cache durations and tags for consistency across the application
 *
 * Note: Core constants are imported from lib/constants/cache.constants.ts
 * This file extends them with application-specific cache configurations
 */

import {
  CACHE_TTL,
  CACHE_TAGS as CORE_CACHE_TAGS,
  CACHE_HEADERS as CORE_CACHE_HEADERS,
} from '@/lib/constants';

/**
 * Re-export core cache constants for backward compatibility
 * @deprecated Use CACHE_TTL from @/lib/constants instead
 */
export const CACHE_DURATIONS = CACHE_TTL;

/**
 * Re-export core cache tags for backward compatibility
 * @deprecated Use CACHE_TAGS from @/lib/constants instead
 */
export const CACHE_TAGS = CORE_CACHE_TAGS;

/**
 * Re-export core cache headers for backward compatibility
 * @deprecated Use CACHE_HEADERS from @/lib/constants instead
 */
export const CACHE_HEADERS = CORE_CACHE_HEADERS;

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  /** Locations list - rarely changes, cache for 1 hour */
  locations: {
    duration: CACHE_TTL.LONG,
    tags: [CORE_CACHE_TAGS.LOCATIONS],
  },
  /** Full schedule - changes on upload, cache for 15 minutes */
  schedule: {
    duration: CACHE_TTL.MEDIUM,
    tags: [CORE_CACHE_TAGS.SCHEDULE],
  },
  /** Today's schedule - changes daily, cache for 5 minutes */
  todaySchedule: {
    duration: CACHE_TTL.SHORT,
    tags: [CORE_CACHE_TAGS.SCHEDULE],
  },
  /** Dashboard stats - changes on upload, cache for 15 minutes */
  stats: {
    duration: CACHE_TTL.MEDIUM,
    tags: [CORE_CACHE_TAGS.STATS],
  },
  /** Hadith from external API - static, cache for 24 hours */
  hadith: {
    duration: CACHE_TTL.VERY_LONG,
    tags: ['hadith'],
  },
  /** Generated PDF - changes on schedule update, cache for 10 minutes */
  pdf: {
    duration: 600,
    tags: [CORE_CACHE_TAGS.PDF],
  },
} as const;

/**
 * Type for cache configuration
 */
export type CacheConfig = typeof CACHE_CONFIG[keyof typeof CACHE_CONFIG];
