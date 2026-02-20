/**
 * Bulk Upsert Service
 * Handles bulk upsert operations for time entries
 */

import { prisma } from '@/lib/db';
import type { TimeEntry } from '@/lib/db';

/**
 * Result of a bulk upsert operation
 */
export interface BulkUpsertResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ date: string; location: string; error: string }>;
  duration: number; // Duration in milliseconds
}

/**
 * Detailed result with per-entry information
 */
export interface DetailedUpsertResult extends BulkUpsertResult {
  details: Array<{
    date: string;
    location: string;
    action: 'created' | 'updated' | 'failed';
    error?: string;
  }>;
}

/**
 * Upsert options
 */
export interface UpsertOptions {
  batchSize?: number; // Number of entries to process in a single batch
  skipDuplicates?: boolean; // Skip duplicate entries instead of updating
  source?: 'manual' | 'api' | 'cron'; // Source of the data
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: UpsertOptions = {
  batchSize: 50,
  skipDuplicates: false,
  source: 'api',
};

/**
 * Bulk Upsert Service
 */
export class BulkUpsertService {
  /**
   * Bulk upsert time entries
   */
  async upsertTimeEntries(
    entries: TimeEntry[],
    options: UpsertOptions = {}
  ): Promise<BulkUpsertResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    const result: BulkUpsertResult = {
      success: true,
      total: entries.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      duration: 0,
    };

    // Process in batches
    const batches = this.createBatches(entries, opts.batchSize!);

