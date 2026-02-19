/**
 * Get Today's Schedule Use Case
 * Application logic for retrieving today's schedule
 */

import { ScheduleService } from '../services/schedule.service';
import { TimeEntry } from '../domain/entities/time-entry.entity';

/**
 * Get Today's Schedule Use Case
 * Encapsulates the logic for retrieving today's schedule
 */
export class GetTodayScheduleUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @param location - Optional location filter
   * @returns Today's time entry or null if not found
   */
  async execute(location?: string | null): Promise<TimeEntry | null> {
    return await this.scheduleService.getTodaySchedule(location);
  }
}
