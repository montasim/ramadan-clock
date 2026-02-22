/**
 * Schedule Admin Service Interface
 * Admin operations for schedule data
 * Part of Interface Segregation Principle (ISP)
 */

import type { TimeEntry } from '../domain/entities/time-entry.entity';

/**
 * Schedule Admin Service Interface
 * Defines admin operations for schedules
 */
export interface IScheduleAdminService {
  /**
   * Get time entry by ID
   * @param id - Time entry ID
   * @returns Time entry or null if not found
   */
  getTimeEntryById(id: string): Promise<TimeEntry | null>;

  /**
   * Update time entry
   * @param id - Time entry ID
   * @param data - Data to update
   * @returns Updated time entry
   */
  updateTimeEntry(
    id: string,
    data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
  ): Promise<TimeEntry>;

  /**
   * Delete time entry
   * @param id - Time entry ID
   */
  deleteTimeEntry(id: string): Promise<void>;

  /**
   * Bulk delete time entries
   * @param ids - Array of time entry IDs to delete
   * @returns Result with deleted count
   */
  bulkDeleteTimeEntries(ids: string[]): Promise<{ success: boolean; deletedCount?: number }>;
}