    for (const batch of batches) {
      try {
        const batchResult = await this.processBatch(batch, opts);
        result.created += batchResult.created;
        result.updated += batchResult.updated;
        result.failed += batchResult.failed;
        result.errors.push(...batchResult.errors);
      } catch (error) {
        console.error('Error processing batch:', error);
        result.success = false;
        result.failed += batch.length;
        batch.forEach((entry) => {
          result.errors.push({
            date: entry.date,
            location: entry.location || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      }
    }

    result.duration = Date.now() - startTime;
    result.success = result.failed === 0;

    return result;
  }

  /**
   * Bulk upsert time entries with detailed results
   */
  async upsertTimeEntriesDetailed(
    entries: TimeEntry[],
    options: UpsertOptions = {}
  ): Promise<DetailedUpsertResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    const result: DetailedUpsertResult = {
      success: true,
      total: entries.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      duration: 0,
      details: [],
    };

    // Process in batches
    const batches = this.createBatches(entries, opts.batchSize!);

    for (const batch of batches) {
      try {
        const batchResult = await this.processBatchDetailed(batch, opts);
        result.created += batchResult.created;
        result.updated += batchResult.updated;
        result.failed += batchResult.failed;
        result.errors.push(...batchResult.errors);
        result.details.push(...batchResult.details);
      } catch (error) {
        console.error('Error processing batch:', error);
        result.success = false;
        result.failed += batch.length;
        batch.forEach((entry) => {
          const errorDetail = {
            date: entry.date,
            location: entry.location || 'unknown',
            action: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          result.errors.push({
            date: entry.date,
            location: entry.location || 'unknown',
            error: errorDetail.error,
          });
          result.details.push(errorDetail);
        });
      }
    }

    result.duration = Date.now() - startTime;
    result.success = result.failed === 0;

    return result;
  }

  /**
   * Upsert time entries for a specific Ramadan month
   * This will delete existing entries for the month and insert new ones
   */
  async upsertForRamadanMonth(
    year: number,
    month: number,
    entries: TimeEntry[],
    options: UpsertOptions = {}
  ): Promise<BulkUpsertResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    try {
      // Use a transaction for data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing entries for the month
        const deleted = await tx.timeEntry.deleteMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        console.log(`Deleted ${deleted.count} existing entries for ${year}-${month}`);

        // Insert new entries
        const insertResult = await this.bulkInsert(tx, entries, opts);
        
        return {
          ...insertResult,
          deleted: deleted.count,
        };
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        total: entries.length,
        created: result.created,
        updated: 0, // All are new inserts
        failed: result.failed,
        errors: result.errors,
        duration,
      };
    } catch (error) {
      console.error('Error upserting for Ramadan month:', error);
      return {
        success: false,
        total: entries.length,
        created: 0,
        updated: 0,
        failed: entries.length,
        errors: entries.map((entry) => ({
          date: entry.date,
          location: entry.location || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Create batches from entries
   */
  private createBatches(entries: TimeEntry[], batchSize: number): TimeEntry[][] {
    const batches: TimeEntry[][] = [];
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of entries
   */
  private async processBatch(
    batch: TimeEntry[],
    options: UpsertOptions
  ): Promise<BulkUpsertResult> {
    const result: BulkUpsertResult = {
      success: true,
      total: batch.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      duration: 0,
    };

    if (options.skipDuplicates) {
      // Check for existing entries and skip them
      const existingEntries = await prisma.timeEntry.findMany({
        where: {
          OR: batch.map((entry) => ({
            date: entry.date,
            location: entry.location,
          })),
        },
      });

      const existingKeys = new Set(
        existingEntries.map((e) => `${e.date}-${e.location}`)
      );

      const newEntries = batch.filter(
        (entry) => !existingKeys.has(`${entry.date}-${entry.location}`)
      );

      // Insert only new entries
      for (const entry of newEntries) {
        try {
          await prisma.timeEntry.create({
            data: {
              date: entry.date,
              sehri: entry.sehri,
              iftar: entry.iftar,
              location: entry.location,
            },
          });
          result.created++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            date: entry.date,
            location: entry.location || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } else {
      // Upsert all entries
      for (const entry of batch) {
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
              location: entry.location,
            },
          });
          result.updated++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            date: entry.date,
            location: entry.location || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Process a batch of entries with detailed results
   */
  private async processBatchDetailed(
    batch: TimeEntry[],
    options: UpsertOptions
  ): Promise<DetailedUpsertResult> {
    const result: DetailedUpsertResult = {
      success: true,
      total: batch.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      duration: 0,
      details: [],
    };

    for (const entry of batch) {
      try {
        // Check if entry exists
        const existing = await prisma.timeEntry.findUnique({
          where: {
            date_location: {
              date: entry.date,
              location: entry.location as string,
            },
          },
        });

        if (existing && options.skipDuplicates) {
          // Skip existing entry
          result.details.push({
            date: entry.date,
            location: entry.location || 'unknown',
            action: 'failed',
            error: 'Entry already exists and skipDuplicates is enabled',
          });
          result.failed++;
        } else if (existing) {
          // Update existing entry
          await prisma.timeEntry.update({
            where: {
              date_location: {
                date: entry.date,
                location: entry.location as string,
              },
            },
            data: {
              sehri: entry.sehri,
              iftar: entry.iftar,
            },
          });
          result.updated++;
          result.details.push({
            date: entry.date,
            location: entry.location || 'unknown',
            action: 'updated',
          });
        } else {
          // Create new entry
          await prisma.timeEntry.create({
            data: {
              date: entry.date,
              sehri: entry.sehri,
              iftar: entry.iftar,
              location: entry.location,
            },
          });
          result.created++;
          result.details.push({
            date: entry.date,
            location: entry.location || 'unknown',
            action: 'created',
          });
        }
      } catch (error) {
        result.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          date: entry.date,
          location: entry.location || 'unknown',
          error: errorMsg,
        });
        result.details.push({
          date: entry.date,
          location: entry.location || 'unknown',
          action: 'failed',
          error: errorMsg,
        });
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Bulk insert entries (used within transactions)
   */
  private async bulkInsert(
    tx: any,
    entries: TimeEntry[],
    options: UpsertOptions
  ): Promise<{
    created: number;
    failed: number;
    errors: Array<{ date: string; location: string; error: string }>;
  }> {
    const result = {
      created: 0,
      failed: 0,
      errors: [] as Array<{ date: string; location: string; error: string }>,
    };

    for (const entry of entries) {
      try {
        await tx.timeEntry.create({
          data: {
            date: entry.date,
            sehri: entry.sehri,
            iftar: entry.iftar,
            location: entry.location,
          },
        });
        result.created++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          date: entry.date,
          location: entry.location || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }
}

/**
 * Singleton instance of the bulk upsert service
 */
let bulkUpsertInstance: BulkUpsertService | null = null;

export function getBulkUpsertService(): BulkUpsertService {
  if (!bulkUpsertInstance) {
    bulkUpsertInstance = new BulkUpsertService();
  }
  return bulkUpsertInstance;
}
