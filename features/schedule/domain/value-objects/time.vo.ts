/**
 * Time Value Object
 * Encapsulates time validation and logic
 */

import { createTimeDate, hasTimePassed, isTimeWithinThreshold } from '@/lib/utils/time.utils';

/**
 * Time Value Object
 * Represents a time in HH:mm format with validation
 */
export class TimeVO {
  private readonly _value: string;

  /**
   * Create a TimeVO instance
   * @param value - Time string in HH:mm format
   * @throws Error if time format is invalid
   */
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid time format. Expected HH:mm');
    }
    this._value = value;
  }

  /**
   * Validate time format
   * @param value - Time string to validate
   * @returns True if valid, false otherwise
   */
  private isValid(value: string): boolean {
    return /^\d{2}:\d{2}$/.test(value);
  }

  /**
   * Get the time value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Convert to 12-hour format
   * @returns Time in format like "4:30 PM"
   */
  to12HourFormat(): string {
    const [hours, minutes] = this._value.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Check if this time has passed
   * @param referenceDate - Reference date for comparison (defaults to current date/time)
   * @returns True if time has passed, false otherwise
   */
  hasPassed(referenceDate?: Date): boolean {
    return hasTimePassed(this._value, referenceDate);
  }

  /**
   * Check if current time is within threshold of this time
   * @param thresholdMinutes - Threshold in minutes (default: 60)
   * @param referenceDate - Reference date (defaults to current date/time)
   * @returns True if within threshold, false otherwise
   */
  isWithinThreshold(thresholdMinutes: number = 60, referenceDate?: Date): boolean {
    return isTimeWithinThreshold(this._value, thresholdMinutes, referenceDate);
  }

  /**
   * Convert to Date object
   * @param date - Reference date (defaults to current date)
   * @returns Date object with this time
   */
  toDate(date: Date = new Date()): Date {
    return createTimeDate(this._value, date);
  }

  /**
   * Check if this time equals another TimeVO
   */
  equals(other: TimeVO): boolean {
    return this._value === other._value;
  }

  /**
   * Get hours component
   */
  get hours(): number {
    return parseInt(this._value.split(':')[0], 10);
  }

  /**
   * Get minutes component
   */
  get minutes(): number {
    return parseInt(this._value.split(':')[1], 10);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Convert to JSON
   */
  toJSON(): string {
    return this._value;
  }
}
