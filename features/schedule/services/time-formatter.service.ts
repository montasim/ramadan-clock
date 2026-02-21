/**
 * Time Formatter Service
 * Handles all time formatting operations for schedule entries
 * Single Responsibility: Format time values between different representations
 */

import moment from 'moment-timezone';
import { TIME_FORMATS, TIMEZONE } from '@/lib/constants';
import type { TimeEntryDTO } from '../domain/entities/time-entry.entity';

/**
 * Formatted time entry with both 12-hour and 24-hour formats
 */
export interface FormattedTimeEntry extends TimeEntryDTO {
  /** Sehri time in 12-hour format (e.g., "4:30 AM") */
  sehri: string;
  /** Iftar time in 12-hour format (e.g., "6:15 PM") */
  iftar: string;
  /** Sehri time in 24-hour format (e.g., "04:30") */
  sehri24: string;
  /** Iftar time in 24-hour format (e.g., "18:15") */
  iftar24: string;
}

/**
 * Time Formatter Service
 * Provides methods to convert between different time formats
 */
export class TimeFormatterService {
  /**
   * Format time from 24-hour to 12-hour format
   * @param time24 - Time in 24-hour format (HH:mm)
   * @returns Time in 12-hour format (h:mm A)
   */
  formatTo12Hour(time24: string): string {
    return moment(time24, TIME_FORMATS.HOUR_24).format(TIME_FORMATS.HOUR_12);
  }

  /**
   * Format time from 12-hour to 24-hour format
   * @param time12 - Time in 12-hour format (h:mm A)
   * @returns Time in 24-hour format (HH:mm)
   */
  formatTo24Hour(time12: string): string {
    return moment(time12, TIME_FORMATS.HOUR_12).format(TIME_FORMATS.HOUR_24);
  }

  /**
   * Format a date string to display format
   * @param date - Date string (YYYY-MM-DD)
   * @param timezone - Optional timezone (defaults to app timezone)
   * @returns Formatted date string (e.g., "Tuesday, March 12, 2024")
   */
  formatDate(date: string, timezone?: string): string {
    const tz = timezone || TIMEZONE.DEFAULT;
    return moment.tz(date, tz).format(TIME_FORMATS.DATE_DISPLAY);
  }

  /**
   * Format a date string to simple format
   * @param date - Date string (YYYY-MM-DD)
   * @param timezone - Optional timezone (defaults to app timezone)
   * @returns Formatted date string (e.g., "Mar 12, 2024")
   */
  formatDateSimple(date: string, timezone?: string): string {
    const tz = timezone || TIMEZONE.DEFAULT;
    return moment.tz(date, tz).format(TIME_FORMATS.DATE_SIMPLE);
  }

  /**
   * Format a time entry for display
   * Converts 24-hour times to 12-hour format while preserving original values
   * @param entry - Time entry data transfer object
   * @returns Formatted time entry with both formats
   */
  formatEntry(entry: TimeEntryDTO): FormattedTimeEntry {
    return {
      ...entry,
      sehri: this.formatTo12Hour(entry.sehri),
      iftar: this.formatTo12Hour(entry.iftar),
      // Preserve original 24-hour format for editing
      sehri24: entry.sehri,
      iftar24: entry.iftar,
    };
  }

  /**
   * Format multiple time entries for display
   * @param entries - Array of time entry data transfer objects
   * @returns Array of formatted time entries
   */
  formatEntries(entries: TimeEntryDTO[]): FormattedTimeEntry[] {
    return entries.map((entry) => this.formatEntry(entry));
  }

  /**
   * Validate time format
   * Checks if a time string is in valid 24-hour format (HH:mm)
   * @param time - Time string to validate
   * @returns True if valid, false otherwise
   */
  isValidTimeFormat(time: string): boolean {
    return moment(time, TIME_FORMATS.HOUR_24, true).isValid();
  }

  /**
   * Validate date format
   * Checks if a date string is in valid ISO format (YYYY-MM-DD)
   * @param date - Date string to validate
   * @returns True if valid, false otherwise
   */
  isValidDateFormat(date: string): boolean {
    return moment(date, TIME_FORMATS.DATE_ISO, true).isValid();
  }
}

/**
 * Singleton instance of the Time Formatter Service
 */
let timeFormatterInstance: TimeFormatterService | null = null;

/**
 * Get or create the Time Formatter Service instance
 * @returns TimeFormatterService instance
 */
export function getTimeFormatterService(): TimeFormatterService {
  if (!timeFormatterInstance) {
    timeFormatterInstance = new TimeFormatterService();
  }
  return timeFormatterInstance;
}
