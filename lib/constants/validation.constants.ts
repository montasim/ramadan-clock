/**
 * Validation-related constants
 * Centralized configuration for validation rules and constraints
 */

/**
 * File upload validation
 */
export const FILE_UPLOAD = {
  /** Maximum file size in bytes (1MB) */
  MAX_SIZE: 1024 * 1024,
  /** Maximum file size in MB (for display) */
  MAX_SIZE_MB: 1,
  /** Accepted file types */
  ACCEPTED_TYPES: ['application/json', 'text/csv'],
  /** Accepted file extensions */
  ACCEPTED_EXTENSIONS: ['.json', '.csv'],
  /** Maximum number of files */
  MAX_FILES: 1,
} as const;

/**
 * Time entry validation
 */
export const TIME_ENTRY = {
  /** Minimum time value (00:00) */
  MIN_TIME: '00:00',
  /** Maximum time value (23:59) */
  MAX_TIME: '23:59',
  /** Time format regex (HH:mm) */
  TIME_REGEX: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  /** Date format regex (YYYY-MM-DD) */
  DATE_REGEX: /^\d{4}-\d{2}-\d{2}$/,
} as const;

/**
 * Location validation
 */
export const LOCATION = {
  /** Minimum location name length */
  MIN_NAME_LENGTH: 2,
  /** Maximum location name length */
  MAX_NAME_LENGTH: 100,
  /** Location name regex (alphanumeric, spaces, hyphens) */
  NAME_REGEX: /^[a-zA-Z\s\-]+$/,
} as const;

/**
 * Pagination validation
 */
export const PAGINATION = {
  /** Default page number */
  DEFAULT_PAGE: 1,
  /** Default limit per page */
  DEFAULT_LIMIT: 20,
  /** Minimum limit per page */
  MIN_LIMIT: 1,
  /** Maximum limit per page */
  MAX_LIMIT: 100,
} as const;

/**
 * API request validation
 */
export const API_REQUEST = {
  /** Maximum query string length */
  MAX_QUERY_LENGTH: 2048,
  /** Maximum request body size */
  MAX_BODY_SIZE: '10mb',
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  /** Default rate limit window (ms) */
  DEFAULT_WINDOW_MS: 60 * 1000,
  /** Default rate limit count */
  DEFAULT_LIMIT: 30,
  /** Strict rate limit for sensitive operations */
  STRICT_WINDOW_MS: 60 * 1000,
  STRICT_LIMIT: 10,
} as const;

/**
 * External API configuration
 */
export const EXTERNAL_API = {
  /** Default request timeout (ms) */
  DEFAULT_TIMEOUT: 30000,
  /** Maximum retry attempts */
  MAX_RETRIES: 3,
  /** Initial retry delay (ms) */
  INITIAL_RETRY_DELAY: 1000,
  /** Maximum retry delay (ms) */
  MAX_RETRY_DELAY: 10000,
  /** Retry backoff multiplier */
  RETRY_BACKOFF_MULTIPLIER: 2,
  /** Retryable HTTP status codes */
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  /** File upload errors */
  FILE_TOO_LARGE: `File size exceeds maximum allowed size of ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  FILE_TYPE_NOT_SUPPORTED: 'Only JSON and CSV files are supported',
  FILE_PARSE_ERROR: 'Failed to parse file',
  
  /** Time entry errors */
  INVALID_TIME_FORMAT: 'Time must be in HH:mm format (e.g., 14:30)',
  INVALID_DATE_FORMAT: 'Date must be in YYYY-MM-DD format (e.g., 2024-03-12)',
  TIME_OUT_OF_RANGE: 'Time must be between 00:00 and 23:59',
  
  /** Location errors */
  INVALID_LOCATION_NAME: 'Location name must be 2-100 characters and contain only letters, spaces, and hyphens',
  
  /** Validation errors */
  REQUIRED_FIELD_MISSING: 'Required field is missing',
  INVALID_INPUT: 'Invalid input provided',
  
  /** API errors */
  API_REQUEST_FAILED: 'API request failed',
  API_TIMEOUT: 'API request timed out',
  API_RATE_LIMITED: 'API rate limit exceeded',
  
  /** General errors */
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
} as const;
