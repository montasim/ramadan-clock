/**
 * Update Entry Use Case
 * Application logic for updating a time entry
 */

import { ScheduleService } from '../services/schedule.service';
import { TimeEntry } from '../domain/entities/time-entry.entity';

/**
 * Update Entry Use Case
 * Encapsulates the logic for updating a time entry
 */
export class UpdateEntryUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @param id - Time entry ID
   * @param data - Data to update
   * @returns Updated time entry
   */
  async execute(
    id: string,
    data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
  ): Promise<TimeEntry> {
    return await this.scheduleService.updateTimeEntry(id, data);
  }
}
