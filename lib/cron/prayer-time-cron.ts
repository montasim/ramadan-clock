/**
 * Prayer Time Cron Job Handler
 * Handles scheduled execution of prayer time updates
 */

import { getPrayerTimeAPIService } from '@/lib/api/prayer-time-api';
import { getPrayerTimeProcessor } from '@/lib/services/prayer-time-processor.service';
import { uploadSchedule } from '@/actions/upload.actions.new';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { CACHE_TAGS } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * Cron execution result
 */
export interface CronExecutionResult {
  success: boolean;
  message: string;
  timestamp: string;
  duration: number;
  locationsProcessed: number;
  entriesProcessed: number;
  entriesCreated: number;
  entriesUpdated: number;
  entriesFailed: number;
  errors: string[];
  retriedLocations?: string[];
  fallbackUsed?: boolean;
}

/**
 * Notification configuration
 */
interface NotificationConfig {
  enabled: boolean;
  webhookUrl?: string;
  emailRecipients?: string[];
}

/**
 * Cron configuration
 */
interface CronConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackToCache: boolean;
  notification: NotificationConfig;
}

/**
 * Default configuration
 */
const DEFAULT_CRON_CONFIG: CronConfig = {
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  fallbackToCache: true,
  notification: {
    enabled: process.env.CRON_NOTIFICATIONS_ENABLED === 'true',
    webhookUrl: process.env.CRON_WEBHOOK_URL,
    emailRecipients: process.env.CRON_EMAIL_RECIPIENTS?.split(','),
  },
};

/**
 * Cron execution log entry
 */
export interface CronExecutionLog {
  id: string;
  executedAt: Date;
  success: boolean;
  duration: number;
  locationsProcessed: number;
  entriesProcessed: number;
  entriesCreated: number;
  entriesUpdated: number;
  entriesFailed: number;
  errors: string | null;
}

/**
 * Prayer Time Cron Handler
 */
export class PrayerTimeCron {
  private apiService = getPrayerTimeAPIService();
  private processor = getPrayerTimeProcessor();
  private config: CronConfig;

  constructor(config: Partial<CronConfig> = {}) {
    this.config = { ...DEFAULT_CRON_CONFIG, ...config };
  }

