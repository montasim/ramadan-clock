/**
 * Time-related constants
 * Centralized configuration for time formatting, adjustments, and calculations
 */

/**
 * Time format constants for moment.js
 */
export const TIME_FORMATS = {
  /** 24-hour format: HH:mm (e.g., "14:30") */
  HOUR_24: 'HH:mm',
  /** 12-hour format: h:mm A (e.g., "2:30 PM") */
  HOUR_12: 'h:mm A',
  /** ISO date format: YYYY-MM-DD (e.g., "2024-03-12") */
  DATE_ISO: 'YYYY-MM-DD',
  /** Display date format: dddd, MMMM D, YYYY (e.g., "Tuesday, March 12, 2024") */
  DATE_DISPLAY: 'dddd, MMMM D, YYYY',
  /** Simple date format: MMM D, YYYY (e.g., "Mar 12, 2024") */
  DATE_SIMPLE: 'MMM D, YYYY',
} as const;

/**
 * Time adjustment constants for prayer times
 * Values in minutes to add/subtract from API responses
 */
export const TIME_ADJUSTMENTS = {
  /** Default Sehri time adjustment (minutes) */
  DEFAULT_SEHRI: 0,
  /** Default Iftar time adjustment (minutes) */
  DEFAULT_IFTAR: 0,
} as const;

/**
 * Time comparison thresholds
 */
export const TIME_THRESHOLDS = {
  /** Threshold in milliseconds to consider times as equal */
  EQUALITY_THRESHOLD_MS: 1000,
} as const;

/**
 * Time zone constants
 */
export const TIMEZONE = {
  /** Default application timezone */
  DEFAULT: 'Asia/Dhaka',
} as const;

/**
 * Prayer time calculation methods (Aladhan API)
 * Reference: https://aladhan.com/prayer-times-api
 */
export const PRAYER_CALCULATION_METHODS = {
  /** Islamic Society of North America (ISNA) */
  ISNA: 2,
  /** Muslim World League (MWL) */
  MWL: 3,
  /** Egyptian General Authority of Survey */
  EGYPT: 5,
  /** Umm Al-Qura University, Makkah */
  MAKKAH: 4,
  /** University of Islamic Sciences, Karachi */
  KARACHI: 1,
  /** Institute of Geophysics, University of Tehran */
  TEHRAN: 7,
  /** Shia Ithna-Ashari, Leva Institute, Qum */
  JAFARI: 0,
} as const;

/**
 * Prayer time school (Madhab) constants
 */
export const PRAYER_SCHOOL = {
  /** Shafi (standard) */
  SHAFI: 0,
  /** Hanafi (Asr prayer is later) */
  HANAFI: 1,
} as const;
