/**
 * Schedule Server Actions (Refactored)
 * Server actions using clean architecture with use cases
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, ValidationError, AppError } from '@/lib/errors';
import { timeEntryUpdateSchema, scheduleIdSchema } from '@/lib/validations/api-schemas';

// Import use cases
import { GetTodayScheduleUseCase } from '@/features/schedule/use-cases/get-today-schedule.use-case';
import { GetFullScheduleUseCase } from '@/features/schedule/use-cases/get-full-schedule.use-case';
import { GetScheduleDisplayDataUseCase } from '@/features/schedule/use-cases/get-schedule-display-data.use-case';
import { GetLocationsUseCase } from '@/features/schedule/use-cases/get-locations.use-case';
import { UpdateEntryUseCase } from '@/features/schedule/use-cases/update-entry.use-case';
import { DeleteEntryUseCase } from '@/features/schedule/use-cases/delete-entry.use-case';

// Import TimeEntry type
import type { TimeEntry } from '@/features/schedule/domain/entities/time-entry.entity';
import type { TimeEntryDTO } from '@/features/schedule/domain/entities/time-entry.entity';

// Import repositories and services for initialization
import { TimeEntryRepository } from '@/features/schedule/repositories/time-entry.repository';
import { UploadLogRepository } from '@/features/schedule/repositories/upload-log.repository';
import { ScheduleService } from '@/features/schedule/services/schedule.service';
import { TimeCalculatorService } from '@/features/schedule/services/time-calculator.service';

// Initialize dependencies
const timeEntryRepository = new TimeEntryRepository();
const uploadLogRepository = new UploadLogRepository();
const timeCalculator = new TimeCalculatorService();
const scheduleService = new ScheduleService(timeEntryRepository, timeCalculator, uploadLogRepository);

// Initialize use cases
const getTodayScheduleUseCase = new GetTodayScheduleUseCase(scheduleService);
const getFullScheduleUseCase = new GetFullScheduleUseCase(scheduleService);
const getScheduleDisplayDataUseCase = new GetScheduleDisplayDataUseCase(scheduleService);
const getLocationsUseCase = new GetLocationsUseCase(scheduleService);
const updateEntryUseCase = new UpdateEntryUseCase(scheduleService);
const deleteEntryUseCase = new DeleteEntryUseCase(scheduleService);

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
 * @throws {ForbiddenError} If not admin
 */
async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }

  // @ts-ignore - session.user may have isAdmin property
  if (!session.user?.isAdmin) {
    throw new ForbiddenError('Admin access required');
  }

  return session;
}

/**
 * Get today's schedule
 * @param location - Optional location filter
 * @returns Today's time entry or null
 */
export async function getTodaySchedule(location?: string | null): Promise<ActionResult<TimeEntryDTO | null>> {
  try {
    const entry = await getTodayScheduleUseCase.execute(location);
    return {
      success: true,
      data: entry ? entry.toFormattedDTO() : null,
    };
  } catch (error) {
    logger.error('Failed to get today schedule', { location }, error as Error);
    return {
      success: false,
      error: {
        code: error instanceof AppError ? error.constructor.name : 'InternalServerError',
        message: error instanceof Error ? error.message : 'Failed to get today schedule',
      },
    };
  }
}

/**
 * Get full schedule
 * @param location - Optional location filter
 * @returns All time entries with formatted times
 */
export async function getFullSchedule(location?: string | null): Promise<ActionResult<TimeEntryDTO[]>> {
  try {
    const entries = await getFullScheduleUseCase.execute(location);
    return {
      success: true,
      data: entries.map((e) => e.toFormattedDTO()),
    };
  } catch (error) {
    logger.error('Failed to get full schedule', { location }, error as Error);
    return {
      success: false,
      error: {
        code: error instanceof AppError ? error.constructor.name : 'InternalServerError',
        message: error instanceof Error ? error.message : 'Failed to get full schedule',
      },
    };
  }
}

/**
 * Get schedule display data
 * @param location - Optional location filter
 * @returns Schedule display data with formatted entries
 */
export async function getScheduleDisplayData(
  location?: string | null
): Promise<ActionResult<{
  today: TimeEntryDTO | null;
  tomorrow: TimeEntryDTO | null;
  sehriPassed: boolean;
  iftarPassed: boolean;
}>> {
  try {
    const data = await getScheduleDisplayDataUseCase.execute(location);
    return {
      success: true,
      data: {
        today: data.today ? data.today.toFormattedDTO() : null,
        tomorrow: data.tomorrow ? data.tomorrow.toFormattedDTO() : null,
        sehriPassed: data.sehriPassed,
        iftarPassed: data.iftarPassed,
      },
    };
  } catch (error) {
    logger.error('Failed to get schedule display data', { location }, error as Error);
    return {
      success: false,
      error: {
        code: error instanceof AppError ? error.constructor.name : 'InternalServerError',
        message: error instanceof Error ? error.message : 'Failed to get schedule display data',
      },
    };
  }
}

/**
 * Get all locations
 * @returns List of unique location names
 */
export async function getLocations(): Promise<ActionResult<string[]>> {
  try {
    const locations = await getLocationsUseCase.execute();
    return {
      success: true,
      data: locations,
    };
  } catch (error) {
    logger.error('Failed to get locations', {}, error as Error);
    return {
      success: false,
      error: {
        code: error instanceof AppError ? error.constructor.name : 'InternalServerError',
        message: error instanceof Error ? error.message : 'Failed to get locations',
      },
    };
  }
}

/**
 * Delete time entry (admin only)
 * @param id - Time entry ID
 * @returns Success status and optional error message
 */
export async function deleteTimeEntry(id: string): Promise<ActionResult> {
  try {
    // Require admin session
    await requireAdminSession();

    // Validate ID
    scheduleIdSchema.parse({ id });

    // Delete entry
    await deleteEntryUseCase.execute(id);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');

    logger.info('Time entry deleted successfully', { id });

    return { success: true };
  } catch (error) {
    logger.error('Failed to delete time entry', { id }, error as Error);

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
          message: 'Invalid ID format',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to delete entry',
      },
    };
  }
}

/**
 * Update time entry (admin only)
 * @param id - Time entry ID
 * @param data - Data to update
 * @returns Success status and optional error message
 */
export async function updateTimeEntry(
  id: string,
  data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
): Promise<ActionResult> {
  try {
    // Require admin session
    await requireAdminSession();

    // Validate ID
    scheduleIdSchema.parse({ id });

    // Validate data
    timeEntryUpdateSchema.parse(data);

    // Update entry
    await updateEntryUseCase.execute(id, data);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');

    logger.info('Time entry updated successfully', { id, data });

    return { success: true };
  } catch (error) {
    logger.error('Failed to update time entry', { id, data }, error as Error);

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
          message: 'Invalid input data',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to update entry',
      },
    };
  }
}
