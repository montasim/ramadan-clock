/**
 * Logging System
 * Centralized logging with different log levels
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  error?: Error;
}

/**
 * Logger class for application-wide logging
 * In production, this can be extended to send logs to external services
 */
class Logger {
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;
  private readonly isTest: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  /**
   * Format log entry for console output
   */
  private format(entry: LogEntry): string {
    const { level, message, context, error } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? `\n${error.stack}` : '';
    return `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      error,
    };

    if (this.isDevelopment || this.isTest) {
      // In development/test, log to console with colors
      this.logToConsole(entry);
    } else if (this.isProduction) {
      // In production, send to external logging service
      this.logToService(entry);
    }
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, error } = entry;
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
    const errorStr = error ? `\nError: ${error.message}\n${error.stack}` : '';

    switch (level) {
      case 'error':
        console.error(`\x1b[31m[ERROR]\x1b[0m ${message}${contextStr}${errorStr}`);
        break;
      case 'warn':
        console.warn(`\x1b[33m[WARN]\x1b[0m ${message}${contextStr}`);
        break;
      case 'info':
        console.info(`\x1b[36m[INFO]\x1b[0m ${message}${contextStr}`);
        break;
      case 'debug':
        console.debug(`\x1b[90m[DEBUG]\x1b[0m ${message}${contextStr}`);
        break;
    }
  }

  /**
   * Log to external service (placeholder for production)
   * This can be extended to integrate with services like Sentry, Datadog, etc.
   */
  private logToService(entry: LogEntry): void {
    // TODO: Integrate with external logging service
    // Example: Sentry.captureException(entry.error, { extra: entry.context });
    // Example: DatadogLogger.log(entry);
    console.log(this.format(entry));
  }

  /**
   * Log error level message
   */
  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log info level message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Create a child logger with additional context
   */
  child(defaultContext: Record<string, unknown>): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level, message, context, error) => {
      originalLog(level, message, { ...defaultContext, ...context }, error);
    };

    return childLogger;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with a specific context prefix
 */
export function createLogger(context: string): Logger {
  return logger.child({ context });
}
