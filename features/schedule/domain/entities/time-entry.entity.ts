/**
 * Time Entry Entity
 * Domain entity representing a schedule entry
 */

import { DateVO } from '../value-objects/date.vo';
import { TimeVO } from '../value-objects/time.vo';
import { LocationVO } from '../value-objects/location.vo';

/**
 * Time Entry Data Transfer Object
 * Plain data structure for external communication
 */
export interface TimeEntryDTO {
  id: string;
  date: string;
  sehri: string;
  iftar: string;
  location: string | null;
}

/**
 * Time Entry Entity
 * Represents a schedule entry with domain logic
 */
export class TimeEntry {
  readonly id: string;
  readonly date: DateVO;
  readonly sehri: TimeVO;
  readonly iftar: TimeVO;
  readonly location: LocationVO;

  /**
   * Create a TimeEntry instance
   * @param dto - Data transfer object with raw data
   */
  constructor(dto: TimeEntryDTO) {
    this.id = dto.id;
    this.date = new DateVO(dto.date);
    this.sehri = new TimeVO(dto.sehri);
    this.iftar = new TimeVO(dto.iftar);
    this.location = new LocationVO(dto.location);
  }

  /**
   * Convert to DTO (plain object)
   * @returns TimeEntryDTO with raw values
   */
  toDTO(): TimeEntryDTO {
    return {
      id: this.id,
      date: this.date.value,
      sehri: this.sehri.value,
      iftar: this.iftar.value,
      location: this.location.value,
    };
  }

  /**
   * Convert to formatted DTO with 12-hour time format
   * @returns TimeEntryDTO with formatted times
   */
  toFormattedDTO(): TimeEntryDTO {
    return {
      id: this.id,
      date: this.date.value,
      sehri: this.sehri.to12HourFormat(),
      iftar: this.iftar.to12HourFormat(),
      location: this.location.value,
    };
  }

  /**
   * Check if sehri time has passed
   * @param referenceDate - Reference date for comparison (defaults to current date/time)
   * @returns True if sehri time has passed, false otherwise
   */
  isSehriPassed(referenceDate?: Date): boolean {
    return this.sehri.hasPassed(referenceDate);
  }

  /**
   * Check if iftar time has passed
   * @param referenceDate - Reference date for comparison (defaults to current date/time)
   * @returns True if iftar time has passed, false otherwise
   */
  isIftarPassed(referenceDate?: Date): boolean {
    return this.iftar.hasPassed(referenceDate);
  }

  /**
   * Check if this entry is in the past
   * @returns True if date is in the past, false otherwise
   */
  isPast(): boolean {
    return this.date.isPast();
  }

  /**
   * Check if this entry is for today
   * @returns True if date is today, false otherwise
   */
  isToday(): boolean {
    return this.date.isToday();
  }

  /**
   * Check if this entry is for tomorrow
   * @returns True if date is tomorrow, false otherwise
   */
  isTomorrow(): boolean {
    return this.date.isTomorrow();
  }

  /**
   * Check if this entry equals another TimeEntry
   * @param other - Another TimeEntry to compare with
   * @returns True if entries are equal, false otherwise
   */
  equals(other: TimeEntry): boolean {
    return this.id === other.id;
  }

  /**
   * Create TimeEntry from DTO
   * @param dto - Data transfer object
   * @returns New TimeEntry instance
   */
  static fromDTO(dto: TimeEntryDTO): TimeEntry {
    return new TimeEntry(dto);
  }

  /**
   * Create array of TimeEntry from DTO array
   * @param dtos - Array of data transfer objects
   * @returns Array of TimeEntry instances
   */
  static fromDTOArray(dtos: TimeEntryDTO[]): TimeEntry[] {
    return dtos.map((dto) => TimeEntry.fromDTO(dto));
  }
}
