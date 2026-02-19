/**
 * Get Schedule Display Data Use Case
 * Application logic for retrieving schedule display data
 */

import { ScheduleService } from '../services/schedule.service';
import type { ScheduleDisplayData } from '../domain/types/schedule-status.types';

/**
 * Get Schedule Display Data Use Case
 * Encapsulates the logic for retrieving schedule display data
 */
export class GetScheduleDisplayDataUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @param location - Optional location filter
   * @returns Schedule display data with today's and tomorrow's entries
   */
  async execute(location?: string | null): Promise<ScheduleDisplayData> {
    return await this.scheduleService.getScheduleDisplayData(location);
  }
}
