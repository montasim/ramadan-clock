/**
 * Prayer Time Error Handler
 * Handles errors related to prayer time API operations
 */

import { prisma } from '@/lib/db';

/**
 * Error types for prayer time operations
 */
export enum PrayerTimeErrorType {
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Prayer time error details
 */
export interface PrayerTimeErrorDetails {
  type: PrayerTimeErrorType;
  message: string;
  location?: string;
  date?: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  id: string;
  errorType: PrayerTimeErrorType;
  message: string;
  location?: string;
  date?: string;
  stackTrace?: string;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

/**
 * Prayer Time Error Handler
 */
export class PrayerTimeErrorHandler {
  /**
   * Categorize an error based on its properties
   */
  categorizeError(error: unknown): PrayerTimeErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Network errors
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return PrayerTimeErrorType.NETWORK_ERROR;
      }

      // Timeout errors
      if (message.includes('timeout') || message.includes('timed out')) {
        return PrayerTimeErrorType.TIMEOUT_ERROR;
      }

      // Rate limit errors
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return PrayerTimeErrorType.RATE_LIMIT_ERROR;
      }

      // API errors
      if (message.includes('api') || message.includes('http')) {
        return PrayerTimeErrorType.API_ERROR;
      }

      // Validation errors
      if (message.includes('validation') || message.includes('invalid')) {
        return PrayerTimeErrorType.VALIDATION_ERROR;
      }

      // Database errors
      if (message.includes('database') || message.includes('prisma')) {
        return PrayerTimeErrorType.DATABASE_ERROR;
      }
    }

    return PrayerTimeErrorType.UNKNOWN_ERROR;
  }

  /**
   * Check if an error is retryable
   */
  isRetryable(errorType: PrayerTimeErrorType): boolean {
    const retryableErrors = [
      PrayerTimeErrorType.NETWORK_ERROR,
      PrayerTimeErrorType.TIMEOUT_ERROR,
      PrayerTimeErrorType.API_ERROR,
      PrayerTimeErrorType.RATE_LIMIT_ERROR,
    ];

    return retryableErrors.includes(errorType);
  }

  /**
   * Get recommended retry delay in milliseconds
   */
  getRetryDelay(errorType: PrayerTimeErrorType, attempt: number): number {
    const baseDelays: Record<PrayerTimeErrorType, number> = {
      [PrayerTimeErrorType.NETWORK_ERROR]: 1000,
      [PrayerTimeErrorType.TIMEOUT_ERROR]: 2000,
      [PrayerTimeErrorType.API_ERROR]: 1000,
      [PrayerTimeErrorType.RATE_LIMIT_ERROR]: 5000,
      [PrayerTimeErrorType.VALIDATION_ERROR]: 0,
      [PrayerTimeErrorType.DATABASE_ERROR]: 2000,
      [PrayerTimeErrorType.UNKNOWN_ERROR]: 1000,
    };

    const baseDelay = baseDelays[errorType] || 1000;
    // Exponential backoff: base * 2^attempt
    return baseDelay * Math.pow(2, attempt);
  }

  /**
   * Log an error to the database
   */
  async logError(
    error: unknown,
    context?: {
      location?: string;
      date?: string;
      operation?: string;
    }
  ): Promise<void> {
    try {
      const errorType = this.categorizeError(error);
      const message = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;

      // Note: You may want to add an ErrorLog model to your Prisma schema
      // For now, we'll just log to console
      console.error('[PrayerTimeErrorHandler]', {
        type: errorType,
        message,
        context,
        stackTrace,
        timestamp: new Date().toISOString(),
      });

      // If you have an ErrorLog model, uncomment this:
      /*
      await prisma.errorLog.create({
        data: {
          errorType,
          message,
          location: context?.location,
          date: context?.date,
          stackTrace,
          resolved: false,
        },
      });
      */
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(days: number = 7): Promise<{
    total: number;
    byType: Record<PrayerTimeErrorType, number>;
    byLocation: Record<string, number>;
    unresolved: number;
  }> {
    try {
      // Note: This requires an ErrorLog model in your schema
      // For now, return empty stats
      return {
        total: 0,
        byType: Object.values(PrayerTimeErrorType).reduce((acc, type) => {
          acc[type] = 0;
          return acc;
        }, {} as Record<PrayerTimeErrorType, number>),
        byLocation: {},
        unresolved: 0,
      };

      /*
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const errors = await prisma.errorLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      const byType = errors.reduce((acc, error) => {
        acc[error.errorType] = (acc[error.errorType] || 0) + 1;
        return acc;
      }, {} as Record<PrayerTimeErrorType, number>);

      const byLocation = errors.reduce((acc, error) => {
        if (error.location) {
          acc[error.location] = (acc[error.location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const unresolved = errors.filter((e) => !e.resolved).length;

      return {
        total: errors.length,
        byType,
        byLocation,
        unresolved,
      };
      */
    } catch (error) {
      console.error('Error fetching error stats:', error);
      return {
        total: 0,
        byType: Object.values(PrayerTimeErrorType).reduce((acc, type) => {
          acc[type] = 0;
          return acc;
        }, {} as Record<PrayerTimeErrorType, number>),
        byLocation: {},
        unresolved: 0,
      };
    }
  }

  /**
   * Create a user-friendly error message
   */
  getUserFriendlyMessage(errorType: PrayerTimeErrorType): string {
    const messages: Record<PrayerTimeErrorType, string> = {
      [PrayerTimeErrorType.API_ERROR]: 'Unable to fetch prayer times from the API. Please try again later.',
      [PrayerTimeErrorType.VALIDATION_ERROR]: 'Invalid prayer time data. Please check the input format.',
      [PrayerTimeErrorType.DATABASE_ERROR]: 'Database error occurred. Please try again.',
      [PrayerTimeErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
      [PrayerTimeErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [PrayerTimeErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
      [PrayerTimeErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    };

    return messages[errorType] || messages[PrayerTimeErrorType.UNKNOWN_ERROR];
  }

  /**
   * Handle an error with appropriate actions
   */
  async handleError(
    error: unknown,
    context?: {
      location?: string;
      date?: string;
      operation?: string;
    }
  ): Promise<PrayerTimeErrorDetails> {
    const errorType = this.categorizeError(error);
    const message = error instanceof Error ? error.message : String(error);

    // Log the error
    await this.logError(error, context);

    return {
      type: errorType,
      message,
      location: context?.location,
      date: context?.date,
      retryable: this.isRetryable(errorType),
      timestamp: new Date(),
    };
  }
}

/**
 * Singleton instance of the error handler
 */
let errorHandlerInstance: PrayerTimeErrorHandler | null = null;

export function getPrayerTimeErrorHandler(): PrayerTimeErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new PrayerTimeErrorHandler();
  }
  return errorHandlerInstance;
}
