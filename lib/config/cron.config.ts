/**
 * Cron Job Configuration
 * Configuration for automated prayer time updates
 */

/**
 * Cron schedule configuration
 * Supports standard cron expression format: * * * * *
 * Format: minute hour day-of-month month day-of-week
 */
export interface CronSchedule {
  expression: string;
  description: string;
  timezone: string;
}

/**
 * Predefined cron schedules
 */
export const CRON_SCHEDULES = {
  /**
   * Run daily at 2:00 AM
   * Good for checking for updates without high load
   */
  DAILY_2AM: {
    expression: '0 2 * * *',
    description: 'Run daily at 2:00 AM',
    timezone: 'Asia/Dhaka',
  },

  /**
   * Run weekly on Sunday at 3:00 AM
   * Good for weekly full updates
   */
  WEEKLY_SUNDAY_3AM: {
    expression: '0 3 * * 0',
    description: 'Run weekly on Sunday at 3:00 AM',
    timezone: 'Asia/Dhaka',
  },

  /**
   * Run monthly on the 1st at 1:00 AM
   * Good for monthly Ramadan schedule updates
   */
  MONTHLY_1ST_1AM: {
    expression: '0 1 1 * *',
    description: 'Run monthly on the 1st at 1:00 AM',
    timezone: 'Asia/Dhaka',
  },

  /**
   * Run every 6 hours
   * Good for frequent updates during Ramadan
   */
  EVERY_6_HOURS: {
    expression: '0 */6 * * *',
    description: 'Run every 6 hours',
    timezone: 'Asia/Dhaka',
  },
} as const;

/**
 * Default cron schedule (can be overridden by environment variable)
 */
export const DEFAULT_CRON_SCHEDULE = CRON_SCHEDULES.MONTHLY_1ST_1AM;

/**
 * Get cron schedule from environment or use default
 */
export function getCronSchedule(): CronSchedule {
  const scheduleExpression = process.env.CRON_SCHEDULE_EXPRESSION;
  
  if (scheduleExpression) {
    return {
      expression: scheduleExpression,
      description: 'Custom schedule from environment',
      timezone: process.env.CRON_TIMEZONE || 'Asia/Dhaka',
    };
  }

  return DEFAULT_CRON_SCHEDULE;
}

/**
 * Cron configuration for the application
 */
export const CRON_CONFIG = {
  /**
   * Enable/disable cron job
   */
  enabled: process.env.CRON_ENABLED !== 'false',

  /**
   * Cron schedule
   */
  schedule: getCronSchedule(),

  /**
   * Secret key for securing cron endpoints
   */
  secretKey: process.env.CRON_SECRET_KEY,

  /**
   * Enable notifications on cron failure
   */
  notificationsEnabled: process.env.CRON_NOTIFICATIONS_ENABLED === 'true',

  /**
   * Webhook URL for notifications
   */
  webhookUrl: process.env.CRON_WEBHOOK_URL,

  /**
   * Email recipients for notifications (comma-separated)
   */
  emailRecipients: process.env.CRON_EMAIL_RECIPIENTS?.split(','),

  /**
   * Maximum retries for API fetch failures
   */
  maxRetries: parseInt(process.env.CRON_MAX_RETRIES || '3', 10),

  /**
   * Retry delay in milliseconds
   */
  retryDelay: parseInt(process.env.CRON_RETRY_DELAY || '5000', 10),

  /**
   * Enable fallback to cached data on API failure
   */
  fallbackToCache: process.env.CRON_FALLBACK_TO_CACHE !== 'false',
} as const;

/**
 * Validate cron configuration
 */
export function validateCronConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!CRON_CONFIG.secretKey) {
    errors.push('CRON_SECRET_KEY is not configured');
  }

  if (CRON_CONFIG.notificationsEnabled && !CRON_CONFIG.webhookUrl && !CRON_CONFIG.emailRecipients) {
    errors.push('Notifications enabled but no webhook URL or email recipients configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
