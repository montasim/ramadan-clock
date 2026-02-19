/**
 * Get Locations Use Case
 * Application logic for retrieving all locations
 */

import { ScheduleService } from '../services/schedule.service';

/**
 * Get Locations Use Case
 * Encapsulates the logic for retrieving all unique locations
 */
export class GetLocationsUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Execute the use case
   * @returns List of unique location names
   */
  async execute(): Promise<string[]> {
    return await this.scheduleService.getLocations();
  }
}