  /**
   * Send notification on cron failure
   */
  private async sendNotification(
    result: CronExecutionResult,
    isFailure: boolean
  ): Promise<void> {
    if (!this.config.notification.enabled) {
      return;
    }

    const message = isFailure
      ? `❌ Prayer Time Cron Failed\n\n${result.message}\n\nErrors: ${result.errors.join(', ')}`
      : `✅ Prayer Time Cron Succeeded\n\n${result.message}`;

    // Send webhook notification if configured
    if (this.config.notification.webhookUrl) {
      try {
        await fetch(this.config.notification.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: message,
            result,
            timestamp: result.timestamp,
          }),
        });
      } catch (error) {
        logger.error('Failed to send webhook notification', { error });
      }
    }

    // Log notification for email (would require email service integration)
    if (this.config.notification.emailRecipients) {
      logger.info('Email notification would be sent to:', {
        recipients: this.config.notification.emailRecipients,
        message,
      });
    }
  }

  /**
   * Fetch locations with retry logic
   */
  private async fetchLocationsWithRetry(
    month: number,
    year: number,
    attempt: number = 1
  ): Promise<Map<string, any[]>> {
    try {
      return await this.apiService.fetchAllLocations(month, year);
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        logger.warn(
          `Fetch attempt ${attempt} failed, retrying in ${this.config.retryDelay}ms...`,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.fetchLocationsWithRetry(month, year, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Get cached data as fallback
   */
  private async getFallbackData(month: number, year: number): Promise<Map<string, any[]>> {
    logger.info('Attempting to use cached data as fallback...');

    try {
      // Get the most recent successful upload
      const recentUpload = await prisma.uploadLog.findFirst({
        where: {
          status: 'success',
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      if (!recentUpload) {
        throw new Error('No cached data available');
      }

      // Get entries for the requested month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      const entries = await prisma.timeEntry.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (entries.length === 0) {
        throw new Error('No cached entries found for the requested month');
      }

      // Group entries by location
      const resultMap = new Map<string, any[]>();
      for (const entry of entries) {
        const location = entry.location || 'default';
        if (!resultMap.has(location)) {
          resultMap.set(location, []);
        }
        resultMap.get(location)!.push({
          date: entry.date,
          sehri: entry.sehri,
          iftar: entry.iftar,
          location: entry.location,
        });
      }

      logger.info(`Successfully retrieved ${entries.length} cached entries from ${resultMap.size} locations`);
      return resultMap;
    } catch (error) {
      logger.error('Failed to retrieve fallback data', { error });
      throw error;
    }
  }

  /**
   * Execute monthly update for the current month
   */
  async executeMonthlyUpdate(): Promise<CronExecutionResult> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    return this.executeForSpecificMonth(year, month);
  }

  /**
   * Execute update for a specific month with retry logic and fallback strategy
   */
  async executeForSpecificMonth(
    year: number,
    month: number
  ): Promise<CronExecutionResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const errors: string[] = [];
    const retriedLocations: string[] = [];
    let fallbackUsed = false;

    logger.info(`[Cron] Starting prayer time update for ${year}-${month}`);

    try {
      // Step 1: Fetch prayer times from API for all locations with retry logic
      logger.info('[Cron] Fetching prayer times from API...');
      let apiDataMap: Map<string, any[]>;

      try {
        apiDataMap = await this.fetchLocationsWithRetry(month, year);
        const locationsProcessed = apiDataMap.size;

        if (locationsProcessed === 0) {
          throw new Error('No locations were processed from the API');
        }

        logger.info(`[Cron] Fetched data for ${locationsProcessed} locations`);
      } catch (apiError) {
        logger.error('[Cron] API fetch failed after retries', { error: apiError });

        // Try fallback strategy if enabled
        if (this.config.fallbackToCache) {
          logger.info('[Cron] Attempting fallback to cached data...');
          try {
            apiDataMap = await this.getFallbackData(month, year);
            fallbackUsed = true;
            errors.push('API fetch failed, used cached data as fallback');
          } catch (fallbackError) {
            throw new Error(
              `API fetch failed and fallback unavailable: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
            );
          }
        } else {
          throw apiError;
        }
      }

      // Step 2: Process and validate the data
      logger.info('[Cron] Processing and validating data...');
      const processingResult = this.processor.batchProcess(apiDataMap);

      if (processingResult.invalid > 0) {
        logger.warn(
          `[Cron] Found ${processingResult.invalid} invalid entries out of ${processingResult.total}`
        );
        errors.push(
          `${processingResult.invalid} invalid entries found. See logs for details.`
        );
      }

      if (processingResult.valid === 0) {
        throw new Error('No valid entries to process');
      }

      logger.info(`[Cron] Processed ${processingResult.valid} valid entries`);

      // Step 3: Upload to database using existing uploadSchedule action
      logger.info('[Cron] Uploading entries via uploadSchedule...');
      const uploadEntries = processingResult.entries.map(entry => ({
        date: entry.date,
        sehri: entry.sehri,
        iftar: entry.iftar,
        location: entry.location,
      }));

      const uploadResult = await uploadSchedule(
        uploadEntries,
        `cron-${year}-${month}.json`
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }

      // Track retried entries
      if (uploadResult.data?.retried) {
        retriedLocations.push(`${uploadResult.data.retried} entries retried`);
      }

      logger.info(`[Cron] Upload successful: ${uploadResult.data?.message || 'Success'}`);

      // Step 4: Revalidate cache
      logger.info('[Cron] Revalidating cache...');
      revalidateTag(CACHE_TAGS.SCHEDULE, 'max');
      revalidateTag(CACHE_TAGS.STATS, 'max');
      revalidateTag(CACHE_TAGS.LOCATIONS, 'max');
      revalidateTag(CACHE_TAGS.PDF, 'max');
      revalidatePath('/');
      revalidatePath('/calendar');

      // Step 5: Log execution
      logger.info('[Cron] Logging execution...');
      await this.logExecution({
        executedAt: new Date(),
        success: true,
        duration: Date.now() - startTime,
        locationsProcessed: apiDataMap.size,
        entriesProcessed: processingResult.total,
        entriesCreated: uploadResult.data?.rowCount || 0,
        entriesUpdated: 0, // uploadSchedule doesn't distinguish between create/update
        entriesFailed: processingResult.invalid,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      });

      const duration = Date.now() - startTime;
      const result: CronExecutionResult = {
        success: true,
        message: fallbackUsed
          ? `Successfully updated prayer times for ${apiDataMap.size} locations (using cached data)`
          : `Successfully updated prayer times for ${apiDataMap.size} locations`,
        timestamp,
        duration,
        locationsProcessed: apiDataMap.size,
        entriesProcessed: processingResult.total,
        entriesCreated: uploadResult.data?.rowCount || 0,
        entriesUpdated: 0,
        entriesFailed: processingResult.invalid,
        errors,
        retriedLocations,
        fallbackUsed,
      };

      // Send success notification
      await this.sendNotification(result, false);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('[Cron] Error during execution:', { error: error instanceof Error ? error.message : String(error) });

      // Log failed execution
      try {
        await this.logExecution({
          executedAt: new Date(),
          success: false,
          duration,
          locationsProcessed: 0,
          entriesProcessed: 0,
          entriesCreated: 0,
          entriesUpdated: 0,
          entriesFailed: 0,
          errors: errorMessage,
        });
      } catch (logError) {
        logger.error('[Cron] Failed to log execution:', { error: logError instanceof Error ? logError.message : String(logError) });
      }

      const result: CronExecutionResult = {
        success: false,
        message: `Failed to update prayer times: ${errorMessage}`,
        timestamp,
        duration,
        locationsProcessed: 0,
        entriesProcessed: 0,
        entriesCreated: 0,
        entriesUpdated: 0,
        entriesFailed: 0,
        errors: [errorMessage],
      };

      // Send failure notification
      await this.sendNotification(result, true);

      return result;
    }
  }

  /**
   * Get the last execution log
   */
  async getLastExecution(): Promise<CronExecutionLog | null> {
    try {
      const log = await prisma.cronExecutionLog.findFirst({
        orderBy: { executedAt: 'desc' },
      });
      return log;
    } catch (error) {
      console.error('Error fetching last execution log:', error);
      return null;
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(limit: number = 10): Promise<CronExecutionLog[]> {
    try {
      const logs = await prisma.cronExecutionLog.findMany({
        orderBy: { executedAt: 'desc' },
        take: limit,
      });
      return logs;
    } catch (error) {
      console.error('Error fetching execution history:', error);
      return [];
    }
  }

  /**
   * Log execution to database
   */
  private async logExecution(log: Omit<CronExecutionLog, 'id'>): Promise<void> {
    try {
      // Note: This assumes you have a CronExecutionLog model in your Prisma schema
      // You'll need to add this model if it doesn't exist
      await prisma.cronExecutionLog.create({
        data: log,
      });
    } catch (error) {
      console.error('Error logging execution:', error);
      // Don't throw here - logging failures shouldn't fail the entire cron job
    }
  }

  /**
   * Get cron status summary
   */
  async getStatusSummary(): Promise<{
    lastExecution: CronExecutionLog | null;
    isHealthy: boolean;
    nextScheduledUpdate: string;
  }> {
    const lastExecution = await this.getLastExecution();
    const isHealthy = lastExecution ? lastExecution.success : true;

    // Calculate next scheduled update (assuming monthly on the 1st)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextScheduledUpdate = nextMonth.toISOString();

    return {
      lastExecution,
      isHealthy,
      nextScheduledUpdate,
    };
  }
}

/**
 * Singleton instance of the cron handler
 */
let cronInstance: PrayerTimeCron | null = null;

export function getPrayerTimeCron(): PrayerTimeCron {
  if (!cronInstance) {
    cronInstance = new PrayerTimeCron();
  }
  return cronInstance;
}
