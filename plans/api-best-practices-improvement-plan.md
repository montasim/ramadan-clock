# API Best Practices Improvement Plan

## Executive Summary

This document outlines a comprehensive plan to improve the APIs in the Ramadan Clock application to follow industry best practices. The plan covers both REST API routes (`app/api/*`) and Server Actions (`actions/*`), addressing security, reliability, maintainability, and developer experience.

## Current State Analysis

### REST API Routes

| Endpoint | Purpose | Current Status |
|----------|---------|----------------|
| `/api/hadith` | Fetch random hadith | Basic implementation, minimal error handling |
| `/api/pdf` | Generate PDF schedules | No input validation, inconsistent error handling |
| `/api/auth/[...nextauth]` | Authentication | Delegates to NextAuth, acceptable |

### Server Actions

| File | Purpose | Status |
|------|---------|--------|
| `schedule.actions.new.ts` | Schedule CRUD | Refactored with clean architecture, good foundation |
| `upload.actions.new.ts` | File upload | Refactored with clean architecture, good foundation |
| `time-entries.ts` | Legacy schedule actions | Duplicate functionality, should be deprecated |

### Existing Infrastructure

- ✅ Error handling system (`lib/errors/app-error.ts`)
- ✅ Validation schemas (`lib/validations/index.ts`)
- ✅ Logger (`lib/logger/logger.ts`)
- ❌ API middleware
- ❌ Rate limiting
- ❌ Request correlation/tracing
- ❌ API documentation

## Identified Issues

### 1. REST API Issues

#### Security
- ❌ No authentication/authorization on sensitive endpoints
- ❌ No CORS configuration
- ❌ Missing security headers (CSP, X-Frame-Options, etc.)
- ❌ No input sanitization on query parameters
- ❌ No rate limiting (PDF generation could be abused)

#### Reliability
- ❌ Inconsistent error response formats
- ❌ No request ID/correlation ID for tracing
- ❌ No timeout configuration for external API calls
- ❌ No retry logic for external API failures
- ❌ No circuit breaker pattern

#### Performance
- ❌ No caching headers
- ❌ No pagination for large datasets
- ❌ No compression for responses
- ❌ External API calls not cached (hadith API)

#### Developer Experience
- ❌ No API versioning strategy
- ❌ No OpenAPI/Swagger documentation
- ❌ No request/response validation schemas
- ❌ Inconsistent response formats

### 2. Server Actions Issues

#### Security
- ❌ No authorization checks (anyone can delete/update entries)
- ❌ No rate limiting
- ❌ No input validation using Zod schemas

#### Reliability
- ❌ Inconsistent error handling (some return null, some return error objects)
- ❌ Mix of console.error and logger usage
- ❌ No request correlation

#### Maintainability
- ❌ Duplicate functionality between `time-entries.ts` and `schedule.actions.new.ts`
- ❌ No comprehensive input validation

## Improvement Plan

### Phase 1: Foundation Layer (API Utilities)

#### 1.1 Create API Response Utilities

**File**: `lib/api/api-response.ts`

Create standardized response utilities for consistent API responses:

```typescript
// Standard API response structure
interface ApiResponse<T = any> {
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

// Success response helper
function success<T>(data: T, meta?: any): NextResponse

// Error response helper
function error(
  statusCode: number,
  code: string,
  message: string,
  details?: any
): NextResponse
```

**Benefits**:
- Consistent response format across all APIs
- Automatic request ID inclusion
- Type-safe responses
- Easier client-side error handling

#### 1.2 Create API Middleware

**File**: `lib/api/middleware.ts`

Create reusable middleware functions:

```typescript
// Request ID middleware (adds correlation ID)
export async function withRequestId(handler: NextHandler)

// Rate limiting middleware
export async function withRateLimit(
  handler: NextHandler,
  options: RateLimitOptions
)

// Authentication middleware
export async function withAuth(
  handler: NextHandler,
  options?: AuthOptions
)

// Authorization middleware (role-based)
export async function withAuthorization(
  handler: NextHandler,
  roles: string[]
)

// Validation middleware
export async function withValidation<T>(
  handler: NextHandler,
  schema: z.ZodSchema<T>
)

// Error handling middleware
export async function withErrorHandler(handler: NextHandler)
```

