/**
 * Date Utilities
 * Helper functions for date manipulation and comparison
 */

/**
 * Date format options
 */
export type DateFormat = 'iso' | 'display' | 'short' | 'long';

/**
 * Format date according to specified format
 * @param date - Date to format
 * @param format - Format type
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: DateFormat = 'iso'): string {
  switch (format) {
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'display':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
  }
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if the date is today, false otherwise
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is tomorrow
 * @param date - Date to check
 * @returns True if the date is tomorrow, false otherwise
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past, false otherwise
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if the date is in the future, false otherwise
 */
export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
}

/**
 * Add days to a date
 * @param date - Original date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 * @param date - Original date
 * @param days - Number of days to subtract
 * @returns New date with days subtracted
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get the start of day (00:00:00)
 * @param date - Date to get start of day for
 * @returns New date set to start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of day (23:59:59.999)
 * @param date - Date to get end of day for
 * @returns New date set to end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Compare two dates and return the difference in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates (positive if date2 is after date1)
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffMs = date2.getTime() - date1.getTime();
  return Math.round(diffMs / oneDay);
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Parse date string in YYYY-MM-DD format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object
 * @throws Error if date string is invalid
 */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date format: ${dateStr}. Year, month, and day must be numbers`);
  }

  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}

/**
 * Validate date string format
 * @param dateStr - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateStr: string): boolean {
  try {
    parseDate(dateStr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns Today's date string
 */
export function getToday(): string {
  return formatDate(new Date(), 'iso');
}

/**
 * Get tomorrow's date in ISO format (YYYY-MM-DD)
 * @returns Tomorrow's date string
 */
export function getTomorrow(): string {
  return formatDate(addDays(new Date(), 1), 'iso');
}
