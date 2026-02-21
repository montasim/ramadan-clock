/**
 * Error Handling Decorator
 * Provides consistent error handling across the application
 */

import { logger } from '@/lib/logger';
import { toAppError, type AppError } from '@/lib/errors';

/**
 * Error handler result
 */
export type ErrorHandlerResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  appError?: AppError;
};

/**
 * Decorator function to wrap async functions with error handling
 * @param fn - Async function to wrap
 * @param context - Context information for logging
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logger.error(`Error in ${context}`, { args }, error as Error);
      throw toAppError(error);
    }
  }) as T;
}

/**
 * Decorator function to wrap async functions with error handling and result object
 * @param fn - Async function to wrap
 * @param context - Context information for logging
 * @returns Wrapped function that returns ErrorHandlerResult
 */
export function withSafeErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in ${context}`, { args }, appError);
      return {
        success: false,
        error: appError.message,
        appError,
      };
    }
  }) as T;
}

/**
 * Decorator function for database operations with error handling
 * @param fn - Async database function to wrap
 * @param operation - Operation name for logging
 * @returns Wrapped function with database error handling
 */
export function withDatabaseErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operation: string
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Database operation failed: ${operation}`, { args }, appError);
      throw appError;
    }
  }) as T;
}

/**
 * Decorator function for API operations with error handling
 * @param fn - Async API function to wrap
 * @param endpoint - Endpoint name for logging
 * @returns Wrapped function with API error handling
 */
export function withApiErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`API call failed: ${endpoint}`, { args }, appError);
      throw appError;
    }
  }) as T;
}

/**
 * Create a safe version of a function that never throws
 * @param fn - Function to make safe
 * @param defaultValue - Default value to return on error
 * @returns Safe function
 */
export function makeSafe<T extends (...args: any[]) => any, R>(
  fn: T,
  defaultValue: R
): (...args: Parameters<T>) => R {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      logger.error('Error in safe function', { args }, error as Error);
      return defaultValue;
    }
  };
}

/**
 * Create a safe async version of a function that never throws
 * @param fn - Async function to make safe
 * @param defaultValue - Default value to return on error
 * @returns Safe async function
 */
export function makeSafeAsync<T extends (...args: any[]) => Promise<any>, R>(
  fn: T,
  defaultValue: R
): (...args: Parameters<T>) => Promise<R> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error('Error in safe async function', { args }, error as Error);
      return defaultValue;
    }
  };
}

/**
 * Retry decorator for async functions
 * @param fn - Async function to wrap
 * @param maxRetries - Maximum number of retries
 * @param delay - Delay between retries in milliseconds
 * @returns Wrapped function with retry logic
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 1000
): T {
  return (async (...args: any[]) => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, { args });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }) as T;
}

/**
 * Timeout decorator for async functions
 * @param fn - Async function to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Wrapped function with timeout logic
 */
export function withTimeout<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  timeoutMs: number
): T {
  return (async (...args: any[]) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
      return await Promise.race([fn(...args), timeoutPromise]);
    } catch (error) {
      if ((error as Error).message.includes('timed out')) {
        throw error;
      }
      throw error;
    }
  }) as T;
}

/**
 * Cache decorator for async functions
 * @param fn - Async function to wrap
 * @param cacheKey - Function to generate cache key from arguments
 * @param cacheTtl - Cache time-to-live in milliseconds
 * @returns Wrapped function with caching
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: (...args: Parameters<T>) => string,
  cacheTtl: number = 60000 // 1 minute default
): T {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return (async (...args: Parameters<T>) => {
    const key = cacheKey(...args);
    const cached = cache.get(key);

    // Check cache
    if (cached && Date.now() - cached.timestamp < cacheTtl) {
      logger.debug('Cache hit', { key });
      return cached.data;
    }

    // Execute function
    const result = await fn(...args);

    // Update cache
    cache.set(key, {
      data: result,
      timestamp: Date.now(),
    });

    logger.debug('Cache miss', { key });
    return result;
  }) as T;
}
