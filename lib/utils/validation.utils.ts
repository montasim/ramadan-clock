/**
 * Validation Utility Functions
 * Helper functions for validating various data types
 */

import {
  TIME_ENTRY,
  LOCATION,
  FILE_UPLOAD,
  PAGINATION,
  ERROR_MESSAGES,
} from '@/lib/constants';

/**
 * Validate time format (HH:mm)
 * @param time - Time string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTime(time: string): boolean {
  return TIME_ENTRY.TIME_REGEX.test(time);
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param date - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(date: string): boolean {
  return TIME_ENTRY.DATE_REGEX.test(date);
}

/**
 * Validate time is within valid range (00:00 - 23:59)
 * @param time - Time string to validate
 * @returns True if within range, false otherwise
 */
export function isTimeInRange(time: string): boolean {
  if (!isValidTime(time)) return false;
  const [hours, minutes] = time.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Validate location name
 * @param name - Location name to validate
 * @returns True if valid, false otherwise
 */
export function isValidLocationName(name: string): boolean {
  if (!name || name.length < LOCATION.MIN_NAME_LENGTH || name.length > LOCATION.MAX_NAME_LENGTH) {
    return false;
  }
  return LOCATION.NAME_REGEX.test(name);
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @returns True if within limit, false otherwise
 */
export function isValidFileSize(size: number): boolean {
  return size <= FILE_UPLOAD.MAX_SIZE;
}

/**
 * Validate file type
 * @param type - MIME type of the file
 * @returns True if accepted, false otherwise
 */
export function isValidFileType(type: string): boolean {
  return FILE_UPLOAD.ACCEPTED_TYPES.includes(type as 'application/json' | 'text/csv');
}

/**
 * Validate file extension
 * @param filename - Name of the file
 * @returns True if accepted, false otherwise
 */
export function isValidFileExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return FILE_UPLOAD.ACCEPTED_EXTENSIONS.includes(extension as '.json' | '.csv');
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate string is not empty or whitespace only
 * @param str - String to validate
 * @returns True if not empty, false otherwise
 */
export function isNotEmpty(str: string | null | undefined): boolean {
  return str !== null && str !== undefined && str.trim().length > 0;
}

/**
 * Validate number is positive
 * @param num - Number to validate
 * @returns True if positive, false otherwise
 */
export function isPositive(num: number): boolean {
  return num > 0;
}

/**
 * Validate number is non-negative
 * @param num - Number to validate
 * @returns True if non-negative, false otherwise
 */
export function isNonNegative(num: number): boolean {
  return num >= 0;
}

/**
 * Validate number is within range
 * @param num - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range, false otherwise
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Validate array is not empty
 * @param arr - Array to validate
 * @returns True if not empty, false otherwise
 */
export function isNotEmptyArray<T>(arr: T[] | null | undefined): boolean {
  return arr !== null && arr !== undefined && arr.length > 0;
}

/**
 * Validate object is not empty
 * @param obj - Object to validate
 * @returns True if not empty, false otherwise
 */
export function isNotEmptyObject(obj: object | null | undefined): boolean {
  return obj !== null && obj !== undefined && Object.keys(obj).length > 0;
}

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param limit - Limit per page
 * @returns True if valid, false otherwise
 */
export function isValidPagination(page: number, limit: number): boolean {
  return (
    isPositive(page) &&
    isInRange(limit, PAGINATION.MIN_LIMIT, PAGINATION.MAX_LIMIT)
  );
}

/**
 * Get validation error message for time
 * @param time - Time string that failed validation
 * @returns Error message
 */
export function getTimeValidationError(time: string): string {
  if (!isValidTime(time)) {
    return ERROR_MESSAGES.INVALID_TIME_FORMAT;
  }
  if (!isTimeInRange(time)) {
    return ERROR_MESSAGES.TIME_OUT_OF_RANGE;
  }
  return ERROR_MESSAGES.INVALID_INPUT;
}

/**
 * Get validation error message for date
 * @param date - Date string that failed validation
 * @returns Error message
 */
export function getDateValidationError(date: string): string {
  if (!isValidDate(date)) {
    return ERROR_MESSAGES.INVALID_DATE_FORMAT;
  }
  return ERROR_MESSAGES.INVALID_INPUT;
}

/**
 * Get validation error message for location
 * @param name - Location name that failed validation
 * @returns Error message
 */
export function getLocationValidationError(name: string): string {
  if (!isValidLocationName(name)) {
    return ERROR_MESSAGES.INVALID_LOCATION_NAME;
  }
  return ERROR_MESSAGES.INVALID_INPUT;
}

/**
 * Get validation error message for file
 * @param file - File object that failed validation
 * @returns Error message
 */
export function getFileValidationError(file: File): string {
  if (!isValidFileSize(file.size)) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  if (!isValidFileType(file.type) && !isValidFileExtension(file.name)) {
    return ERROR_MESSAGES.FILE_TYPE_NOT_SUPPORTED;
  }
  return ERROR_MESSAGES.INVALID_INPUT;
}

/**
 * Validate time entry data
 * @param data - Time entry data to validate
 * @returns Object with isValid flag and errors array
 */
export function validateTimeEntry(data: {
  date?: string;
  sehri?: string;
  iftar?: string;
  location?: string | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.date && !isValidDate(data.date)) {
    errors.push(getDateValidationError(data.date));
  }

  if (data.sehri && !isValidTime(data.sehri)) {
    errors.push(`Sehri: ${getTimeValidationError(data.sehri)}`);
  }

  if (data.iftar && !isValidTime(data.iftar)) {
    errors.push(`Iftar: ${getTimeValidationError(data.iftar)}`);
  }

  if (data.location && !isValidLocationName(data.location)) {
    errors.push(`Location: ${getLocationValidationError(data.location)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
