/**
 * Client-Safe Application Configuration
 * This file contains configuration values that are safe to use in client-side code
 * and do not trigger environment variable validation
 */

export const APP_CONFIG = {
  name: 'Ramadan Clock',
  version: '0.1.0'
} as const;

export const UPLOAD_CONFIG = {
  maxFileSize: 1024 * 1024, // 1MB in bytes
  maxRows: 5000,
  allowedFileTypes: ['application/json', 'text/csv'] as const,
  allowedExtensions: ['.json', '.csv'] as const,
} as const;

export const TIME_CONFIG = {
  countdownThresholdMinutes: 60,
  defaultSehriTime: '04:30',
  defaultIftarTime: '18:00',
} as const;

export const PDF_CONFIG = {
  title: '🌙 Ramadan Clock',
  subtitle: 'Sehri & Iftar Schedule',
  font: 'helvetica',
  headerColor: [59, 130, 246] as [number, number, number],
  alternateRowColor: [245, 245, 245] as [number, number, number],
} as const;

export const UI_CONFIG = {
  maxPreviewRows: 10,
  maxRecentUploads: 5,
  maxErrorDisplay: 5,
} as const;

/**
 * Aladhan API Configuration
 * Configure Aladhan API integration for fetching prayer times
 */
export const ALADHAN_CONFIG = {
  baseUrl: 'https://api.aladhan.com/v1',
  method: 2, // ISNA method (Islamic Society of North America)
  country: 'Bangladesh',
  timezone: 'Asia/Dhaka',
  maxRetries: 5, // Increased from 3 for better error recovery
  retryDelay: 2000, // Increased from 1000ms for rate limit errors
  batchSize: 5, // Increased for better throughput
  requestDelay: 3000, // Increased from 100ms - delay between batches
  interRequestDelay: 100, // Reduced delay between sequential requests (0.1s)
  interDistrictDelay: 200, // Reduced delay between districts (0.2s)
  cacheTtl: 3600000, // Cache TTL in ms (1 hour)
  maxPreviewRows: 500, // Maximum rows per preview page
  
  // Endpoint configurations
  timingsEndpoint: '/timingsByCity',
  calendarEndpoint: '/calendarByCity',
  hijriCalendarEndpoint: '/hijriCalendarByCity',
  
  // Token bucket rate limiting configuration
  tokenBucket: {
    capacity: 50, // Maximum burst capacity (increased from 5)
    refillRate: 5, // Tokens per second (5 req/s = 300 req/min, increased from 0.2)
    minWaitTime: 0, // No minimum wait, rely on token bucket (changed from 1000)
  } as const,
} as const;

/**
 * Rate Limit Presets
 * Pre-configured rate limiting settings for different use cases
 */
export const RATE_LIMIT_PRESETS = {
  conservative: {
    batchSize: 1,
    interRequestDelay: 2000, // 2s between requests
    interDistrictDelay: 5000, // 5s between districts
    maxConcurrentDistricts: 1, // Process districts sequentially
    tokenBucket: {
      capacity: 3,
      refillRate: 0.1, // 6 req/min
      minWaitTime: 2000,
    },
  },
  balanced: {
    batchSize: 1,
    interRequestDelay: 1000, // 1s between requests
    interDistrictDelay: 2000, // 2s between districts
    maxConcurrentDistricts: 2, // Process 2 districts in parallel
    tokenBucket: {
      capacity: 5,
      refillRate: 0.2, // 12 req/min
      minWaitTime: 1000,
    },
  },
  aggressive: {
    batchSize: 3,
    interRequestDelay: 500, // 0.5s between requests
    interDistrictDelay: 1000, // 1s between districts
    maxConcurrentDistricts: 3, // Process 3 districts in parallel
    tokenBucket: {
      capacity: 8,
      refillRate: 0.33, // 20 req/min
      minWaitTime: 500,
    },
  },
  fast: {
    batchSize: 5,
    interRequestDelay: 100, // 0.1s between requests
    interDistrictDelay: 200, // 0.2s between districts
    maxConcurrentDistricts: 5, // Process 5 districts in parallel
    tokenBucket: {
      capacity: 50,
      refillRate: 5, // 300 req/min (5 req/s)
      minWaitTime: 0, // No minimum wait, rely on token bucket
    },
  },
  turbo: {
    batchSize: 10,
    interRequestDelay: 50, // 0.05s between requests
    interDistrictDelay: 100, // 0.1s between districts
    maxConcurrentDistricts: 10, // Process 10 districts in parallel
    tokenBucket: {
      capacity: 100,
      refillRate: 10, // 600 req/min (10 req/s)
      minWaitTime: 0, // No minimum wait, rely on token bucket
    },
  },
} as const;

/**
 * Ramadan Configuration
 * Configure Ramadan start and end dates for filtering prayer times
 * Format: YYYY-MM-DD
 */
export const RAMADAN_CONFIG = {
  /**
   * Ramadan start date (1st of Ramadan)
   * Set this to the first day of Ramadan
   * Example: "2025-03-01" for March 1, 2025
   */
  startDate: process.env.RAMADAN_START_DATE,

  /**
   * Ramadan end date (last day of Ramadan)
   * Set this to the last day of Ramadan
   * Example: "2025-03-30" for March 30, 2025
   */
  endDate: process.env.RAMADAN_END_DATE,
} as const;
