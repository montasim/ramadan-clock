/**
 * Date Value Object
 * Encapsulates date validation and logic
 */

import { formatDate, isToday, isTomorrow, isPast } from '@/lib/utils/date.utils';

/**
 * Date Value Object
 * Represents a date in YYYY-MM-DD format with validation
 */
export class DateVO {
  private readonly _value: string;

  /**
   * Create a DateVO instance
   * @param value - Date string in YYYY-MM-DD format
   * @throws Error if date format is invalid
   */
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    this._value = value;
  }

  /**
   * Validate date format
   * @param value - Date string to validate
   * @returns True if valid, false otherwise
   */
  private isValid(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  /**
   * Get the date value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Convert to Date object
   */
  toDate(): Date {
    return new Date(this._value);
  }

  /**
   * Check if this date equals another DateVO
   */
  equals(other: DateVO): boolean {
    return this._value === other._value;
  }

  /**
   * Check if this date is today
   */
  isToday(): boolean {
    return isToday(this.toDate());
  }

  /**
   * Check if this date is tomorrow
   */
  isTomorrow(): boolean {
    return isTomorrow(this.toDate());
  }

  /**
   * Check if this date is in the past
   */
  isPast(): boolean {
    return isPast(this.toDate());
  }

  /**
   * Format date for display
   */
  toDisplayFormat(): string {
    return formatDate(this.toDate(), 'display');
  }

  /**
   * Format date in short format
   */
  toShortFormat(): string {
    return formatDate(this.toDate(), 'short');
  }

  /**
   * Create DateVO from Date object
   */
  static fromDate(date: Date): DateVO {
    return new DateVO(formatDate(date, 'iso'));
  }

  /**
   * Create DateVO for today
   */
  static today(): DateVO {
    return DateVO.fromDate(new Date());
  }

  /**
   * Create DateVO for tomorrow
   */
  static tomorrow(): DateVO {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return DateVO.fromDate(tomorrow);
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
