/**
 * Cache-related constants
 * Centralized configuration for caching strategies and TTL values
 */

/**
 * Cache time-to-live (TTL) values in seconds
 */
export const CACHE_TTL = {
  /** Short cache: 5 minutes */
  SHORT: 300,
  /** Medium cache: 15 minutes */
  MEDIUM: 900,
  /** Long cache: 1 hour */
  LONG: 3600,
  /** Very long cache: 24 hours */
  VERY_LONG: 86400,
} as const;

/**
 * Cache header values for HTTP responses
 */
export const CACHE_HEADERS = {
  /** Short cache: public, 5 minutes */
  SHORT: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
  /** Medium cache: public, 15 minutes */
  MEDIUM: 'public, max-age=900, s-maxage=900, stale-while-revalidate=1800',
  /** Long cache: public, 1 hour */
  LONG: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200',
  /** No cache: no-store, no-cache */
  NO_CACHE: 'no-store, no-cache, must-revalidate',
  /** Immutable: public, max-age=1 year, immutable */
  IMMUTABLE: 'public, max-age=31536000, immutable',
} as const;

/**
 * Cache tags for Next.js revalidation
 */
export const CACHE_TAGS = {
  /** Schedule data tag */
  SCHEDULE: 'schedule',
  /** Locations tag */
  LOCATIONS: 'locations',
  /** Statistics tag */
  STATS: 'stats',
  /** Hadith data tag */
  HADITH: 'hadith',
  /** PDF cache tag */
  PDF: 'pdf',
  /** Cache debug tag */
  CACHE_DEBUG: 'cache-debug',
  /** All data tag (for full invalidation) */
  ALL: 'all',
} as const;

/**
 * Cache key prefixes
 */
export const CACHE_KEY_PREFIXES = {
  /** API cache prefix */
  API: 'api',
  /** Schedule cache prefix */
  SCHEDULE: 'schedule',
  /** Location cache prefix */
  LOCATION: 'location',
  /** External API cache prefix */
  EXTERNAL_API: 'external-api',
} as const;

/**
 * Cache configuration for specific data types
 */
export const CACHE_CONFIG = {
  /** Today's schedule cache */
  todaySchedule: {
    duration: CACHE_TTL.SHORT,
    tags: [CACHE_TAGS.SCHEDULE],
  },
  /** Full schedule cache */
  schedule: {
    duration: CACHE_TTL.MEDIUM,
    tags: [CACHE_TAGS.SCHEDULE],
  },
  /** Locations cache */
  locations: {
    duration: CACHE_TTL.LONG,
    tags: [CACHE_TAGS.LOCATIONS],
  },
  /** Statistics cache */
  stats: {
    duration: CACHE_TTL.MEDIUM,
    tags: [CACHE_TAGS.STATS],
  },
  /** Hadith cache */
  hadith: {
    duration: CACHE_TTL.VERY_LONG,
    tags: ['hadith'],
  },
} as const;

/**
 * In-memory cache configuration
 */
export const IN_MEMORY_CACHE = {
  /** Maximum cache size (number of entries) */
  MAX_SIZE: 1000,
  /** Default TTL for in-memory cache (ms) */
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours
  /** Cleanup interval (ms) */
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
} as const;
