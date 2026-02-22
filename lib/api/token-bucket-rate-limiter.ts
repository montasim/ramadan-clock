/**
 * Token Bucket Rate Limiter
 * Implements the token bucket algorithm for rate limiting API requests
 * 
 * The token bucket algorithm allows bursts of requests while maintaining
 * a controlled average rate. Tokens are added to the bucket at a
 * constant rate, and each request consumes one token.
 */

import { logger } from '@/lib/logger';

/**
 * Token bucket configuration
 */
export interface TokenBucketConfig {
  capacity: number;      // Maximum number of tokens in the bucket
  refillRate: number;    // Tokens added per second
  minWaitTime: number;   // Minimum time to wait between requests (ms)
}

/**
 * Token bucket statistics
 */
export interface TokenBucketStats {
  currentTokens: number;
  capacity: number;
  refillRate: number;
  totalRequests: number;
  totalWaitTime: number;
  averageWaitTime: number;
}

/**
 * Token bucket state
 */
interface TokenBucketState {
  tokens: number;
  lastRefillTime: number; // Timestamp in milliseconds
  totalRequests: number;
  totalWaitTime: number;
}

/**
 * Token Bucket Rate Limiter
 * 
 * Usage:
 * ```typescript
 * const limiter = new TokenBucketRateLimiter({
 *   capacity: 5,
 *   refillRate: 0.2,  // 1 token every 5 seconds
 *   minWaitTime: 1000,
 * });
 * 
 * await limiter.acquireToken(); // Waits if no tokens available
 * ```
 */
export class TokenBucketRateLimiter {
  private config: TokenBucketConfig;
  private state: TokenBucketState;

  constructor(config: TokenBucketConfig) {
    this.config = {
      capacity: config.capacity || 5,
      refillRate: config.refillRate || 0.2,
      minWaitTime: config.minWaitTime || 1000,
    };

    this.state = {
      tokens: this.config.capacity,
      lastRefillTime: Date.now(),
      totalRequests: 0,
      totalWaitTime: 0,
    };

    logger.info('TokenBucketRateLimiter initialized', {
      capacity: this.config.capacity,
      refillRate: this.config.refillRate,
      minWaitTime: this.config.minWaitTime,
    });
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsedTime = (now - this.state.lastRefillTime) / 1000; // Convert to seconds

    if (elapsedTime > 0) {
      const tokensToAdd = elapsedTime * this.config.refillRate;
      this.state.tokens = Math.min(
        this.config.capacity,
        this.state.tokens + tokensToAdd
      );
      this.state.lastRefillTime = now;

      logger.debug('Tokens refilled', {
        tokensAdded: tokensToAdd.toFixed(2),
        currentTokens: this.state.tokens.toFixed(2),
        capacity: this.config.capacity,
      });
    }
  }

  /**
   * Acquire a token from the bucket
   * Waits if no tokens are available
   * 
   * @returns Promise that resolves when a token is available
   */
  async acquireToken(): Promise<void> {
    this.refillTokens();

    const startTime = Date.now();

    if (this.state.tokens >= 1) {
      // Token available, consume it immediately
      this.state.tokens -= 1;
      this.state.totalRequests++;

      logger.debug('Token acquired immediately', {
        remainingTokens: this.state.tokens.toFixed(2),
        totalRequests: this.state.totalRequests,
      });

      return;
    }

    // No tokens available, calculate wait time
    const tokensNeeded = 1 - this.state.tokens;
    const waitTime = (tokensNeeded / this.config.refillRate) * 1000; // Convert to milliseconds

    // Ensure minimum wait time
    const actualWaitTime = Math.max(waitTime, this.config.minWaitTime);

    logger.debug('Waiting for token', {
      tokensNeeded: tokensNeeded.toFixed(2),
      waitTime: actualWaitTime.toFixed(0),
      refillRate: this.config.refillRate,
    });

    await this.sleep(actualWaitTime);

    // Refill and consume token after waiting
    this.refillTokens();
    this.state.tokens -= 1;
    this.state.totalRequests++;

    const actualWaitDuration = Date.now() - startTime;
    this.state.totalWaitTime += actualWaitDuration;

    logger.debug('Token acquired after wait', {
      waitDuration: actualWaitDuration,
      remainingTokens: this.state.tokens.toFixed(2),
      totalRequests: this.state.totalRequests,
    });
  }

  /**
   * Acquire multiple tokens at once
   * Useful for batch operations
   * 
   * @param count Number of tokens to acquire
   */
  async acquireTokens(count: number): Promise<void> {
    if (count <= 0) {
      return;
    }

    if (count === 1) {
      return this.acquireToken();
    }

    // For multiple tokens, acquire them sequentially
    for (let i = 0; i < count; i++) {
      await this.acquireToken();
    }
  }

  /**
   * Get current statistics
   */
  getStats(): TokenBucketStats {
    this.refillTokens();

    const averageWaitTime = this.state.totalRequests > 0
      ? this.state.totalWaitTime / this.state.totalRequests
      : 0;

    return {
      currentTokens: this.state.tokens,
      capacity: this.config.capacity,
      refillRate: this.config.refillRate,
      totalRequests: this.state.totalRequests,
      totalWaitTime: this.state.totalWaitTime,
      averageWaitTime,
    };
  }

  /**
   * Get current token count
   */
  getCurrentTokens(): number {
    this.refillTokens();
    return this.state.tokens;
  }

  /**
   * Reset the rate limiter state
   */
  reset(): void {
    this.state = {
      tokens: this.config.capacity,
      lastRefillTime: Date.now(),
      totalRequests: 0,
      totalWaitTime: 0,
    };

    logger.info('TokenBucketRateLimiter reset', {
      capacity: this.config.capacity,
      refillRate: this.config.refillRate,
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TokenBucketConfig>): void {
    const oldConfig = { ...this.config };

    if (config.capacity !== undefined) {
      this.config.capacity = config.capacity;
    }
    if (config.refillRate !== undefined) {
      this.config.refillRate = config.refillRate;
    }
    if (config.minWaitTime !== undefined) {
      this.config.minWaitTime = config.minWaitTime;
    }

    logger.info('TokenBucketRateLimiter config updated', {
      oldConfig,
      newConfig: this.config,
    });
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let globalTokenBucketLimiter: TokenBucketRateLimiter | null = null;

/**
 * Get or create the global token bucket rate limiter instance
 * 
 * @param config Optional configuration (only used on first call)
 */
export function getGlobalTokenBucketLimiter(config?: TokenBucketConfig): TokenBucketRateLimiter {
  if (!globalTokenBucketLimiter) {
    if (!config) {
      throw new Error('TokenBucketRateLimiter config required on first call');
    }
    globalTokenBucketLimiter = new TokenBucketRateLimiter(config);
  }
  return globalTokenBucketLimiter;
}

/**
 * Reset the global token bucket rate limiter
 * Useful for testing or when changing configuration
 */
export function resetGlobalTokenBucketLimiter(): void {
  if (globalTokenBucketLimiter) {
    globalTokenBucketLimiter.reset();
  }
  globalTokenBucketLimiter = null;
}
