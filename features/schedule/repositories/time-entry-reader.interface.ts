/**
 * Time Entry Reader Interface
 * Read-only operations for time entries
 * Part of Interface Segregation Principle (ISP)
 */

import type { TimeEntryDTO } from '../domain/entities/time-entry.entity';

/**
 * Time Entry Reader Interface
 * Defines read-only operations for time entries
 */
export interface ITimeEntryReader {
  /**
   * Find a time entry by date and optional location
   */
  findByDate(date: string, location?: string | null): Promise<TimeEntryDTO | null>;

  /**
   * Find time entries within a date range
   */
  findByDateRange(
    startDate: string,
    endDate: string,
    location?: string | null
  ): Promise<TimeEntryDTO[]>;

  /**
   * Find all time entries, optionally filtered by location
   */
  findAll(location?: string | null): Promise<TimeEntryDTO[]>;

  /**
   * Find a time entry by ID
   */
  findById(id: string): Promise<TimeEntryDTO | null>;

  /**
   * Get all unique locations from time entries
   */
  getLocations(): Promise<string[]>;

  /**
   * Count all time entries
   */
  count(): Promise<number>;
}
