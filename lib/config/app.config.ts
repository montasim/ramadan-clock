/**
 * Client-Safe Application Configuration
 * This file contains configuration values that are safe to use in client-side code
 * and do not trigger environment variable validation
 */

export const APP_CONFIG = {
  name: 'Ramadan Clock',
  version: '0.1.0'
} as const;

export const UPLOAD_CONFIG = {
  maxFileSize: 1024 * 1024, // 1MB in bytes
  maxRows: 5000,
  allowedFileTypes: ['application/json', 'text/csv'] as const,
  allowedExtensions: ['.json', '.csv'] as const,
} as const;

export const TIME_CONFIG = {
  countdownThresholdMinutes: 60,
  defaultSehriTime: '04:30',
  defaultIftarTime: '18:00',
} as const;

export const PDF_CONFIG = {
  title: '🌙 Ramadan Clock',
  subtitle: 'Sehri & Iftar Schedule',
  font: 'helvetica',
  headerColor: [59, 130, 246] as [number, number, number],
  alternateRowColor: [245, 245, 245] as [number, number, number],
} as const;

export const UI_CONFIG = {
  maxPreviewRows: 10,
  maxRecentUploads: 5,
  maxErrorDisplay: 5,
} as const;

/**
 * Ramadan Configuration
 * Configure Ramadan start and end dates for filtering prayer times
 * Format: YYYY-MM-DD
 */
export const RAMADAN_CONFIG = {
  /**
   * Ramadan start date (1st of Ramadan)
   * Set this to the first day of Ramadan
   * Example: "2025-03-01" for March 1, 2025
   */
  startDate: process.env.RAMADAN_START_DATE,

  /**
   * Ramadan end date (last day of Ramadan)
   * Set this to the last day of Ramadan
   * Example: "2025-03-30" for March 30, 2025
   */
  endDate: process.env.RAMADAN_END_DATE,
} as const;
