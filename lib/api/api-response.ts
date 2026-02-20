/**
 * API Response Utilities
 * Standardized response helpers for consistent API responses
 */

import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a successful API response
 */
export function success<T>(
  data: T,
  status: number = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a paginated API response
 */
export function paginated<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200,
  requestId?: string
): NextResponse<PaginatedResponse<T>> {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    meta: {
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function error(
  statusCode: number,
  code: string,
  message: string,
  details?: any,
  requestId?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Convert an AppError to an API error response
 */
export function fromAppError(
  appError: AppError,
  requestId?: string
): NextResponse<ApiResponse> {
  return error(
    appError.statusCode,
    appError.constructor.name,
    appError.message,
    appError.toJSON(),
    requestId
  );
}

/**
 * Create a validation error response
 */
export function validationError(
  message: string,
  field?: string,
  details?: any,
  requestId?: string
): NextResponse<ApiResponse> {
  return error(
    400,
    'ValidationError',
    message,
    {
      field,
      ...details,
    },
    requestId
  );
}

/**
 * Create a not found error response
 */
export function notFound(
  resource: string,
  identifier?: string,
  requestId?: string
): NextResponse<ApiResponse> {
  const message = identifier
    ? `${resource} (${identifier}) not found`
    : `${resource} not found`;

  return error(404, 'NotFoundError', message, { resource, identifier }, requestId);
}

/**
 * Create an unauthorized error response
 */
export function unauthorized(
  message: string = 'Unauthorized access',
  requestId?: string
): NextResponse<ApiResponse> {
  return error(401, 'UnauthorizedError', message, undefined, requestId);
}

/**
 * Create a forbidden error response
 */
export function forbidden(
  message: string = 'Access forbidden',
  requestId?: string
): NextResponse<ApiResponse> {
  return error(403, 'ForbiddenError', message, undefined, requestId);
}

/**
 * Create a conflict error response
 */
export function conflict(
  message: string = 'Resource conflict',
  requestId?: string
): NextResponse<ApiResponse> {
  return error(409, 'ConflictError', message, undefined, requestId);
}

/**
 * Create a rate limit exceeded error response
 */
export function rateLimitExceeded(
  retryAfter?: number,
  requestId?: string
): NextResponse<ApiResponse> {
  const response = error(
    429,
    'RateLimitExceeded',
    'Rate limit exceeded. Please try again later.',
    { retryAfter },
    requestId
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Create an internal server error response
 */
export function internalError(
  message: string = 'An unexpected error occurred',
  requestId?: string
): NextResponse<ApiResponse> {
  return error(500, 'InternalServerError', message, undefined, requestId);
}

/**
 * Create a bad request error response
 */
export function badRequest(
  message: string = 'Bad request',
  details?: any,
  requestId?: string
): NextResponse<ApiResponse> {
  return error(400, 'BadRequest', message, details, requestId);
}