**Benefits**:
- Reusable security and validation logic
- Consistent error handling
- Easy to add/remove features per endpoint

#### 1.3 Create API Validation Schemas

**File**: `lib/validations/api-schemas.ts`

Create Zod schemas for API inputs:

```typescript
// Hadith API schemas
export const hadithQuerySchema = z.object({
  collection: z.enum(['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']).optional(),
  id: z.coerce.number().min(1).optional(),
})

// PDF API schemas
export const pdfQuerySchema = z.object({
  location: z.string().min(1).optional(),
  type: z.enum(['today', 'full']).default('today'),
  format: z.enum(['pdf', 'csv']).default('pdf'),
})

// Schedule API schemas
export const scheduleQuerySchema = z.object({
  location: z.string().min(1).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
```

#### 1.4 Create External API Client

**File**: `lib/api/external-api-client.ts`

Create a robust client for external API calls:

```typescript
class ExternalApiClient {
  // Fetch with timeout
  async fetch(url: string, options?: RequestOptions): Promise<Response>

  // Fetch with retry logic
  async fetchWithRetry(
    url: string,
    options?: RequestOptions,
    retryOptions?: RetryOptions
  ): Promise<Response>

  // Fetch with caching
  async fetchWithCache(
    url: string,
    options?: RequestOptions,
    cacheOptions?: CacheOptions
  ): Promise<Response>
}
```

**Benefits**:
- Consistent external API handling
- Automatic retries with exponential backoff
- Request timeout configuration
- Response caching
- Better error handling

#### 1.5 Create Rate Limiter

**File**: `lib/api/rate-limiter.ts`

Implement rate limiting using in-memory store or Redis:

```typescript
class RateLimiter {
  // Check if request is allowed
  async checkLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }>

  // Reset limits
  async reset(identifier: string): Promise<void>
}
```

**Benefits**:
- Prevent API abuse
- Protect sensitive endpoints
- Configurable per endpoint

### Phase 2: REST API Improvements

#### 2.1 Improve `/api/hadith` Endpoint

**Changes**:
- Add input validation using Zod schema
- Add rate limiting (e.g., 10 requests per minute)
- Add caching headers (cache for 1 hour)
- Add request correlation ID
- Use standardized error responses
- Add timeout to external API call
- Add retry logic for external API failures

**Implementation**:
```typescript
// app/api/hadith/route.ts
export const GET = withErrorHandler(
  withRateLimit(
    withValidation(
      async (request: NextRequest) => {
        // Implementation
      },
      hadithQuerySchema
    ),
    { limit: 10, windowMs: 60 * 1000 }
  )
)
```

#### 2.2 Improve `/api/pdf` Endpoint

**Changes**:
- Add input validation for query parameters
- Add authentication (require admin role)
- Add rate limiting (e.g., 5 requests per minute)
- Add request correlation ID
- Use standardized error responses
- Add content-type validation
- Add file size limits
- Improve error messages

**Implementation**:
```typescript
// app/api/pdf/route.ts
export const GET = withErrorHandler(
  withRateLimit(
    withAuth(
      withValidation(
        async (request: NextRequest) => {
          // Implementation
        },
        pdfQuerySchema
      ),
      { requireAdmin: true }
    ),
    { limit: 5, windowMs: 60 * 1000 }
  )
)
```

#### 2.3 Add New Schedule API Endpoints

**Create**: `app/api/schedule/route.ts`

RESTful API for schedule management:

```typescript
// GET /api/schedule - Get schedule (with pagination)
// GET /api/schedule/today - Get today's schedule
// GET /api/schedule/:id - Get specific entry
// POST /api/schedule - Create new entry (admin only)
// PUT /api/schedule/:id - Update entry (admin only)
// DELETE /api/schedule/:id - Delete entry (admin only)
```

**Features**:
- Full CRUD operations
- Pagination support
- Filtering by location and date range
- Authentication and authorization
- Input validation
- Rate limiting

