/**
 * External API Client
 * Robust client for making external API calls with retry logic, timeout, and caching
 */

import { logger } from '@/lib/logger';

/**
 * Request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
}

/**
 * Retry options
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
}

/**
 * Cache entry
 */
interface CacheEntry {
  data: any;
  expiresAt: Date;
}

/**
 * External API client with retry, timeout, and caching
 */
export class ExternalApiClient {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTimeout: number = 10000; // 10 seconds
  private defaultRetryOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  };

  /**
   * Make an HTTP request with timeout
   */
  async fetch(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Make an HTTP request with retry logic
   */
  async fetchWithRetry(
    url: string,
    options: RequestOptions = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> {
    const mergedRetryOptions: Required<RetryOptions> = {
      maxRetries: retryOptions.maxRetries ?? this.defaultRetryOptions.maxRetries,
      initialDelay: retryOptions.initialDelay ?? this.defaultRetryOptions.initialDelay,
      maxDelay: retryOptions.maxDelay ?? this.defaultRetryOptions.maxDelay,
      backoffMultiplier: retryOptions.backoffMultiplier ?? this.defaultRetryOptions.backoffMultiplier,
      retryableStatuses: retryOptions.retryableStatuses ?? this.defaultRetryOptions.retryableStatuses,
    };

    let lastError: Error | null = null;
    let delay = mergedRetryOptions.initialDelay;

    for (let attempt = 0; attempt <= mergedRetryOptions.maxRetries; attempt++) {
      try {
        const response = await this.fetch(url, options);

        // Check if response status is retryable
        if (
          attempt < mergedRetryOptions.maxRetries &&
          mergedRetryOptions.retryableStatuses.includes(response.status)
        ) {
          // Special handling for 429 (Rate Limit) errors
          if (response.status === 429) {
            const retryAfter = this.parseRetryAfter(response);
            const rateLimitDelay = Math.max(retryAfter, delay);
            
            // Use longer backoff for rate limit errors
            delay = Math.min(
              rateLimitDelay * 3, // 3x multiplier for 429 errors
              30000 // Max 30 seconds for rate limit errors
            );

            logger.warn(
              `External API request rate limited (429), retrying...`,
              { url, attempt, retryAfter, delay, status: response.status }
            );
          } else {
            logger.warn(
              `External API request failed with status ${response.status}, retrying...`,
              { url, attempt, status: response.status }
            );

            // Wait before retrying with exponential backoff
            delay = Math.min(
              delay * mergedRetryOptions.backoffMultiplier,
              mergedRetryOptions.maxDelay
            );
          }

          // Add jitter to prevent thundering herd
          const jitter = Math.random() * 0.2 * delay; // 20% jitter
          await this.sleep(delay + jitter);

          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt < mergedRetryOptions.maxRetries) {
          logger.warn(
            `External API request failed, retrying...`,
            { url, attempt, error: lastError.message }
          );

          // Wait before retrying with exponential backoff
          await this.sleep(delay);
          delay = Math.min(
            delay * mergedRetryOptions.backoffMultiplier,
            mergedRetryOptions.maxDelay
          );
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Parse Retry-After header from response
   * Returns delay in milliseconds
   */
  private parseRetryAfter(response: Response): number {
    const retryAfterHeader = response.headers.get('Retry-After');
    
    if (!retryAfterHeader) {
      return 5000; // Default 5 seconds if no header
    }

    // Try parsing as number (seconds)
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // Try parsing as HTTP date
    const date = new Date(retryAfterHeader);
    if (!isNaN(date.getTime())) {
      const delay = date.getTime() - Date.now();
      return Math.max(delay, 1000); // Minimum 1 second
    }

    return 5000; // Default 5 seconds if parsing fails
  }

  /**
   * Make an HTTP request with caching
   */
  async fetchWithCache(
    url: string,
    options: RequestOptions = {},
    cacheOptions: CacheOptions = {}
  ): Promise<any> {
    const ttl = cacheOptions.ttl || 3600000; // 1 hour default
    const keyPrefix = cacheOptions.keyPrefix || 'api';
    const cacheKey = `${keyPrefix}:${Buffer.from(url).toString('base64')}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && new Date() < cached.expiresAt) {
      logger.debug('Cache hit', { url, cacheKey });
      return cached.data;
    }

    // Fetch fresh data
    const response = await this.fetchWithRetry(url, options);
    const data = await response.json();

    // Cache the response
    this.cache.set(cacheKey, {
      data,
      expiresAt: new Date(Date.now() + ttl),
    });

    logger.debug('Cache miss - data cached', { url, cacheKey, ttl });

    return data;
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      logger.info('Cache cleared');
      return;
    }

    const regex = new RegExp(pattern);
    let cleared = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }

    logger.info(`Cache cleared: ${cleared} entries matching pattern "${pattern}"`);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let globalApiClient: ExternalApiClient | null = null;

/**
 * Get or create the global API client instance
 */
export function getGlobalApiClient(): ExternalApiClient {
  if (!globalApiClient) {
    globalApiClient = new ExternalApiClient();
  }
  return globalApiClient;
}

/**
 * Reset the global API client (useful for testing)
 */
export function resetGlobalApiClient(): void {
  globalApiClient = null;
}

/**
 * Helper function to fetch JSON from an external API
 */
export async function fetchExternalJson<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const client = getGlobalApiClient();
  const response = await client.fetchWithRetry(url, options);

  if (!response.ok) {
    throw new Error(
      `External API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Helper function to fetch JSON from an external API with caching
 */
export async function fetchExternalJsonCached<T = any>(
  url: string,
  options: RequestOptions = {},
  cacheTtl: number = 3600000
): Promise<T> {
  const client = getGlobalApiClient();
  return client.fetchWithCache(url, options, { ttl: cacheTtl });
}
