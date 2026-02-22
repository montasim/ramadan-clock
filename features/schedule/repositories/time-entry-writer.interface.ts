/**
 * Time Entry Writer Interface
 * Write-only operations for time entries
 * Part of Interface Segregation Principle (ISP)
 */

import type { TimeEntryDTO } from '../domain/entities/time-entry.entity';

/**
 * Time Entry Writer Interface
 * Defines write-only operations for time entries
 */
export interface ITimeEntryWriter {
  /**
   * Create a new time entry
   */
  create(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;

  /**
   * Update an existing time entry
   */
  update(id: string, data: Partial<Omit<TimeEntryDTO, 'id'>>): Promise<TimeEntryDTO>;

  /**
   * Delete a time entry by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Upsert a time entry (create or update)
   */
  upsert(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;

  /**
   * Bulk delete time entries
   */
  deleteMany(ids: string[]): Promise<{ count: number }>;
}
