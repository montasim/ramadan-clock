/**
 * API Utilities
 * Exports all API-related utilities and middleware
 */

// Response utilities
export {
  success,
  paginated,
  error,
  fromAppError,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  conflict,
  rateLimitExceeded,
  internalError,
  badRequest,
  generateRequestId,
  type ApiResponse,
  type PaginationMeta,
  type PaginatedResponse,
} from './api-response';

// Middleware
export {
  withRequestId,
  withRateLimit,
  withAuth,
  withValidation,
  withErrorHandler,
  withLogging,
  compose,
  createHandler,
  type NextHandler,
  type MiddlewareOptions,
  type RateLimitOptions,
  type AuthOptions,
} from './middleware';

// Rate limiter
export {
  RateLimiter,
  getGlobalRateLimiter,
  resetGlobalRateLimiter,
  type RateLimitResult,
} from './rate-limiter';

// External API client
export {
  ExternalApiClient,
  getGlobalApiClient,
  resetGlobalApiClient,
  fetchExternalJson,
  fetchExternalJsonCached,
  type RequestOptions,
  type RetryOptions,
  type CacheOptions,
} from './external-api-client';

// Security headers
export {
  setSecurityHeaders,
  setCorsHeaders,
  handleCorsPreflight,
  createSecureResponse,
  getClientIp,
  getUserAgent,
  sanitizeInput,
  sanitizeUrl,
  type CorsOptions,
} from './security-headers';
