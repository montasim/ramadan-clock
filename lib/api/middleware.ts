/**
 * API Middleware
 * Reusable middleware functions for API routes
 */

import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { z } from 'zod/v4';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { AppError, ValidationError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { generateRequestId, error, rateLimitExceeded } from './api-response';
import { RateLimiter } from './rate-limiter';

// Initialize rate limiter
const rateLimiter = new RateLimiter();

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  requestId?: boolean;
  logging?: boolean;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}

/**
 * Authentication options
 */
export interface AuthOptions {
  requireAdmin?: boolean;
}

/**
 * Handler function type
 */
export type NextHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Add request ID to request and response
 */
export function withRequestId(handler: NextHandler): NextHandler {
  return async (request: NextRequest, context) => {
    const requestId = request.headers.get('x-request-id') || generateRequestId();
    
    // Clone request to add request ID
    const requestWithId = new Request(request.url, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'x-request-id': requestId,
      },
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    });

    // Create a new NextRequest with the modified headers
    const modifiedRequest = new NextRequest(requestWithId);

    // Call the handler
    const response = await handler(modifiedRequest, context);

    // Add request ID to response headers
    response.headers.set('x-request-id', requestId);

    return response;
  };
}

/**
 * Add rate limiting to handler
 */
export function withRateLimit(
  handler: NextHandler,
  options: RateLimitOptions
): NextHandler {
  return async (request: NextRequest, context) => {
    // Get identifier (IP address or user ID if authenticated)
    const identifier = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 
                       'anonymous';
    
    const key = `${options.keyPrefix || 'api'}:${identifier}`;

    try {
      const result = await rateLimiter.checkLimit(key, options.limit, options.windowMs);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
        return rateLimitExceeded(retryAfter);
      }

      // Add rate limit headers to response
      const response = await handler(request, context);
      response.headers.set('X-RateLimit-Limit', options.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

      return response;
    } catch (err) {
      logger.error('Rate limit check failed', { key, options }, err as Error);
      // If rate limiting fails, allow the request to proceed
      return handler(request, context);
    }
  };
}

/**
 * Add authentication to handler
 */
export function withAuth(handler: NextHandler, options?: AuthOptions): NextHandler {
  return async (request: NextRequest, context) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return error(
          401,
          'UnauthorizedError',
          'Authentication required'
        );
      }

      // Check for admin role if required
      if (options?.requireAdmin) {
        // @ts-ignore - session.user may have isAdmin property
        if (!session.user?.isAdmin) {
          return error(
            403,
            'ForbiddenError',
            'Admin access required'
          );
        }
      }

      // Add session to request headers for downstream use
      const userId = (session.user as any)?.id || '';
      const userEmail = session.user?.email || '';
      const isAdmin = (session.user as any)?.isAdmin?.toString() || 'false';
      
      const requestWithSession = new Request(request.url, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'x-session-id': userId,
          'x-session-email': userEmail,
          'x-session-admin': isAdmin,
        },
        body: request.body,
        // @ts-ignore
        duplex: 'half',
      });

      const modifiedRequest = new NextRequest(requestWithSession);
      return await handler(modifiedRequest, context);
    } catch (err) {
      logger.error('Authentication check failed', {}, err as Error);
      return error(
        500,
        'InternalServerError',
        'Authentication check failed'
      );
    }
  };
}

/**
 * Add input validation to handler using Zod schema
 */
export function withValidation<T>(
  handler: NextHandler,
  schema: z.ZodSchema<T>,
  source: 'query' | 'body' | 'both' = 'query'
): NextHandler {
  return async (request: NextRequest, context) => {
    try {
      const requestId = request.headers.get('x-request-id');

      if (source === 'query' || source === 'both') {
        const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        schema.parse(queryParams);
      }

      if (source === 'body' || source === 'both') {
        const body = await request.json().catch(() => ({}));
        schema.parse(body);
      }

      return await handler(request, context);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const requestId = request.headers.get('x-request-id');
        const errors = err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));

        return error(
          400,
          'ValidationError',
          'Invalid input parameters',
          { errors },
          requestId || undefined
        );
      }

      logger.error('Validation failed unexpectedly', {}, err as Error);
      return error(
        500,
        'InternalServerError',
        'Validation check failed'
      );
    }
  };
}

/**
 * Add error handling to handler
 */
export function withErrorHandler(handler: NextHandler): NextHandler {
  return async (request: NextRequest, context) => {
    const requestId = request.headers.get('x-request-id');
    const startTime = Date.now();

    try {
      const response = await handler(request, context);
      
      // Add response time header
      const duration = Date.now() - startTime;
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (err) {
      const duration = Date.now() - startTime;

      // Log the error
      logger.error('API request failed', {
        method: request.method,
        url: request.url,
        requestId,
        duration,
      }, err as Error);

      // Handle AppError instances
      if (err instanceof AppError) {
        return error(
          err.statusCode,
          err.constructor.name,
          err.message,
          err.toJSON(),
          requestId || undefined
        );
      }

      // Handle unknown errors
      return error(
        500,
        'InternalServerError',
        'An unexpected error occurred',
        undefined,
        requestId || undefined
      );
    }
  };
}

/**
 * Add request logging to handler
 */
export function withLogging(handler: NextHandler): NextHandler {
  return async (request: NextRequest, context) => {
    const requestId = request.headers.get('x-request-id');
    const startTime = Date.now();

    // Log incoming request
    logger.info('API request started', {
      method: request.method,
      url: request.url,
      requestId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
          request.headers.get('x-real-ip'),
    });

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Log successful response
      logger.info('API request completed', {
        method: request.method,
        url: request.url,
        requestId,
        status: response.status,
        duration,
      });

      return response;
    } catch (err) {
      const duration = Date.now() - startTime;

      // Log error
      logger.error('API request failed', {
        method: request.method,
        url: request.url,
        requestId,
        duration,
      }, err as Error);

      throw err;
    }
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: NextHandler) => NextHandler>) {
  return (handler: NextHandler): NextHandler => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Create a handler with common middleware applied
 */
export function createHandler(
  handler: NextHandler,
  options: MiddlewareOptions = {}
): NextHandler {
  const middlewares: Array<(h: NextHandler) => NextHandler> = [];

  // Add request ID middleware
  if (options.requestId !== false) {
    middlewares.push(withRequestId);
  }

  // Add error handling middleware (always last in chain)
  middlewares.push(withErrorHandler);

  // Add logging middleware
  if (options.logging !== false) {
    middlewares.push(withLogging);
  }

  // Compose and return
  return compose(...middlewares)(handler);
}
