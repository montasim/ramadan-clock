/**
 * Time Utilities
 * Helper functions for time parsing, formatting, and comparison
 */

/**
 * Parsed time object
 */
export interface ParsedTime {
  hours: number;
  minutes: number;
}

/**
 * Parse time string in HH:mm format
 * @param timeStr - Time string in 24-hour format (e.g., "14:30")
 * @returns Parsed time object with hours and minutes
 * @throws Error if time string is invalid
 */
export function parseTime(timeStr: string): ParsedTime {
  const parts = timeStr.split(':');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${timeStr}. Expected HH:mm`);
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${timeStr}. Hours and minutes must be numbers`);
  }

  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hours: ${hours}. Must be between 0 and 23`);
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Must be between 0 and 59`);
  }

  return { hours, minutes };
}

/**
 * Convert 24-hour time format to 12-hour format
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  const { hours, minutes } = parseTime(time24);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Create a Date object with the specified time
 * @param timeStr - Time string in HH:mm format
 * @param date - Reference date (defaults to current date)
 * @returns Date object with the specified time
 */
export function createTimeDate(timeStr: string, date: Date = new Date()): Date {
  const { hours, minutes } = parseTime(timeStr);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Check if a given time has passed
 * @param timeStr - Time string in HH:mm format
 * @param referenceDate - Reference date for comparison (defaults to current date/time)
 * @returns True if the time has passed, false otherwise
 */
export function hasTimePassed(timeStr: string, referenceDate: Date = new Date()): boolean {
  const targetTime = createTimeDate(timeStr, referenceDate);
  return referenceDate >= targetTime;
}

/**
 * Get the time difference in milliseconds between now and target time
 * @param timeStr - Target time string in HH:mm format
 * @param referenceDate - Reference date (defaults to current date/time)
 * @returns Time difference in milliseconds (negative if time has passed)
 */
export function getTimeDifference(timeStr: string, referenceDate: Date = new Date()): number {
  const targetTime = createTimeDate(timeStr, referenceDate);
  return targetTime.getTime() - referenceDate.getTime();
}

/**
 * Check if current time is within a threshold of target time
 * @param timeStr - Target time string in HH:mm format
 * @param thresholdMinutes - Threshold in minutes (default: 60)
 * @param referenceDate - Reference date (defaults to current date/time)
 * @returns True if within threshold, false otherwise
 */
export function isTimeWithinThreshold(
  timeStr: string,
  thresholdMinutes: number = 60,
  referenceDate: Date = new Date()
): boolean {
  const diff = getTimeDifference(timeStr, referenceDate);
  const thresholdMs = thresholdMinutes * 60 * 1000;
  return diff <= thresholdMs && diff > 0;
}

/**
 * Format time duration in milliseconds to HH:MM:SS format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Validate time string format
 * @param timeStr - Time string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTime(timeStr: string): boolean {
  try {
    parseTime(timeStr);
    return true;
  } catch {
    return false;
  }
}
