/**
 * Delete Entry Use Case
 * Application logic for deleting a time entry
 */

import { ScheduleService } from '../services/schedule.service';

/**
 * Delete Entry Use Case
 * Encapsulates the logic for deleting a time entry
 */
export class DeleteEntryUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @param id - Time entry ID
   */
  async execute(id: string): Promise<void> {
    await this.scheduleService.deleteTimeEntry(id);
  }
}
