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
  maxRows: 1000,
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
