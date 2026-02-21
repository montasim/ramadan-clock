/**
 * Schedule Display Service Interface
 * Display operations for schedule data
 * Part of Interface Segregation Principle (ISP)
 */

import type { TimeEntry } from '../domain/entities/time-entry.entity';
import type { ScheduleDisplayData } from '../domain/types/schedule-status.types';

/**
 * Schedule Display Service Interface
 * Defines display operations for schedules
 */
export interface IScheduleDisplayService {
  /**
   * Get today's or next day's schedule
   * Returns tomorrow's schedule if today's iftar has passed
   * @param location - Optional location filter
   * @returns Appropriate time entry for display
   */
  getTodayOrNextDaySchedule(location?: string | null): Promise<TimeEntry | null>;

  /**
   * Get schedule display data
   * Returns both today's and tomorrow's schedules with status flags
   * @param location - Optional location filter
   * @returns Schedule display data
   */
  getScheduleDisplayData(location?: string | null): Promise<ScheduleDisplayData>;
}
