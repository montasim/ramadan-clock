/**
 * Time Utility Functions
 * Helper functions for time-related operations
 */

import moment from 'moment-timezone';
import { TIMEZONE, TIME_FORMATS, TIME_THRESHOLDS } from '@/lib/constants';

/**
 * Get current time in the application timezone
 * @returns Current moment object in app timezone
 */
export function getCurrentTime(): moment.Moment {
  return moment().tz(TIMEZONE.DEFAULT);
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns Current date string
 */
export function getCurrentDate(): string {
  return getCurrentTime().format(TIME_FORMATS.DATE_ISO);
}

/**
 * Get tomorrow's date in ISO format (YYYY-MM-DD)
 * @returns Tomorrow's date string
 */
export function getTomorrowDate(): string {
  return getCurrentTime().add(1, 'day').format(TIME_FORMATS.DATE_ISO);
}

/**
 * Check if a specific time has passed
 * @param time - Time string in HH:mm format
 * @param referenceDate - Optional reference date (defaults to current time)
 * @returns True if time has passed, false otherwise
 */
export function hasTimePassed(time: string, referenceDate?: Date): boolean {
  const now = referenceDate ? moment(referenceDate) : getCurrentTime();
  const targetTime = moment.tz(time, TIME_FORMATS.HOUR_24, TIMEZONE.DEFAULT);
  targetTime.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });
  return now.isSameOrAfter(targetTime);
}

/**
 * Check if a specific time is in the future
 * @param time - Time string in HH:mm format
 * @param referenceDate - Optional reference date (defaults to current time)
 * @returns True if time is in the future, false otherwise
 */
export function isTimeInFuture(time: string, referenceDate?: Date): boolean {
  return !hasTimePassed(time, referenceDate);
}

/**
 * Calculate time difference between two times in the same day
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Difference in minutes
 */
export function getTimeDifference(startTime: string, endTime: string): number {
  const start = moment(startTime, TIME_FORMATS.HOUR_24);
  const end = moment(endTime, TIME_FORMATS.HOUR_24);
  return end.diff(start, 'minutes');
}

/**
 * Check if two times are approximately equal (within threshold)
 * @param time1 - First time in HH:mm format
 * @param time2 - Second time in HH:mm format
 * @param thresholdMs - Threshold in milliseconds (defaults to TIME_THRESHOLDS.EQUALITY_THRESHOLD_MS)
 * @returns True if times are approximately equal, false otherwise
 */
export function areTimesEqual(
  time1: string,
  time2: string,
  thresholdMs: number = TIME_THRESHOLDS.EQUALITY_THRESHOLD_MS
): boolean {
  const t1 = moment(time1, TIME_FORMATS.HOUR_24);
  const t2 = moment(time2, TIME_FORMATS.HOUR_24);
  return Math.abs(t1.diff(t2)) <= thresholdMs;
}

/**
 * Add minutes to a time string
 * @param time - Time string in HH:mm format
 * @param minutes - Minutes to add (can be negative)
 * @returns New time string in HH:mm format
 */
export function addMinutesToTime(time: string, minutes: number): string {
  return moment(time, TIME_FORMATS.HOUR_24).add(minutes, 'minutes').format(TIME_FORMATS.HOUR_24);
}

/**
 * Subtract minutes from a time string
 * @param time - Time string in HH:mm format
 * @param minutes - Minutes to subtract
 * @returns New time string in HH:mm format
 */
export function subtractMinutesFromTime(time: string, minutes: number): string {
  return addMinutesToTime(time, -minutes);
}

/**
 * Parse time string to hours and minutes
 * @param time - Time string in HH:mm format
 * @returns Object with hours and minutes
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const parsed = moment(time, TIME_FORMATS.HOUR_24);
  return {
    hours: parsed.hours(),
    minutes: parsed.minutes(),
  };
}

/**
 * Format hours and minutes to time string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Time string in HH:mm format
 */
export function formatTime(hours: number, minutes: number): string {
  return moment()
    .set({ hours, minutes, seconds: 0, milliseconds: 0 })
    .format(TIME_FORMATS.HOUR_24);
}

/**
 * Get time period (morning, afternoon, evening, night)
 * @param time - Time string in HH:mm format
 * @returns Time period string
 */
export function getTimePeriod(time: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = parseTime(time).hours;
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
