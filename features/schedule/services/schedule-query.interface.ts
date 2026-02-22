/**
 * Schedule Query Service Interface
 * Query operations for schedule data
 * Part of Interface Segregation Principle (ISP)
 */

import type { TimeEntry } from '../domain/entities/time-entry.entity';

/**
 * Schedule Query Service Interface
 * Defines query operations for schedules
 */
export interface IScheduleQueryService {
  /**
   * Get today's schedule
   * @param location - Optional location filter
   * @returns Today's time entry or null if not found
   */
  getTodaySchedule(location?: string | null): Promise<TimeEntry | null>;

  /**
   * Get tomorrow's schedule
   * @param location - Optional location filter
   * @returns Tomorrow's time entry or null if not found
   */
  getTomorrowSchedule(location?: string | null): Promise<TimeEntry | null>;

  /**
   * Get full schedule
   * @param location - Optional location filter
   * @returns All time entries
   */
  getFullSchedule(location?: string | null): Promise<TimeEntry[]>;

  /**
   * Get schedule by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param location - Optional location filter
   * @returns Time entries within the date range
   */
  getScheduleByDateRange(
    startDate: string,
    endDate: string,
    location?: string | null
  ): Promise<TimeEntry[]>;

  /**
   * Get all unique locations
   * @returns List of unique location names
   */
  getLocations(): Promise<string[]>;

  /**
   * Get statistics
   * @returns Statistics including total entries, locations, and recent uploads
   */
  getStats(): Promise<{
    totalEntries: number;
    totalLocations: number;
    recentUploads: any[];
  }>;
}
