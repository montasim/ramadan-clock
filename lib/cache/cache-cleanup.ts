/**
 * Cache Cleanup
 * Utilities for periodic cache cleanup and maintenance
 */

import { logger } from '@/lib/logger';
import { getGlobalApiClient } from '@/lib/api';

/**
 * Cache cleanup utilities
 */
export class CacheCleanup {
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Clean up expired cache entries in external API client
   */
  static async cleanupExternalApiCache(): Promise<void> {
    try {
      const client = getGlobalApiClient();
      client.cleanupCache();
      logger.info('External API cache cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup external API cache', {}, error as Error);
    }
  }

  /**
   * Get cleanup statistics
   * 
   * @returns Statistics about cache cleanup
   */
  static async getCleanupStats(): Promise<{
    externalApiCache: { size: number; keys: string[] };
    lastCleanup: Date | null;
  }> {
    const client = getGlobalApiClient();
    const stats = client.getCacheStats();
    
    return {
      externalApiCache: stats,
      lastCleanup: this.lastCleanupTime,
    };
  }

  private static lastCleanupTime: Date | null = null;

  /**
   * Perform a full cleanup cycle
   * Cleans up all cache layers
   */
  static async performFullCleanup(): Promise<void> {
    logger.info('Starting full cache cleanup cycle');
    
    try {
      // Clean up external API cache
      await this.cleanupExternalApiCache();
      
      // Update last cleanup time
      this.lastCleanupTime = new Date();
      
      logger.info('Full cache cleanup cycle completed', {
        timestamp: this.lastCleanupTime,
      });
    } catch (error) {
      logger.error('Error during full cache cleanup', {}, error as Error);
    }
  }

  /**
   * Schedule periodic cache cleanup
   * 
   * @param intervalMs - Cleanup interval in milliseconds (default: 1 hour)
   * @returns Interval ID that can be used to stop the cleanup
   */
  static schedulePeriodicCleanup(intervalMs: number = 3600000): NodeJS.Timeout {
    // Stop existing cleanup if running
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Schedule new cleanup
    this.cleanupInterval = setInterval(() => {
      this.performFullCleanup();
    }, intervalMs);
    
    logger.info(`Periodic cache cleanup scheduled (interval: ${intervalMs}ms)`);
    
    return this.cleanupInterval;
  }

  /**
   * Stop periodic cache cleanup
   */
  static stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Periodic cache cleanup stopped');
    }
  }

  /**
   * Check if periodic cleanup is running
   * 
   * @returns True if cleanup is scheduled
   */
  static isCleanupRunning(): boolean {
    return this.cleanupInterval !== null;
  }

  /**
   * Manually trigger cleanup (useful for testing or emergency cleanup)
   */
  static async triggerCleanup(): Promise<void> {
    await this.performFullCleanup();
  }

  /**
   * Get cleanup status
   * 
   * @returns Status of the cleanup system
   */
  static getStatus(): {
    isRunning: boolean;
    lastCleanup: Date | null;
    nextCleanup: Date | null;
  } {
    const nextCleanup = this.cleanupInterval 
      ? new Date(Date.now() + 3600000) // Approximate next cleanup
      : null;
    
    return {
      isRunning: this.isCleanupRunning(),
      lastCleanup: this.lastCleanupTime,
      nextCleanup,
    };
  }
}

/**
 * Initialize automatic cache cleanup on server start
 * This function should be called once during application initialization
 */
export function initializeCacheCleanup(): void {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return;
  }
  
  // Schedule periodic cleanup (every hour)
  CacheCleanup.schedulePeriodicCleanup(3600000);
  
  logger.info('Cache cleanup system initialized');
}

/**
 * Shutdown cache cleanup
 * Call this when shutting down the application
 */
export function shutdownCacheCleanup(): void {
  CacheCleanup.stopPeriodicCleanup();
  logger.info('Cache cleanup system shutdown');
}

// Auto-initialize on module import (server-side only)
if (typeof window === 'undefined') {
  initializeCacheCleanup();
}
