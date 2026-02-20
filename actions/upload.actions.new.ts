/**
 * Upload Server Actions (Refactored)
 * Server actions using clean architecture with use cases
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { logger } from '@/lib/logger';
import { UnauthorizedError, AppError } from '@/lib/errors';
import { batchTimeEntrySchema } from '@/lib/validations/api-schemas';
import { CACHE_TAGS } from '@/lib/cache';

// Import use cases
import { UploadScheduleUseCase } from '@/features/schedule/use-cases/upload-schedule.use-case';

// Import repositories and services for initialization
import { TimeEntryRepository } from '@/features/schedule/repositories/time-entry.repository';
import { UploadLogRepository } from '@/features/schedule/repositories/upload-log.repository';
import { UploadService } from '@/features/schedule/services/upload.service';

// Initialize dependencies
const timeEntryRepository = new TimeEntryRepository();
const uploadLogRepository = new UploadLogRepository();
const uploadService = new UploadService(timeEntryRepository, uploadLogRepository);

// Initialize use case
const uploadScheduleUseCase = new UploadScheduleUseCase(uploadService);

/**
 * Action result type
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Require admin session
 * @throws {UnauthorizedError} If not authenticated
 */
async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }

  // Since this is an admin-only application, any authenticated user is an admin
  return session;
}

/**
 * Validate schedule file entries
 * @param entries - Parsed entries from file
 * @returns Validation result with errors and preview
 */
export async function validateScheduleFile(
  entries: Array<{
    date: string;
    sehri: string;
    iftar: string;
    location?: string | null;
  }>
): Promise<ActionResult> {
  try {
    // Validate input
    batchTimeEntrySchema.parse({ entries });

    const result = await uploadScheduleUseCase.validate(entries);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error('Failed to validate schedule file', {}, error as Error);

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
        },
      };
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Invalid file format',
          details: (error as any).issues,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Validation failed',
      },
    };
  }
}

/**
 * Upload schedule entries (admin only)
 * @param entries - Parsed entries from file
 * @param fileName - Name of the uploaded file
 * @returns Upload result
 */
export async function uploadSchedule(
  entries: Array<{
    date: string;
    sehri: string;
    iftar: string;
    location?: string | null;
  }>,
  fileName: string
): Promise<ActionResult> {
  try {
    // Require admin session
    await requireAdminSession();

    // Validate input
    batchTimeEntrySchema.parse({ entries });

    const result = await uploadScheduleUseCase.upload(entries, fileName);

    if (result.success) {
      // Invalidate caches
      revalidateTag(CACHE_TAGS.SCHEDULE, 'max');
      revalidateTag(CACHE_TAGS.STATS, 'max');
      revalidateTag(CACHE_TAGS.LOCATIONS, 'max');
      revalidateTag(CACHE_TAGS.PDF, 'max');

      // Revalidate paths for ISR
      revalidatePath('/');
      revalidatePath('/calendar');
      revalidatePath('/admin/dashboard');

      logger.info('Schedule uploaded successfully', {
        fileName,
        entriesCount: entries.length,
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error('Failed to upload schedule', { fileName }, error as Error);

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
        },
      };
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Invalid file format',
          details: (error as any).issues,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to upload entries',
      },
    };
  }
}
