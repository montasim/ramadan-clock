/**
 * Cache Configuration
 * Centralized cache durations and tags for consistency across the application
 */

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  /** 1 minute - frequently changing data */
  SHORT: 60,
  /** 5 minutes - moderately changing data */
  MEDIUM: 300,
  /** 15 minutes - rarely changing data */
  LONG: 900,
  /** 30 minutes - very rarely changing data */
  VERY_LONG: 1800,
  /** 1 hour - static data */
  HOUR: 3600,
} as const;

/**
 * Cache tags for selective invalidation
 * Tags allow invalidating specific groups of cached data
 */
export const CACHE_TAGS = {
  /** Schedule entries (today, tomorrow, full) */
  SCHEDULE: 'schedule',
  /** List of available locations */
  LOCATIONS: 'locations',
  /** Dashboard statistics */
  STATS: 'stats',
  /** Hadith data from external API */
  HADITH: 'hadith',
  /** Generated PDF files */
  PDF: 'pdf',
} as const;

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  /** Locations list - rarely changes, cache for 1 hour */
  locations: {
    duration: CACHE_DURATIONS.HOUR,
    tags: [CACHE_TAGS.LOCATIONS],
  },
  /** Full schedule - changes on upload, cache for 5 minutes */
  schedule: {
    duration: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.SCHEDULE],
  },
  /** Today's schedule - changes daily, cache for 1 minute */
  todaySchedule: {
    duration: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.SCHEDULE],
  },
  /** Dashboard stats - changes on upload, cache for 1 minute */
  stats: {
    duration: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.STATS],
  },
  /** Hadith from external API - static, cache for 1 hour */
  hadith: {
    duration: CACHE_DURATIONS.HOUR,
    tags: [CACHE_TAGS.HADITH],
  },
  /** Generated PDF - changes on schedule update, cache for 10 minutes */
  pdf: {
    duration: 600,
    tags: [CACHE_TAGS.PDF],
  },
} as const;

/**
 * Cache-Control header values for different scenarios
 */
export const CACHE_HEADERS = {
  /** No caching - for dynamic/admin content */
  NO_CACHE: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  /** Short cache - for frequently changing data */
  SHORT: 'public, s-maxage=60, stale-while-revalidate=300',
  /** Medium cache - for moderately changing data */
  MEDIUM: 'public, s-maxage=300, stale-while-revalidate=900',
  /** Long cache - for rarely changing data */
  LONG: 'public, s-maxage=900, stale-while-revalidate=1800',
  /** Static assets - immutable */
  IMMUTABLE: 'public, max-age=31536000, immutable',
} as const;

/**
 * Type for cache configuration
 */
export type CacheConfig = typeof CACHE_CONFIG[keyof typeof CACHE_CONFIG];
