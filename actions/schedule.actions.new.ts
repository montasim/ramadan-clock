/**
 * Schedule Server Actions (Refactored)
 * Server actions using clean architecture with use cases
 */

'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { DatabaseError } from '@/lib/errors';

// Import use cases
import { GetTodayScheduleUseCase } from '@/features/schedule/use-cases/get-today-schedule.use-case';
import { GetFullScheduleUseCase } from '@/features/schedule/use-cases/get-full-schedule.use-case';
import { GetScheduleDisplayDataUseCase } from '@/features/schedule/use-cases/get-schedule-display-data.use-case';
import { GetLocationsUseCase } from '@/features/schedule/use-cases/get-locations.use-case';
import { UpdateEntryUseCase } from '@/features/schedule/use-cases/update-entry.use-case';
import { DeleteEntryUseCase } from '@/features/schedule/use-cases/delete-entry.use-case';

// Import TimeEntry type
import type { TimeEntry } from '@/features/schedule/domain/entities/time-entry.entity';

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
 * Get today's schedule
 * @param location - Optional location filter
 * @returns Today's time entry or null
 */
export async function getTodaySchedule(location?: string | null) {
  try {
    const entry = await getTodayScheduleUseCase.execute(location);
    return entry ? entry.toFormattedDTO() : null;
  } catch (error) {
    logger.error('Failed to get today schedule', { location }, error as Error);
    return null;
  }
}

/**
 * Get full schedule
 * @param location - Optional location filter
 * @returns All time entries with formatted times
 */
export async function getFullSchedule(location?: string | null) {
  try {
    const entries = await getFullScheduleUseCase.execute(location);
    return entries.map((e) => e.toFormattedDTO());
  } catch (error) {
    logger.error('Failed to get full schedule', { location }, error as Error);
    return [];
  }
}

/**
 * Get schedule display data
 * @param location - Optional location filter
 * @returns Schedule display data with formatted entries
 */
export async function getScheduleDisplayData(location?: string | null) {
  try {
    const data = await getScheduleDisplayDataUseCase.execute(location);
    return {
      today: data.today ? data.today.toFormattedDTO() : null,
      tomorrow: data.tomorrow ? data.tomorrow.toFormattedDTO() : null,
      sehriPassed: data.sehriPassed,
      iftarPassed: data.iftarPassed,
    };
  } catch (error) {
    logger.error('Failed to get schedule display data', { location }, error as Error);
    return {
      today: null,
      tomorrow: null,
      sehriPassed: false,
      iftarPassed: false,
    };
  }
}

/**
 * Get all locations
 * @returns List of unique location names
 */
export async function getLocations() {
  try {
    return await getLocationsUseCase.execute();
  } catch (error) {
    logger.error('Failed to get locations', {}, error as Error);
    return [];
  }
}

/**
 * Delete time entry
 * @param id - Time entry ID
 * @returns Success status and optional error message
 */
export async function deleteTimeEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteEntryUseCase.execute(id);
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete time entry', { id }, error as Error);
    return { success: false, error: 'Failed to delete entry' };
  }
}

/**
 * Update time entry
 * @param id - Time entry ID
 * @param data - Data to update
 * @returns Success status and optional error message
 */
export async function updateTimeEntry(
  id: string,
  data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateEntryUseCase.execute(id, data);
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Failed to update time entry', { id, data }, error as Error);
    return { success: false, error: 'Failed to update entry' };
  }
}
