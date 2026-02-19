/**
 * Get Full Schedule Use Case
 * Application logic for retrieving full schedule
 */

import { ScheduleService } from '../services/schedule.service';
import { TimeEntry } from '../domain/entities/time-entry.entity';

/**
 * Get Full Schedule Use Case
 * Encapsulates the logic for retrieving the full schedule
 */
export class GetFullScheduleUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @param location - Optional location filter
   * @returns All time entries
   */
  async execute(location?: string | null): Promise<TimeEntry[]> {
    return await this.scheduleService.getFullSchedule(location);
  }
}
