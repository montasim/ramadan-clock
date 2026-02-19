/**
 * Upload Server Actions (Refactored)
 * Server actions using clean architecture with use cases
 */

'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

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
 * Validate schedule file entries
 * @param entries - Parsed entries from file
 * @returns Validation result with errors and preview
 */
export async function validateScheduleFile(entries: Array<{
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}>) {
  try {
    return await uploadScheduleUseCase.validate(entries);
  } catch (error) {
    logger.error('Failed to validate schedule file', {}, error as Error);
    return {
      valid: false,
      errors: [{ row: 0, error: 'Validation failed' }],
      preview: [],
    };
  }
}

/**
 * Upload schedule entries
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
) {
  try {
    const result = await uploadScheduleUseCase.upload(entries, fileName);

    if (result.success) {
      revalidatePath('/');
      revalidatePath('/calendar');
    }

    return result;
  } catch (error) {
    logger.error('Failed to upload schedule', { fileName }, error as Error);
    return {
      success: false,
      message: 'Failed to upload entries',
    };
  }
}
