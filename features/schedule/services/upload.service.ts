/**
 * Upload Service
 * Business logic for file upload operations
 */

import { prisma } from '@/lib/db';
import { TimeEntryRepository } from '../repositories/time-entry.repository';
import { UploadLogRepository } from '../repositories/upload-log.repository';
import { logger } from '@/lib/logger';
import { UPLOAD_CONFIG } from '@/lib/config/index';
import { timeEntryArraySchema } from '@/lib/validations';

/**
 * Parsed entry from file
 */
export interface ParsedEntry {
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  message: string;
  rowCount?: number;
  errors?: Array<{ row: number; error: string }>;
  retried?: number;
  rolledBack?: boolean;
}

/**
 * Upload progress callback
 */
export type ProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  batch: number;
  totalBatches: number;
  status: 'validating' | 'uploading' | 'retrying' | 'completed' | 'failed';
}) => void;

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}

/**
 * Upload Service
 * Handles file upload validation and processing
 */
export class UploadService {
  private readonly BATCH_SIZE = 50;
  private readonly RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  };

  constructor(
    private readonly timeEntryRepository: TimeEntryRepository,
    private readonly uploadLogRepository: UploadLogRepository
  ) {}

  /**
   * Validate schedule file entries
   * @param entries - Parsed entries from file
   * @returns Validation result with errors and preview
   */
  async validateScheduleFile(entries: ParsedEntry[]): Promise<{
    valid: boolean;
    errors: Array<{ row: number; error: string }>;
    preview: ParsedEntry[];
  }> {
    const errors: Array<{ row: number; error: string }> = [];
    const validEntries: ParsedEntry[] = [];

    // Check row limit
    if (entries.length > UPLOAD_CONFIG.maxRows) {
      return {
        valid: false,
        errors: [
          {
            row: 0,
            error: `File exceeds maximum of ${UPLOAD_CONFIG.maxRows} rows`,
          },
        ],
        preview: [],
      };
    }

    // Validate each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const result = timeEntryArraySchema.safeParse([entry]);

      if (!result.success) {
        errors.push({
          row: i + 1,
          error: result.error.issues.map((e) => e.message).join(', '),
        });
      } else {
        validEntries.push(entry);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      preview: validEntries,
    };
  }

  /**
   * Bulk upsert entries with transaction support and rollback
   * @param entries - Entries to upsert
   * @returns Number of entries upserted
   * @throws {Error} If any batch fails, transaction will rollback
   */
  private async bulkUpsertWithTransaction(entries: ParsedEntry[]): Promise<number> {
    return await prisma.$transaction(async (tx) => {
      let upsertedCount = 0;

      // Process in batches to avoid overwhelming the database
      for (let i = 0; i < entries.length; i += this.BATCH_SIZE) {
        const batch = entries.slice(i, i + this.BATCH_SIZE);

        await Promise.all(
          batch.map((entry) =>
            tx.timeEntry.upsert({
              where: {
                date_location: {
                  date: entry.date,
                  location: entry.location as string,
                },
              },
              update: {
                sehri: entry.sehri,
                iftar: entry.iftar,
              },
              create: {
                date: entry.date,
                sehri: entry.sehri,
                iftar: entry.iftar,
                location: entry.location as string,
              },
            })
          )
        );

        upsertedCount += batch.length;
      }

      return upsertedCount;
    });
  }

  /**
   * Retry a failed entry with exponential backoff
   * @param entry - Entry to retry
   * @param attempt - Current attempt number
   * @returns Promise that resolves when retry is complete
   */
  private async retryEntry(
    entry: ParsedEntry,
    attempt: number
  ): Promise<{ success: boolean; error?: string }> {
    const delay = this.RETRY_CONFIG.retryDelay * Math.pow(this.RETRY_CONFIG.backoffMultiplier, attempt - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await prisma.timeEntry.upsert({
        where: {
          date_location: {
            date: entry.date,
            location: entry.location as string,
          },
        },
        update: {
          sehri: entry.sehri,
          iftar: entry.iftar,
        },
        create: {
          date: entry.date,
          sehri: entry.sehri,
          iftar: entry.iftar,
          location: entry.location as string,
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process entries with retry logic
   * @param entries - Entries to process
   * @param onProgress - Optional progress callback
   * @returns Result with success count and failed entries
   */
  private async processWithRetry(
    entries: ParsedEntry[],
    onProgress?: ProgressCallback
  ): Promise<{ success: number; failed: Array<{ entry: ParsedEntry; error: string }> }> {
    const failedEntries: Array<{ entry: ParsedEntry; error: string }> = [];
    let successCount = 0;

    for (let i = 0; i < entries.length; i += this.BATCH_SIZE) {
      const batch = entries.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(entries.length / this.BATCH_SIZE);

      // Report progress
      onProgress?.({
        current: i,
        total: entries.length,
        percentage: Math.round((i / entries.length) * 100),
        batch: batchNumber,
        totalBatches,
        status: 'uploading',
      });

      // Try to process the batch with transaction for rollback
      try {
        await this.bulkUpsertWithTransaction(batch);
        successCount += batch.length;
      } catch (error) {
        // Transaction failed, retry individual entries
        logger.warn(`Batch ${batchNumber} failed, retrying individual entries`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        onProgress?.({
          current: i,
          total: entries.length,
          percentage: Math.round((i / entries.length) * 100),
          batch: batchNumber,
          totalBatches,
          status: 'retrying',
        });

        // Retry each entry individually
        for (const entry of batch) {
          let entrySuccess = false;
          let lastError = '';

          for (let attempt = 1; attempt <= this.RETRY_CONFIG.maxRetries; attempt++) {
            const result = await this.retryEntry(entry, attempt);
            
            if (result.success) {
              entrySuccess = true;
              successCount++;
              break;
            } else {
              lastError = result.error || 'Unknown error';
              logger.debug(`Retry attempt ${attempt} failed for ${entry.date}-${entry.location}`, {
                error: lastError,
              });
            }
          }

          if (!entrySuccess) {
            failedEntries.push({
              entry,
              error: lastError,
            });
          }
        }
      }
    }

    return { success: successCount, failed: failedEntries };
  }

  /**
   * Upload schedule entries with transaction support, rollback, retry logic, and progress tracking
   * @param entries - Parsed entries from file
   * @param fileName - Name of the uploaded file
   * @param onProgress - Optional progress callback for real-time updates
   * @returns Upload result
   */
  async uploadSchedule(
    entries: ParsedEntry[],
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    const errors: Array<{ row: number; error: string }> = [];
    const validEntries: ParsedEntry[] = [];

    // Report validation progress
    onProgress?.({
      current: 0,
      total: entries.length,
      percentage: 0,
      batch: 0,
      totalBatches: 0,
      status: 'validating',
    });

    // Validate each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const result = timeEntryArraySchema.safeParse([entry]);

      if (!result.success) {
        errors.push({
          row: i + 1,
          error: result.error.issues.map((e) => e.message).join(', '),
        });
      } else {
        validEntries.push(entry);
      }

      // Report validation progress
      onProgress?.({
        current: i + 1,
        total: entries.length,
        percentage: Math.round(((i + 1) / entries.length) * 100),
        batch: 0,
        totalBatches: 0,
        status: 'validating',
      });
    }

    if (validEntries.length === 0) {
      onProgress?.({
        current: entries.length,
        total: entries.length,
        percentage: 100,
        batch: 0,
        totalBatches: 0,
        status: 'failed',
      });

      return {
        success: false,
        message: 'No valid entries found',
        errors,
      };
    }

    // Check for duplicates within the upload
    const seen = new Set<string>();
    const uniqueEntries: ParsedEntry[] = [];

    for (const entry of validEntries) {
      const key = `${entry.date}-${entry.location || ''}`;
      if (seen.has(key)) {
        errors.push({
          row: validEntries.indexOf(entry) + 1,
          error: `Duplicate entry for ${entry.date} in ${entry.location || 'no location'}`,
        });
      } else {
        seen.add(key);
        uniqueEntries.push(entry);
      }
    }

    // Process entries with retry logic and progress tracking
    try {
      const { success: successCount, failed } = await this.processWithRetry(
        uniqueEntries,
        onProgress
      );

      // Convert failed entries to error format
      for (const failedEntry of failed) {
        const originalIndex = entries.findIndex(
          e => e.date === failedEntry.entry.date && e.location === failedEntry.entry.location
        );
        errors.push({
          row: originalIndex + 1,
          error: failedEntry.error,
        });
      }

      // Calculate retried count (failed entries that succeeded after retry)
      const retriedCount = failed.filter(f => !errors.find(e => 
        e.row === entries.findIndex(
          e2 => e2.date === f.entry.date && e2.location === f.entry.location
        ) + 1
      )).length;

      // Log the upload
      await this.uploadLogRepository.create({
        fileName,
        rowCount: successCount,
        status: failed.length > 0 ? 'partial' : 'success',
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      });

      // Report completion
      onProgress?.({
        current: entries.length,
        total: entries.length,
        percentage: 100,
        batch: Math.ceil(entries.length / this.BATCH_SIZE),
        totalBatches: Math.ceil(entries.length / this.BATCH_SIZE),
        status: failed.length === 0 ? 'completed' : 'failed',
      });

      return {
        success: failed.length === 0,
        message: failed.length === 0
          ? `Successfully uploaded ${successCount} entries`
          : `Uploaded ${successCount} entries with ${failed.length} failures`,
        rowCount: successCount,
        errors: errors.length > 0 ? errors : undefined,
        retried: retriedCount,
        rolledBack: false,
      };
    } catch (error) {
      logger.error(
        'Error uploading schedule',
        { fileName, entryCount: uniqueEntries.length },
        error as Error
      );

      // Report failure
      onProgress?.({
        current: entries.length,
        total: entries.length,
        percentage: 100,
        batch: Math.ceil(entries.length / this.BATCH_SIZE),
        totalBatches: Math.ceil(entries.length / this.BATCH_SIZE),
        status: 'failed',
      });

      await this.uploadLogRepository.create({
        fileName,
        rowCount: 0,
        status: 'failed',
        errors: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        message: 'Failed to upload entries',
        errors,
        rolledBack: true,
      };
    }
  }
}
