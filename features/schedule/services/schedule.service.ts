/**
 * Schedule Service
 * Business logic for schedule-related operations
 */

import moment from 'moment';
import { TimeEntryRepository } from '../repositories/time-entry.repository';
import { UploadLogRepository } from '../repositories/upload-log.repository';
import { TimeEntry } from '../domain/entities/time-entry.entity';
import { TimeCalculatorService } from './time-calculator.service';
import type { ScheduleDisplayData } from '../domain/types/schedule-status.types';

/**
 * Schedule Service
 * Handles business logic for schedule operations
 */
export class ScheduleService {
  constructor(
    private readonly timeEntryRepository: TimeEntryRepository,
    private readonly timeCalculator: TimeCalculatorService,
    private readonly uploadLogRepository: UploadLogRepository
  ) {}

  /**
   * Get today's schedule
   * @param location - Optional location filter
   * @returns Today's time entry or null if not found
   */
  async getTodaySchedule(location?: string | null): Promise<TimeEntry | null> {
    const today = moment().format('YYYY-MM-DD');
    const dto = await this.timeEntryRepository.findByDate(today, location);
    return dto ? new TimeEntry(dto) : null;
  }

  /**
   * Get tomorrow's schedule
   * @param location - Optional location filter
   * @returns Tomorrow's time entry or null if not found
   */
  async getTomorrowSchedule(location?: string | null): Promise<TimeEntry | null> {
    const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
    const dto = await this.timeEntryRepository.findByDate(tomorrow, location);
    return dto ? new TimeEntry(dto) : null;
  }

  /**
   * Get today's or next day's schedule
   * Returns tomorrow's schedule if today's iftar has passed
   * @param location - Optional location filter
   * @returns Appropriate time entry for display
   */
  async getTodayOrNextDaySchedule(location?: string | null): Promise<TimeEntry | null> {
    const todayEntry = await this.getTodaySchedule(location);

    if (todayEntry && todayEntry.isIftarPassed()) {
      return await this.getTomorrowSchedule(location);
    }

    return todayEntry;
  }

  /**
   * Get schedule display data
   * Returns both today's and tomorrow's schedules with status flags
   * @param location - Optional location filter
   * @returns Schedule display data
   */
  async getScheduleDisplayData(location?: string | null): Promise<ScheduleDisplayData> {
    const todayEntry = await this.getTodaySchedule(location);
    const tomorrowEntry = await this.getTomorrowSchedule(location);

    return this.timeCalculator.getScheduleDisplayData(todayEntry, tomorrowEntry);
  }

  /**
   * Get full schedule
   * @param location - Optional location filter
   * @returns All time entries
   */
  async getFullSchedule(location?: string | null): Promise<TimeEntry[]> {
    const dtos = await this.timeEntryRepository.findAll(location);
    return dtos.map((dto) => new TimeEntry(dto));
  }

  /**
   * Get schedule by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param location - Optional location filter
   * @returns Time entries within the date range
   */
  async getScheduleByDateRange(
    startDate: string,
    endDate: string,
    location?: string | null
  ): Promise<TimeEntry[]> {
    const dtos = await this.timeEntryRepository.findByDateRange(startDate, endDate, location);
    return dtos.map((dto) => new TimeEntry(dto));
  }

  /**
   * Get all unique locations
   * @returns List of unique location names
   */
  async getLocations(): Promise<string[]> {
    return await this.timeEntryRepository.getLocations();
  }

  /**
   * Get statistics
   * @returns Statistics including total entries, locations, and recent uploads
   */
  async getStats() {
    const [totalEntries, locations, recentUploads] = await Promise.all([
      this.timeEntryRepository.count(),
      this.timeEntryRepository.getLocations(),
      this.uploadLogRepository.findRecent(5),
    ]);

    return {
      totalEntries,
      totalLocations: locations.length,
      recentUploads,
    };
  }

  /**
   * Get time entry by ID
   * @param id - Time entry ID
   * @returns Time entry or null if not found
   */
  async getTimeEntryById(id: string): Promise<TimeEntry | null> {
    const dto = await this.timeEntryRepository.findById(id);
    return dto ? new TimeEntry(dto) : null;
  }

  /**
   * Update time entry
   * @param id - Time entry ID
   * @param data - Data to update
   * @returns Updated time entry
   */
  async updateTimeEntry(
    id: string,
    data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
  ): Promise<TimeEntry> {
    const dto = await this.timeEntryRepository.update(id, data);
    return new TimeEntry(dto);
  }

  /**
   * Delete time entry
   * @param id - Time entry ID
   */
  async deleteTimeEntry(id: string): Promise<void> {
    await this.timeEntryRepository.delete(id);
  }
}