#### 2.4 Add Health Check Endpoint

**Create**: `app/api/health/route.ts`

Health check endpoint for monitoring:

```typescript
// GET /api/health - System health status
// Response: { status: 'ok', timestamp, version, checks: {...} }
```

**Checks**:
- Database connectivity
- External API availability
- Memory usage
- Response time

#### 2.5 Add API Versioning

Implement versioning strategy:

```
/api/v1/hadith
/api/v1/pdf
/api/v1/schedule
```

**Benefits**:
- Backward compatibility
- Easier API evolution
- Clear version contracts

### Phase 3: Server Actions Improvements

#### 3.1 Add Authorization to Server Actions

**Changes**:
- Add session validation to all admin actions
- Add role-based access control
- Reject unauthorized requests with proper error responses

**Implementation**:
```typescript
// lib/api/server-action-helpers.ts
export async function requireAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    throw new UnauthorizedError('Admin access required')
  }
  return session
}

// Usage in actions
export async function deleteTimeEntry(id: string) {
  await requireAdminSession()
  // Rest of implementation
}
```

#### 3.2 Add Input Validation to Server Actions

**Changes**:
- Use Zod schemas for all inputs
- Validate IDs, dates, times, locations
- Return validation errors with field details

**Implementation**:
```typescript
export async function updateTimeEntry(
  id: string,
  data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
) {
  // Validate ID
  const idSchema = z.string().uuid()
  idSchema.parse(id)

  // Validate data
  const updateSchema = timeEntrySchema.partial()
  updateSchema.parse(data)

  // Rest of implementation
}
```

#### 3.3 Standardize Error Handling

**Changes**:
- Use AppError classes consistently
- Return structured error responses
- Log errors with context

**Implementation**:
```typescript
export async function deleteTimeEntry(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession()
    
    const entry = await timeEntryRepository.findById(id)
    if (!entry) {
      throw new NotFoundError('TimeEntry', id)
    }

    await deleteEntryUseCase.execute(id)
    
    revalidatePath('/')
    revalidatePath('/calendar')
    revalidatePath('/admin/dashboard')
    
    return { success: true }
  } catch (error) {
    logger.error('Failed to delete time entry', { id }, error as Error)
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
          statusCode: error.statusCode,
        }
      }
    }
    
    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'An unexpected error occurred',
        statusCode: 500,
      }
    }
  }
}
```

#### 3.4 Deprecate Legacy Actions

**Action**:
- Mark `actions/time-entries.ts` as deprecated
- Add deprecation warnings
- Document migration path to `schedule.actions.new.ts`

**Implementation**:
```typescript
/**
 * @deprecated Use actions/schedule.actions.new.ts instead
 * This file will be removed in a future version
 */
```

### Phase 4: Security Enhancements

#### 4.1 Add Security Headers

**Create**: `lib/api/security-headers.ts`

```typescript
export function setSecurityHeaders(response: Response): Response {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()')
  
  // CSP header (customize based on needs)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}
```

#### 4.2 Configure CORS

**Create**: `lib/api/cors-config.ts`

```typescript
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}
```

#### 4.3 Add Request Logging

**Create**: `lib/api/request-logger.ts`

```typescript
export async function logRequest(
  request: NextRequest,
  response?: Response,
  error?: Error
) {
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  
  const logData = {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: getClientIp(request),
    timestamp: new Date().toISOString(),
    statusCode: response?.status,
    duration: response?.headers.get('x-response-time'),
    error: error?.message,
  }
  
  logger.info('API Request', logData)
}
```

### Phase 5: Documentation

#### 5.1 Create OpenAPI Specification

**Create**: `docs/api/openapi.yaml`

Complete API documentation using OpenAPI 3.0 specification:

```yaml
openapi: 3.0.0
info:
  title: Ramadan Clock API
  version: 1.0.0
  description: API for managing Ramadan prayer schedules

paths:
  /api/v1/hadith:
    get:
      summary: Get random hadith
      tags: [Hadith]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HadithResponse'
        '429':
          description: Rate limit exceeded
```

