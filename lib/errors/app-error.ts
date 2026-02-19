/**
 * Application Error Handling System
 * Custom error classes for better error management and type safety
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export abstract class AppError extends Error {
  /**
   * HTTP status code for the error
   */
  abstract readonly statusCode: number;

  /**
   * Whether this error is operational (expected) or programming error
   */
  abstract readonly isOperational: boolean;

  /**
   * The underlying cause of this error
   */
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to a JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      cause: this.cause?.message,
    };
  }
}

/**
 * Database operation error
 * Thrown when database operations fail
 */
export class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string = 'Database operation failed', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Validation error
 * Thrown when input validation fails
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  /**
   * The field that failed validation (optional)
   */
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

/**
 * Not found error
 * Thrown when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} (${identifier}) not found`
      : `${resource} not found`;
    super(message);
  }
}

/**
 * Unauthorized error
 * Thrown when authentication/authorization fails
 */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

/**
 * Forbidden error
 * Thrown when user doesn't have permission
 */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message: string = 'Access forbidden') {
    super(message);
  }
}

/**
 * Conflict error
 * Thrown when a resource already exists or conflicts with existing data
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
  }
}

/**
 * File upload error
 * Thrown when file upload validation fails
 */
export class FileUploadError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to an AppError
 * If it's already an AppError, return it
 * Otherwise, wrap it in a generic AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message, error);
  }

  return new DatabaseError(String(error));
}
