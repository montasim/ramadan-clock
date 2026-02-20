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
}

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
   * Execute update for a specific month
   */
  async executeForSpecificMonth(
    year: number,
    month: number
  ): Promise<CronExecutionResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const errors: string[] = [];

    console.log(`[Cron] Starting prayer time update for ${year}-${month}`);

    try {
      // Step 1: Fetch prayer times from API for all locations
      console.log('[Cron] Fetching prayer times from API...');
      const apiDataMap = await this.apiService.fetchAllLocations(month, year);
      const locationsProcessed = apiDataMap.size;

      if (locationsProcessed === 0) {
        throw new Error('No locations were processed from the API');
      }

      console.log(`[Cron] Fetched data for ${locationsProcessed} locations`);

      // Step 2: Process and validate the data
      console.log('[Cron] Processing and validating data...');
      const processingResult = this.processor.batchProcess(apiDataMap);

      if (processingResult.invalid > 0) {
        console.warn(
          `[Cron] Found ${processingResult.invalid} invalid entries out of ${processingResult.total}`
        );
        errors.push(
          `${processingResult.invalid} invalid entries found. See logs for details.`
        );
      }

      if (processingResult.valid === 0) {
        throw new Error('No valid entries to process');
      }

      console.log(`[Cron] Processed ${processingResult.valid} valid entries`);

      // Step 3: Upload to database using existing uploadSchedule action
      console.log('[Cron] Uploading entries via uploadSchedule...');
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

      console.log(`[Cron] Upload successful: ${uploadResult.data?.message || 'Success'}`);

      // Step 4: Revalidate cache
      console.log('[Cron] Revalidating cache...');
      revalidateTag(CACHE_TAGS.SCHEDULE, 'max');
      revalidateTag(CACHE_TAGS.STATS, 'max');
      revalidateTag(CACHE_TAGS.LOCATIONS, 'max');
      revalidateTag(CACHE_TAGS.PDF, 'max');
      revalidatePath('/');
      revalidatePath('/calendar');

      // Step 5: Log execution
      console.log('[Cron] Logging execution...');
      await this.logExecution({
        executedAt: new Date(),
        success: true,
        duration: Date.now() - startTime,
        locationsProcessed,
        entriesProcessed: processingResult.total,
        entriesCreated: uploadResult.data?.rowCount || 0,
        entriesUpdated: 0, // uploadSchedule doesn't distinguish between create/update
        entriesFailed: processingResult.invalid,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Successfully updated prayer times for ${locationsProcessed} locations`,
        timestamp,
        duration,
        locationsProcessed,
        entriesProcessed: processingResult.total,
        entriesCreated: uploadResult.data?.rowCount || 0,
        entriesUpdated: 0,
        entriesFailed: processingResult.invalid,
        errors,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('[Cron] Error during execution:', error);

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
        console.error('[Cron] Failed to log execution:', logError);
      }

      return {
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