#### 5.2 Add Inline Documentation

Add JSDoc comments to all API functions:

```typescript
/**
 * Get a random hadith from the collection
 * 
 * @param request - Next.js request object
 * @returns NextResponse with hadith data
 * 
 * @example
 * // GET /api/v1/hadith
 * // Response: { success: true, data: { text: "...", source: "..." } }
 * 
 * @throws {ValidationError} When query parameters are invalid
 * @throws {RateLimitError} When rate limit is exceeded
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

#### 5.3 Create API Usage Guide

**Create**: `docs/api/usage-guide.md`

Comprehensive guide for API consumers:

- Authentication methods
- Rate limiting details
- Error response formats
- Code examples in multiple languages
- Best practices

### Phase 6: Testing

#### 6.1 Add API Tests

**Create**: `tests/api/`

- Unit tests for API utilities
- Integration tests for API endpoints
- Rate limiting tests
- Authentication/authorization tests
- Error handling tests

#### 6.2 Add Load Tests

**Create**: `tests/load/`

- Performance benchmarks
- Concurrent request handling
- Memory usage under load

## Implementation Priority

### High Priority (Security & Reliability)
1. ✅ Create API response utilities
2. ✅ Create error handling middleware
3. ✅ Add input validation to all endpoints
4. ✅ Add authentication/authorization to sensitive endpoints
5. ✅ Add rate limiting
6. ✅ Standardize error responses

### Medium Priority (Performance & DX)
7. ✅ Add caching headers
8. ✅ Improve external API client (retry, timeout, cache)
9. ✅ Add request correlation IDs
10. ✅ Add security headers
11. ✅ Add CORS configuration

### Low Priority (Nice to Have)
12. ✅ Add API versioning
13. ✅ Create OpenAPI documentation
14. ✅ Add health check endpoint
15. ✅ Deprecate legacy server actions

## Success Metrics

### Security
- All sensitive endpoints require authentication
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- Security headers are properly configured

### Reliability
- All errors are caught and handled gracefully
- Request correlation enables debugging
- External API failures are retried automatically
- Health checks monitor system status

### Performance
- Caching reduces redundant requests
- Rate limiting prevents resource exhaustion
- Response times are optimized

### Developer Experience
- Consistent response formats
- Clear error messages
- Comprehensive documentation
- Type-safe API clients

## Migration Strategy

1. **Phase 1**: Create foundation layer without breaking changes
2. **Phase 2**: Implement new endpoints alongside existing ones
3. **Phase 3**: Update existing endpoints incrementally
4. **Phase 4**: Deprecate old patterns with warnings
5. **Phase 5**: Remove deprecated code after grace period

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing clients | Medium | High | Use API versioning, gradual migration |
| Performance degradation | Low | Medium | Benchmark changes, monitor metrics |
| Authentication issues | Low | High | Thorough testing, clear documentation |
| Rate limiting blocking legitimate users | Low | Medium | Configurable limits, monitoring |

## Dependencies

- Next.js 14+ (already using)
- Zod (already using)
- upstash/ratelimit (for rate limiting)
- @upstash/redis (optional, for distributed rate limiting)

## Timeline

- **Phase 1**: Foundation layer - 2-3 days
- **Phase 2**: REST API improvements - 2-3 days
- **Phase 3**: Server Actions improvements - 1-2 days
- **Phase 4**: Security enhancements - 1 day
- **Phase 5**: Documentation - 1-2 days
- **Phase 6**: Testing - 2-3 days

**Total**: 9-14 days

## Conclusion

This plan provides a comprehensive approach to improving the APIs in the Ramadan Clock application. By implementing these best practices, we will achieve:

- **Enhanced Security**: Proper authentication, authorization, and input validation
- **Improved Reliability**: Consistent error handling, retry logic, and monitoring
- **Better Performance**: Caching, rate limiting, and optimized responses
- **Superior Developer Experience**: Clear documentation, consistent interfaces, and type safety

The phased approach ensures that improvements can be implemented incrementally without disrupting existing functionality, while the migration strategy minimizes risk and ensures smooth transitions.
