/**
 * Batch Schedule Upload API Endpoint
 * RESTful API for batch uploading schedule entries
 *
 * POST   /api/schedule/batch - Upload multiple entries (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import {
  withErrorHandler,
  withRateLimit,
  withAuth,
  success,
  error,
} from '@/lib/api';
import { batchTimeEntrySchema } from '@/lib/validations/api-schemas';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache';
import { progressStore } from '@/lib/progress/progress-store';

/**
 * Batch upload time entries
 * 
 * @param request - Next.js request object
 * @returns NextResponse with upload result
 * 
 * @example
 * // POST /api/schedule/batch
 * // Body: { entries: [{ date: "2024-03-12", sehri: "04:30", iftar: "18:15", location: "Dhaka" }], fileName: "upload.json" }
 * // Response: { success: true, data: { rowCount: 1, message: "..." } }
 */
async function batchUploadScheduleHandler(request: NextRequest): Promise<NextResponse> {
  let progressOpId: string | null = null;
  
  try {
    const body = await request.json();
    const fileName = body.fileName || `batch-upload-${new Date().toISOString().split('T')[0]}.json`;
    const { entries } = batchTimeEntrySchema.parse(body);
    const operationId = body.operationId as string | undefined;

    // Create or use existing progress operation
    if (operationId) {
      progressOpId = operationId;
      const existing = progressStore.get(operationId);
      if (!existing || existing.type !== 'upload') {
        throw new Error('Invalid operation ID');
      }
    } else {
      progressOpId = progressStore.create('upload', entries.length, 'validating');
    }

    // Update status to validating
    if (progressOpId) {
      progressStore.update(progressOpId, { status: 'validating', message: 'Validating entries...' });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: Array<{ date: string; location: string | null; reason: string }> = [];

    // Process entries in batches to avoid transaction timeout
    const BATCH_SIZE = 100;
    const BATCH_TIMEOUT = 10000; // 10 seconds

    // Update status to uploading
    if (progressOpId) {
      progressStore.update(progressOpId, { status: 'uploading', message: 'Uploading entries...' });
    }

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      // Update progress
      if (progressOpId) {
        progressStore.update(progressOpId, {
          current: i,
          message: `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(entries.length / BATCH_SIZE)}...`,
        });
      }

      const batchResult = await prisma.$transaction(async (tx) => {
        let batchCreated = 0;
        let batchSkipped = 0;

        // Collect all dates and locations to check in a single query
        const dateLocationPairs = batch.map(e => ({
          date: e.date,
          location: e.location || null,
        }));

        // Check existing entries in batch
        const existingEntries = await tx.timeEntry.findMany({
          where: {
            OR: dateLocationPairs.map(pair => ({
              date: pair.date,
              location: pair.location,
            })),
          },
          select: {
            date: true,
            location: true,
          },
        });

        // Create a set of existing entries for fast lookup
        const existingSet = new Set(
          existingEntries.map(e => `${e.date}-${e.location || 'null'}`)
        );

        // Prepare data for bulk create
        const toCreate = batch
          .filter(entry => !existingSet.has(`${entry.date}-${entry.location || 'null'}`))
          .map(entry => ({
            date: entry.date,
            sehri: entry.sehri,
            iftar: entry.iftar,
            location: entry.location,
          }));

        // Bulk create entries
        if (toCreate.length > 0) {
          await tx.timeEntry.createMany({
            data: toCreate,
            skipDuplicates: true,
          });
          batchCreated = toCreate.length;
        }

        batchSkipped = batch.length - batchCreated;
        return { batchCreated, batchSkipped };
      }, {
        maxWait: BATCH_TIMEOUT,
        timeout: BATCH_TIMEOUT,
      });

      createdCount += batchResult.batchCreated;
      skippedCount += batchResult.batchSkipped;

      // Update progress
      if (progressOpId) {
        progressStore.update(progressOpId, {
          current: i + BATCH_SIZE,
          message: `Processed ${i + BATCH_SIZE} of ${entries.length} entries...`,
        });
      }
    }

    // Mark progress as completed
    if (progressOpId) {
      progressStore.complete(progressOpId, `Successfully uploaded ${createdCount} entries`);
    }

    logger.info('Batch upload completed', {
      fileName,
      rowCount: createdCount,
      skippedCount,
      totalEntries: entries.length,
      errorsCount: errors.length,
    });

    // Invalidate cache tags
    // Note: In Next.js API routes, we can't directly use revalidateTag/revalidatePath
    // The cache invalidation should happen on next page load or via a separate mechanism

    return success({
      rowCount: createdCount,
      skippedCount,
      totalEntries: entries.length,
      errors: errors.length > 0 ? errors : undefined,
      operationId: progressOpId,
      message: `Successfully uploaded ${createdCount} entries${skippedCount > 0 ? ` (skipped ${skippedCount} duplicates)` : ''}${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    }, 201);
  } catch (err) {
    // Mark progress as failed if we have an operation ID
    if (progressOpId) {
      progressStore.fail(progressOpId, err instanceof Error ? err.message : 'Failed to upload entries');
    }
    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const validationErrors = err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      logger.error('Validation failed for batch schedule upload', { errors: validationErrors }, err as Error);

      return error(
        400,
        'ValidationError',
        'Invalid input: entries array is required and must contain valid time entries',
        { errors: validationErrors }
      );
    }

    // Handle other errors
    logger.error('Failed to batch upload schedule', {}, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleBatchUploadError',
        'Failed to batch upload schedule',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleBatchUploadError',
      'Failed to batch upload schedule'
    );
  }
}

/**
 * POST handler with middleware (admin only)
 */
export const POST = withErrorHandler(
  withRateLimit(
    withAuth(batchUploadScheduleHandler, { requireAdmin: true }),
    { limit: 5, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
