/**
 * Date Utility Functions
 * Helper functions for date-related operations
 */

import moment from 'moment-timezone';
import { TIMEZONE, TIME_FORMATS } from '@/lib/constants';

/**
 * Get current date in the application timezone
 * @returns Current moment object in app timezone
 */
export function getCurrentMoment(): moment.Moment {
  return moment().tz(TIMEZONE.DEFAULT);
}

/**
 * Format date to ISO format (YYYY-MM-DD)
 * @param date - Date object or string
 * @returns Date string in ISO format
 */
export function formatDateISO(date: Date | string | moment.Moment): string {
  return moment(date).format(TIME_FORMATS.DATE_ISO);
}

/**
 * Format date for display (e.g., "Tuesday, March 12, 2024")
 * @param date - Date object or string
 * @param timezone - Optional timezone (defaults to app timezone)
 * @returns Formatted date string
 */
export function formatDateDisplay(date: Date | string | moment.Moment, timezone?: string): string {
  const tz = timezone || TIMEZONE.DEFAULT;
  return moment(date).tz(tz).format(TIME_FORMATS.DATE_DISPLAY);
}

/**
 * Format date simply (e.g., "Mar 12, 2024")
 * @param date - Date object or string
 * @param timezone - Optional timezone (defaults to app timezone)
 * @returns Formatted date string
 */
export function formatDateSimple(date: Date | string | moment.Moment, timezone?: string): string {
  const tz = timezone || TIMEZONE.DEFAULT;
  return moment(date).tz(tz).format(TIME_FORMATS.DATE_SIMPLE);
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today, false otherwise
 */
export function isToday(date: Date | string | moment.Moment): boolean {
  return moment(date).isSame(getCurrentMoment(), 'day');
}

/**
 * Check if a date is tomorrow
 * @param date - Date to check
 * @returns True if date is tomorrow, false otherwise
 */
export function isTomorrow(date: Date | string | moment.Moment): boolean {
  return moment(date).isSame(getCurrentMoment().add(1, 'day'), 'day');
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past, false otherwise
 */
export function isPast(date: Date | string | moment.Moment): boolean {
  return moment(date).startOf('day').isBefore(getCurrentMoment().startOf('day'));
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future, false otherwise
 */
export function isFuture(date: Date | string | moment.Moment): boolean {
  return moment(date).startOf('day').isAfter(getCurrentMoment().startOf('day'));
}

/**
 * Check if a date is within a date range (inclusive)
 * @param date - Date to check
 * @param startDate - Start date of range
 * @param endDate - End date of range
 * @returns True if date is within range, false otherwise
 */
export function isDateInRange(
  date: Date | string | moment.Moment,
  startDate: Date | string | moment.Moment,
  endDate: Date | string | moment.Moment
): boolean {
  const checkDate = moment(date).startOf('day');
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  return checkDate.isSameOrAfter(start) && checkDate.isSameOrBefore(end);
}

/**
 * Get days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between dates
 */
export function getDaysBetween(
  startDate: Date | string | moment.Moment,
  endDate: Date | string | moment.Moment
): number {
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  return end.diff(start, 'days');
}

/**
 * Add days to a date
 * @param date - Original date
 * @param days - Number of days to add (can be negative)
 * @returns New date string in ISO format
 */
export function addDays(date: Date | string | moment.Moment, days: number): string {
  return moment(date).add(days, 'days').format(TIME_FORMATS.DATE_ISO);
}

/**
 * Subtract days from a date
 * @param date - Original date
 * @param days - Number of days to subtract
 * @returns New date string in ISO format
 */
export function subtractDays(date: Date | string | moment.Moment, days: number): string {
  return addDays(date, -days);
}

/**
 * Get the start of a date range (e.g., start of month)
 * @param date - Reference date
 * @param unit - Unit to start (day, week, month, year)
 * @returns Start date in ISO format
 */
export function getStartOf(
  date: Date | string | moment.Moment,
  unit: 'day' | 'week' | 'month' | 'year'
): string {
  return moment(date).startOf(unit).format(TIME_FORMATS.DATE_ISO);
}

/**
 * Get the end of a date range (e.g., end of month)
 * @param date - Reference date
 * @param unit - Unit to end (day, week, month, year)
 * @returns End date in ISO format
 */
export function getEndOf(
  date: Date | string | moment.Moment,
  unit: 'day' | 'week' | 'month' | 'year'
): string {
  return moment(date).endOf(unit).format(TIME_FORMATS.DATE_ISO);
}

/**
 * Get date range for a period
 * @param startDate - Start date
 * @param period - Period (day, week, month, year)
 * @returns Object with start and end dates
 */
export function getDateRange(
  startDate: Date | string | moment.Moment,
  period: 'day' | 'week' | 'month' | 'year'
): { start: string; end: string } {
  const start = getStartOf(startDate, period);
  const end = getEndOf(startDate, period);
  return { start, end };
}

/**
 * Validate date string format
 * @param date - Date string to validate
 * @returns True if valid ISO date format, false otherwise
 */
export function isValidDateFormat(date: string): boolean {
  return moment(date, TIME_FORMATS.DATE_ISO, true).isValid();
}

/**
 * Get day of week
 * @param date - Date to check
 * @returns Day of week (0-6, where 0 is Sunday)
 */
export function getDayOfWeek(date: Date | string | moment.Moment): number {
  return moment(date).day();
}

/**
 * Get day name
 * @param date - Date to check
 * @returns Day name (e.g., "Monday")
 */
export function getDayName(date: Date | string | moment.Moment): string {
  return moment(date).format('dddd');
}

/**
 * Get month name
 * @param date - Date to check
 * @returns Month name (e.g., "March")
 */
export function getMonthName(date: Date | string | moment.Moment): string {
  return moment(date).format('MMMM');
}
