# 🌙 Ramadan Clock - Sehri & Iftar Time Viewer

A modern web application for viewing and managing Sehri & Iftar schedules during Ramadan. Built with Next.js 16, PostgreSQL, and shadcn/ui.

## ✨ Features

### Public Features
- **Today's Schedule**: View today's Sehri and Iftar times at a glance
- **Full Calendar**: Browse complete schedule in a table format
- **Location Filter**: Filter schedules by city/location
- **PDF Download**: Download schedules as PDF for offline use
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices
- **SSR**: Server-side rendered pages for optimal SEO and performance

### Admin Features
- **Secure Login**: Password-protected admin dashboard
- **File Upload**: Upload schedules via JSON or CSV files
- **Drag & Drop**: Easy file upload with drag and drop support
- **Validation**: Real-time validation with error reporting
- **Preview**: Preview data before confirming upload
- **Sample Templates**: Download sample JSON/CSV templates
- **Dashboard**: View statistics and recent uploads


## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Authentication**: NextAuth.js
- **File Parsing**: PapaParse (CSV), native JSON parser
- **PDF Generation**: jsPDF + jspdf-autotable
- **Validation**: Zod
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ramadan-clock
    ```

2. **Install dependencies**
    ```bash
    pnpm install
    ```

3. **Set up environment variables**
    ```bash
    cp .env.example .env.local
    ```
    
    Edit `.env.local` with your configuration:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/ramadan-clock"
    NEXTAUTH_SECRET="your-secret-key-here"
    NEXTAUTH_URL="http://localhost:3000"
    ADMIN_EMAIL="admin@example.com"
    ADMIN_PASSWORD="admin123"
    ```

4. **Generate Prisma client**
   ```bash
   pnpm db:generate
   ```

5. **Push schema to database**
   ```bash
   pnpm db:push
   ```

6. **Seed initial data (optional)**
   ```bash
   pnpm db:seed
   ```
   
   This creates:
   - Admin user (email: `admin@example.com`, password: `admin123`)
   - Sample time entries for testing

7. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
ramadan-clock/
├── app/
│   ├── (home)/              # Public pages
│   │   ├── calendar/        # Full schedule calendar
│   │   └── location/        # Location-specific pages
│   ├── admin/               # Admin dashboard & upload
│   ├── api/                 # API routes (auth, PDF)
│   ├── auth/                # Login page
│   └── layout.tsx           # Root layout
├── actions/                 # Server actions
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Shared components (header, footer)
│   └── public/              # Public page components
├── lib/
│   ├── db.ts                # Prisma client singleton
│   ├── auth.ts              # Auth utilities
│   └── validations/         # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
└── middleware.ts            # Auth middleware
```

## 📊 Database Schema

### TimeEntry
- `id`: UUID
- `date`: String (YYYY-MM-DD)
- `sehri`: String (HH:mm)
- `iftar`: String (HH:mm)
- `location`: String (nullable)
- `createdAt`: DateTime
- Unique index on `(date, location)`

### AdminUser
- `id`: UUID
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: DateTime

### UploadLog
- `id`: UUID
- `fileName`: String
- `rowCount`: Int
- `status`: String (success/partial/failed)
- `errors`: String (JSON)
- `uploadedAt`: DateTime

## 📤 File Upload Format

### JSON Format
```json
[
  {
    "date": "2026-03-01",
    "sehri": "04:45",
    "iftar": "18:12",
    "location": "Dhaka"
  }
]
```

### CSV Format
```csv
date,sehri,iftar,location
2026-03-01,04:45,18:12,Dhaka
```

### Validation Rules
- **Required fields**: date, sehri, iftar
- **Optional**: location
- **Date format**: YYYY-MM-DD
- **Time format**: HH:mm
- **Max rows**: 1000 per upload
- **File size**: Max 1MB
- **No duplicates**: (date + location) must be unique

## 🔐 Admin Access

Default admin credentials (change in production!):
- **Email**: `admin@example.com`
- **Password**: `admin123`

Access admin dashboard at: `/admin/dashboard`

## 🌐 Routes

### Public Routes
- `/` - Today's Sehri & Iftar
- `/calendar` - Full schedule calendar
- `/location/[city]` - Location-specific schedule

### Admin Routes (Protected)
- `/auth/login` - Admin login
- `/admin/dashboard` - Dashboard overview
- `/admin/upload` - Upload schedules

### API Routes
- `/api/auth/[...nextauth]` - Authentication
- `/api/pdf` - PDF generation

## 📱 Features Breakdown

### Home Page
- Real-time today's schedule display
- Location selector dropdown
- Quick links to location pages
- PDF download button
- Responsive card layout

### Calendar Page
- Full schedule table
- Today highlight badge
- Past/Upcoming status indicators
- Location filter
- Sortable columns

### Location Pages
- City-specific schedules
- Dynamic metadata for SEO
- Static generation for performance
- Back navigation

### Admin Dashboard
- Total entries count
- Number of locations
- Recent uploads table
- Status badges (Success/Partial/Failed)
- Quick upload button

### Upload System
- Drag & drop interface
- JSON and CSV support
- Real-time validation
- Error reporting by row
- Preview table (first 10 entries)
- Confirm dialog before upload
- Sample file downloads

### PDF Export
- Clean A4 layout
- Header with app title
- Date/location info
- Formatted table with all entries
- Page numbers
- Generation timestamp footer
- Custom filename

## ⏰ Schedule Display Logic

The application uses intelligent logic to display sehri and iftar times based on the current time and user's location. Here's how it works across different pages:

### Core Server Actions

#### `getScheduleDisplayData(location?)`
Returns both today's and tomorrow's schedules along with time status flags:
```typescript
{
  today: TimeEntry | null,      // Today's schedule entry
  tomorrow: TimeEntry | null,   // Tomorrow's schedule entry
  sehriPassed: boolean,         // Whether today's sehri time has passed
  iftarPassed: boolean          // Whether today's iftar time has passed
}
```

**Logic:**
1. Fetches today's schedule based on current date (YYYY-MM-DD format)
2. Fetches tomorrow's schedule (date + 1 day)
3. Compares current time with sehri/iftar times to determine status
4. Returns formatted times in 12-hour format (e.g., "04:45 AM")

#### `getTodayOrNextDaySchedule(location?)`
Returns the appropriate schedule for display:
- Returns today's schedule if iftar time hasn't passed yet
- Returns tomorrow's schedule if today's iftar time has passed
- Returns `null` if no schedule is found

#### `getFullSchedule(location?)`
Returns all schedule entries, optionally filtered by location:
- Ordered by date ascending
- Returns formatted times in 12-hour format
- Used for calendar tables and location-specific pages

### Time Comparison Logic

#### `hasSehriPassed(schedule)` and `hasIftarPassed(schedule)`
These helper functions determine if a specific time has passed:

```typescript
// Parse time string (HH:mm format)
const [hours, minutes] = time.split(':').map(Number);

// Create date object with target time
const targetTime = new Date();
targetTime.setHours(hours, minutes, 0, 0);

// Compare with current time
return now >= targetTime;
```

**Note:** Time comparisons use the server's system time (Asia/Dhaka timezone).

### Page-Specific Display Logic

#### Home Page (`/`)
The home page displays the most relevant schedule based on current time:

1. **Fetches** both today's and tomorrow's schedules via [`getScheduleDisplayData()`](actions/time-entries.ts:99)
2. **Determines display schedule:**
   - If `iftarPassed` is `false`: Shows today's sehri and iftar
   - If `iftarPassed` is `true`: Shows tomorrow's sehri and iftar
3. **Visual indicators:**
   - Sehri card shows "Passed — fast has begun" if sehri time has passed
   - Sehri card shows "End time — fast begins" if sehri time is upcoming
   - Iftar card shows "Start time — fast breaks"
4. **Countdown timers:** Displayed only when within 1 hour of target time
5. **Passed schedule card:** Shows today's times in a separate card if iftar has passed

#### Calendar Page (`/calendar`)
The calendar page displays the full schedule in a table format:

1. **Main cards:** Uses [`getTodayOrNextDaySchedule()`](actions/time-entries.ts:64) to show today's or tomorrow's schedule
2. **Table rows:** Each row shows status based on time comparison:
   - **Passed** (red): Past dates or today after iftar time
   - **Today** (blue): Today before iftar time, or tomorrow after sehri time
   - **Tomorrow** (amber): Tomorrow before sehri time
   - **Upcoming** (default): Future dates beyond tomorrow
3. **Inline status logic** (lines 171-238 in [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:171)):
   ```typescript
   // Parse times
   const sehriTime = parseTime(entry.sehri);  // { hours, minutes }
   const iftarTime = parseTime(entry.iftar); // { hours, minutes }
   
   // Get current time
   const now = new Date();
   const currentHours = now.getHours();
   const currentMinutes = now.getMinutes();
   
   // Check if time has passed
   const isTimePast = (hours, minutes) => 
     currentHours > hours || (currentHours === hours && currentMinutes >= minutes);
   ```

#### Location Pages (`/location/[city]`)
Location-specific pages use the same logic as the calendar page but filtered by city:

1. **Validation:** Checks if the city exists in the database via [`getLocations()`](actions/time-entries.ts:191)
2. **Filtered data:** All queries include the location parameter
3. **Static generation:** Uses [`generateStaticParams()`](app/(home)/location/[city]/page.tsx:24) to pre-render all location pages
4. **Status logic:** Identical to calendar page (passed/today/tomorrow/upcoming)

### Countdown Timer Component

The [`CountdownTimer`](components/shared/countdown-timer.tsx:1) component provides real-time countdown:

**Features:**
- Only visible when within 1 hour of target time
- Updates every second
- Automatically handles next day if target time has passed
- Format: `HH:MM:SS` with pulsing clock icon

**Logic:**
```typescript
// Calculate time difference
const diff = targetDate.getTime() - now.getTime();
const oneHourMs = 60 * 60 * 1000;

// Show only if within 1 hour
if (diff <= oneHourMs && diff > 0) {
  // Display countdown
}
```

### Time Formatting

All times are stored in 24-hour format (HH:mm) in the database and converted to 12-hour format for display:

```typescript
// lib/utils.ts
export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
```

Example: `"04:45"` → `"4:45 AM"`, `"18:12"` → `"6:12 PM"`

### Location Filtering

Location filtering works consistently across all pages:

1. **Location parameter:** Passed via URL query param (`?location=Dhaka`) or route param (`/location/Dhaka`)
2. **Server action filtering:** All data fetching functions accept optional `location` parameter
3. **"All Locations":** When no location is specified, shows entries from all locations
4. **Location list:** Dynamically fetched from database via [`getLocations()`](actions/time-entries.ts:191)

### Data Flow Summary

```
User Request
    ↓
Server Component (page.tsx)
    ↓
Server Action (time-entries.ts)
    ↓
Prisma Query (MongoDB)
    ↓
Time Formatting & Status Calculation
    ↓
Client Component (countdown timer, UI)
    ↓
Display to User
```

## 🏗️ Advanced Architecture & Complex Logic Features

This application implements several sophisticated architectural patterns and complex logic systems to ensure scalability, maintainability, and performance. Below are detailed explanations of these advanced features.

### API Architecture & Middleware System

The application implements a robust API architecture with a composable middleware pipeline in [`lib/api/middleware.ts`](lib/api/middleware.ts:1).

#### Middleware Pipeline

The middleware system follows a functional composition pattern where each middleware wraps the handler:

```typescript
// Compose multiple middleware functions
export function compose(...middlewares: Array<(handler: NextHandler) => NextHandler>) {
  return (handler: NextHandler): NextHandler => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}
```

#### Available Middleware

1. **Request ID Middleware** ([`withRequestId`](lib/api/middleware.ts:53))
   - Generates unique request IDs for tracing
   - Adds `x-request-id` header to both request and response
   - Supports external request ID propagation

2. **Rate Limiting Middleware** ([`withRateLimit`](lib/api/middleware.ts:85))
   - In-memory rate limiting using sliding window algorithm
   - Configurable limits and time windows
   - Returns rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
   - Automatic retry-after calculation for 429 responses

3. **Authentication Middleware** ([`withAuth`](lib/api/middleware.ts:123))
   - Integrates with NextAuth.js session management
   - Supports optional admin role checking
   - Injects session data into request headers for downstream use

4. **Validation Middleware** ([`withValidation`](lib/api/middleware.ts:182))
   - Zod schema validation for query/body parameters
   - Detailed error reporting with field-level validation errors
   - Supports validation of both query and body data

5. **Error Handling Middleware** ([`withErrorHandler`](lib/api/middleware.ts:232))
   - Catches and transforms all errors to standardized API responses
   - Adds response time tracking via `X-Response-Time` header
   - Distinguishes between operational and programming errors

6. **Logging Middleware** ([`withLogging`](lib/api/middleware.ts:282))
   - Logs all incoming requests with method, URL, and user agent
   - Logs successful responses with status and duration
   - Logs errors with full context

#### Standardized API Responses

All API responses follow a consistent structure defined in [`lib/api/api-response.ts`](lib/api/api-response.ts:1):

```typescript
interface ApiResponse<T> {
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
```

Response helpers include:
- [`success()`](lib/api/api-response.ts:55) - Successful responses
- [`paginated()`](lib/api/api-response.ts:75) - Paginated data responses
- [`error()`](lib/api/api-response.ts:97) - Error responses
- [`validationError()`](lib/api/api-response.ts:139) - Validation errors
- [`rateLimitExceeded()`](lib/api/api-response.ts:205) - Rate limit errors

#### External API Client

The [`ExternalApiClient`](lib/api/external-api-client.ts:51) provides robust external API integration:

**Features:**
- **Timeout Handling**: Configurable request timeouts with AbortController
- **Retry Logic**: Exponential backoff retry for transient failures
- **Caching**: Built-in in-memory caching with TTL support
- **Configurable Retry Options**: Custom retryable status codes, delays, and multipliers

**Retry Strategy:**
```typescript
const defaultRetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2,    // Exponential
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};
```

#### Security Headers

Comprehensive security headers are implemented in [`lib/api/security-headers.ts`](lib/api/security-headers.ts:1):

- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Content-Security-Policy**: Comprehensive CSP policy
- **CORS Support**: Configurable CORS headers with preflight handling

### Cache Implementation Strategy

The application implements a multi-layered caching strategy for optimal performance.

#### Cache Configuration

Centralized cache configuration in [`lib/cache/cache-config.ts`](lib/cache/cache-config.ts:1):

```typescript
const CACHE_DURATIONS = {
  SHORT: 60,      // 1 minute - frequently changing data
  MEDIUM: 300,    // 5 minutes - moderately changing data
  LONG: 900,      // 15 minutes - rarely changing data
  VERY_LONG: 1800,// 30 minutes - very rarely changing data
  HOUR: 3600,     // 1 hour - static data
};

const CACHE_TAGS = {
  SCHEDULE: 'schedule',
  LOCATIONS: 'locations',
  STATS: 'stats',
  HADITH: 'hadith',
  PDF: 'pdf',
};
```

#### Cache Helpers

Utility functions in [`lib/cache/cache-helpers.ts`](lib/cache/cache-helpers.ts:1):

- [`createCachedFn()`](lib/cache/cache-helpers.ts:27) - Wraps async functions with Next.js unstable_cache
- [`invalidateScheduleCache()`](lib/cache/cache-helpers.ts:42) - Invalidates all schedule-related caches
- [`invalidateLocationCache()`](lib/cache/cache-helpers.ts:54) - Invalidates location caches
- [`invalidatePdfCache()`](lib/cache/cache-helpers.ts:62) - Invalidates PDF caches
- [`getCacheKey()`](lib/cache/cache-helpers.ts:90) - Creates hierarchical cache keys
- [`getLocationCacheKey()`](lib/cache/cache-helpers.ts:101) - Creates location-specific cache keys
- [`getDateCacheKey()`](lib/cache/cache-helpers.ts:113) - Creates date-specific cache keys

#### Cache Monitoring

The [`CacheMonitor`](lib/cache/cache-monitor.ts:30) class provides comprehensive cache performance tracking:

**Features:**
- Hit/miss tracking per cache key
- Hit rate calculation
- Overall cache statistics
- Per-key statistics
- Metrics export as JSON
- Decorator support for class methods

**Usage Example:**
```typescript
// Record hits/misses manually
CacheMonitor.recordHit('schedule:dhaka');
CacheMonitor.recordMiss('schedule:dhaka');

// Get statistics
const stats = CacheMonitor.getOverallStats();
// { hits: 100, misses: 20, hitRate: '83.33%', total: 120 }

// Wrap a function with monitoring
const monitoredFn = withCacheMonitoring(
  async () => await fetchData(),
  'data-fetch'
);
```

#### Cache Cleanup

The [`CacheCleanup`](lib/cache/cache-cleanup.ts:12) class manages periodic cache maintenance:

**Features:**
- Automatic cleanup of expired cache entries
- Periodic cleanup scheduling (default: 1 hour)
- Manual cleanup triggering
- Cleanup status monitoring
- External API cache cleanup

**Initialization:**
```typescript
import { initializeCacheCleanup } from '@/lib/cache';

// Auto-initializes on server start
initializeCacheCleanup();

// Or manually schedule
CacheCleanup.schedulePeriodicCleanup(3600000); // 1 hour
```

### SEO & Metadata System

The application implements a comprehensive SEO strategy for maximum search engine visibility.

#### Metadata Generation

The [`lib/seo/metadata.ts`](lib/seo/metadata.ts:1) module provides metadata generators:

- [`getBaseMetadata()`](lib/seo/metadata.ts:96) - Base metadata for all pages
- [`getPageMetadata()`](lib/seo/metadata.ts:166) - Page-specific metadata
- [`getHomeMetadata()`](lib/seo/metadata.ts:230) - Home page metadata
- [`getCalendarMetadata()`](lib/seo/metadata.ts:250) - Calendar page metadata
- [`getLocationMetadata()`](lib/seo/metadata.ts:269) - Dynamic location page metadata
- [`getContactMetadata()`](lib/seo/metadata.ts:291) - Contact page metadata
- [`getAdminMetadata()`](lib/seo/metadata.ts:308) - Admin pages (noindex)
- [`getAuthMetadata()`](lib/seo/metadata.ts:320) - Auth pages (noindex)

**Features:**
- Open Graph tags for social media sharing
- Twitter Card support
- Canonical URL generation
- Dynamic keyword generation
- Robots meta configuration
- Favicon and manifest configuration

#### JSON-LD Structured Data

The [`lib/seo/schemas.ts`](lib/seo/schemas.ts:1) module generates JSON-LD schemas:

**Available Schemas:**
- [`createWebSiteSchema()`](lib/seo/schemas.ts:20) - Website schema with search action
- [`createOrganizationSchema()`](lib/seo/schemas.ts:38) - Organization information
- [`createBreadcrumbSchema()`](lib/seo/schemas.ts:59) - Breadcrumb navigation
- [`createFAQSchema()`](lib/seo/schemas.ts:78) - FAQ page schema
- [`createArticleSchema()`](lib/seo/schemas.ts:99) - Article/blog post schema
- [`createSoftwareApplicationSchema()`](lib/seo/schemas.ts:140) - App store schema
- [`createLocalBusinessSchema()`](lib/seo/schemas.ts:174) - Location-specific business schema
- [`createCollectionPageSchema()`](lib/seo/schemas.ts:197) - Listing page schema
- [`createWebPageSchema()`](lib/seo/schemas.ts:221) - Generic web page schema
- [`createEventSchema()`](lib/seo/schemas.ts:249) - Event schema for Ramadan
- [`createHowToSchema()`](lib/seo/schemas.ts:281) - How-to guide schema

### Feature-Based Architecture (DDD)

The application follows Domain-Driven Design (DDD) principles with a feature-based architecture in [`features/schedule/`](features/schedule/).

#### Architecture Layers

```
features/schedule/
├── domain/
│   ├── entities/           # Domain entities with business logic
│   ├── value-objects/      # Value objects with validation
│   └── types/              # Domain types and interfaces
├── repositories/           # Data access layer
├── services/               # Business logic services
└── use-cases/             # Application use cases
```

#### Domain Entities

The [`TimeEntry`](features/schedule/domain/entities/time-entry.entity.ts:25) entity encapsulates schedule data with domain logic:

**Features:**
- Immutable properties (readonly)
- Time comparison methods: [`isSehriPassed()`](features/schedule/domain/entities/time-entry.entity.ts:77), [`isIftarPassed()`](features/schedule/domain/entities/time-entry.entity.ts:93)
- Date comparison methods: [`isPast()`](features/schedule/domain/entities/time-entry.entity.ts:108), [`isToday()`](features/schedule/domain/entities/time-entry.entity.ts:116), [`isTomorrow()`](features/schedule/domain/entities/time-entry.entity.ts:124)
- DTO conversion: [`toDTO()`](features/schedule/domain/entities/time-entry.entity.ts:48), [`toFormattedDTO()`](features/schedule/domain/entities/time-entry.entity.ts:62)
- Static factory methods: [`fromDTO()`](features/schedule/domain/entities/time-entry.entity.ts:142), [`fromDTOArray()`](features/schedule/domain/entities/time-entry.entity.ts:151)

#### Value Objects

The [`LocationVO`](features/schedule/domain/value-objects/location.vo.ts:10) value object encapsulates location logic:

**Features:**
- Null-safe location handling
- Display name generation
- Validation and normalization
- Equality comparison
- Static factory methods: [`create()`](features/schedule/domain/value-objects/location.vo.ts:67), [`all()`](features/schedule/domain/value-objects/location.vo.ts:74)

#### Services

The [`ScheduleService`](features/schedule/services/schedule.service.ts:17) contains business logic:

**Methods:**
- [`getTodaySchedule()`](features/schedule/services/schedule.service.ts:29) - Get today's entry
- [`getTomorrowSchedule()`](features/schedule/services/schedule.service.ts:40) - Get tomorrow's entry
- [`getTodayOrNextDaySchedule()`](features/schedule/services/schedule.service.ts:52) - Smart schedule selection
- [`getScheduleDisplayData()`](features/schedule/services/schedule.service.ts:68) - Complete display data
- [`getFullSchedule()`](features/schedule/services/schedule.service.ts:80) - All entries
- [`getScheduleByDateRange()`](features/schedule/services/schedule.service.ts:92) - Date range query
- [`getLocations()`](features/schedule/services/schedule.service.ts:105) - Unique locations
- [`getStats()`](features/schedule/services/schedule.service.ts:113) - Dashboard statistics
- [`getTimeEntryById()`](features/schedule/services/schedule.service.ts:132) - Single entry lookup
- [`updateTimeEntry()`](features/schedule/services/schedule.service.ts:143) - Update entry
- [`deleteTimeEntry()`](features/schedule/services/schedule.service.ts:155) - Delete entry

#### Use Cases

Use cases encapsulate application-level logic:

- [`GetTodayScheduleUseCase`](features/schedule/use-cases/get-today-schedule.use-case.ts:1)
- [`GetFullScheduleUseCase`](features/schedule/use-cases/get-full-schedule.use-case.ts:1)
- [`GetScheduleDisplayDataUseCase`](features/schedule/use-cases/get-schedule-display-data.use-case.ts:13)
- [`GetLocationsUseCase`](features/schedule/use-cases/get-locations.use-case.ts:1)
- [`UploadScheduleUseCase`](features/schedule/use-cases/upload-schedule.use-case.ts:1)
- [`UpdateEntryUseCase`](features/schedule/use-cases/update-entry.use-case.ts:1)
- [`DeleteEntryUseCase`](features/schedule/use-cases/delete-entry.use-case.ts:1)

### Error Handling System

The application implements a comprehensive error handling system in [`lib/errors/app-error.ts`](lib/errors/app-error.ts:1).

#### Custom Error Classes

All errors extend the base [`AppError`](lib/errors/app-error.ts:10) class:

- [`DatabaseError`](lib/errors/app-error.ts:51) - Database operation failures
- [`ValidationError`](lib/errors/app-error.ts:64) - Input validation failures
- [`NotFoundError`](lib/errors/app-error.ts:83) - Resource not found
- [`UnauthorizedError`](lib/errors/app-error.ts:99) - Authentication failures
- [`ForbiddenError`](lib/errors/app-error.ts:112) - Authorization failures
- [`ConflictError`](lib/errors/app-error.ts:125) - Resource conflicts
- [`FileUploadError`](lib/errors/app-error.ts:138) - File upload failures

**Features:**
- HTTP status code mapping
- Operational vs programming error distinction
- Error cause chaining
- JSON serialization
- Type guard: [`isAppError()`](lib/errors/app-error.ts:150)
- Error converter: [`toAppError()`](lib/errors/app-error.ts:159)

### Parser System

The application uses a factory pattern for file parsing in [`lib/parsers/index.ts`](lib/parsers/index.ts:1).

#### Parser Factory

The [`ParserFactory`](lib/parsers/index.ts:14) manages parser registration and selection:

**Features:**
- Automatic parser selection based on file extension
- Extensible parser registration
- Support for multiple file formats (JSON, CSV)
- Type-safe parsing with [`ParsedScheduleEntry`](lib/parsers/parser.interface.ts:1) interface

**Available Parsers:**
- [`JsonParser`](lib/parsers/json-parser.ts:1) - JSON file parsing
- [`CsvParser`](lib/parsers/csv-parser.ts:1) - CSV file parsing with PapaParse

**Usage:**
```typescript
const parser = ParserFactory.getParser('schedule.json');
const entries = await parser.parse(fileContent);
```

### Logging System

A comprehensive logging system is implemented in [`lib/logger/logger.ts`](lib/logger/logger.ts:1).

#### Logger Features

- **Multiple Log Levels**: error, warn, info, debug
- **Environment-Aware**: Different behavior for dev/test/production
- **Console Logging**: Color-coded output for development
- **Context Support**: Structured logging with context objects
- **Child Loggers**: Create loggers with default context
- **Production-Ready**: Placeholder for external service integration (Sentry, Datadog)

**Usage:**
```typescript
import { logger, createLogger } from '@/lib/logger';

// Global logger
logger.error('Error message', { context: 'value' }, error);

// Child logger with context
const apiLogger = createLogger('api');
apiLogger.info('API request', { endpoint: '/schedule' });
```

### Configuration Management

Centralized configuration management in [`lib/config/index.ts`](lib/config/index.ts:1).

#### Configuration Modules

- [`APP_CONFIG`](lib/config/index.ts:6) - Application metadata
- [`UPLOAD_CONFIG`](lib/config/index.ts:12) - File upload limits and allowed types
- [`TIME_CONFIG`](lib/config/index.ts:19) - Time-related constants
- [`PDF_CONFIG`](lib/config/index.ts:25) - PDF generation settings
- [`UI_CONFIG`](lib/config/index.ts:33) - UI display limits
- [`locations.config.ts`](lib/config/locations.config.ts:1) - Location data
- [`env.config.ts`](lib/config/env.config.ts:1) - Environment variables

### Guards & Authorization

The application implements a dual-layer guard system in [`lib/guards/`](lib/guards/index.ts:1).

#### Client-Side Guards

The [`DashboardGuard`](lib/guards/client-dashboard-guard.tsx:1) component protects client-side routes:

**Features:**
- Session checking
- Redirect to login if unauthenticated
- Loading state during authentication check
- Configurable options (requireAdmin)

#### Server-Side Guards

The [`dashboardGuard`](lib/guards/dashboard-guard.ts:1) function protects server components:

**Features:**
- Server-side session validation
- Early return for unauthenticated requests
- Type-safe options

### Advanced Schedule Logic

The schedule display system implements sophisticated time-based logic.

#### Time Comparison Logic

Using moment.js for accurate time comparisons:

```typescript
// Check if sehri/iftar time has passed
isSehriPassed(referenceDate?: Date): boolean {
  const now = referenceDate ? moment(referenceDate) : moment();
  const sehriTime = moment(this.sehri, 'HH:mm');
  sehriTime.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });
  return now.isSameOrAfter(sehriTime);
}
```

#### Smart Schedule Selection

The [`getTodayOrNextDaySchedule()`](features/schedule/services/schedule.service.ts:52) method intelligently selects the appropriate schedule:

**Logic:**
1. Fetch today's schedule
2. Check if today's iftar has passed
3. If iftar passed, return tomorrow's schedule
4. Otherwise, return today's schedule

#### Display Data Structure

The [`ScheduleDisplayData`](features/schedule/domain/types/schedule-status.types.ts:1) interface provides complete display information:

```typescript
interface ScheduleDisplayData {
  today: TimeEntry | null;
  tomorrow: TimeEntry | null;
  sehriPassed: boolean;
  iftarPassed: boolean;
}
```

#### Countdown Timer

The [`CountdownTimer`](components/shared/countdown-timer.tsx:1) component provides real-time countdown:

**Features:**
- Only visible within 1 hour of target time
- Updates every second
- Automatically handles next day transitions
- Format: `HH:MM:SS` with pulsing clock icon

### Rate Limiter Implementation

The [`RateLimiter`](lib/api/rate-limiter.ts:29) class provides in-memory rate limiting:

**Features:**
- Sliding window algorithm
- Per-identifier tracking (IP or user ID)
- Configurable limits and time windows
- Automatic cleanup of expired entries
- Store size monitoring
- Singleton pattern for global instance

**Usage:**
```typescript
const rateLimiter = new RateLimiter();
const result = await rateLimiter.checkLimit('user:123', 100, 60000);
// { allowed: true, remaining: 99, resetAt: Date }
```

### API Validation System

Comprehensive validation using Zod schemas in [`lib/validations/api-schemas.ts`](lib/validations/api-schemas.ts:1).

**Features:**
- Request validation schemas
- Response validation schemas
- Type-safe validation
- Detailed error reporting

### Security Features

1. **Input Sanitization**: [`sanitizeInput()`](lib/api/security-headers.ts:166) prevents XSS attacks
2. **URL Validation**: [`sanitizeUrl()`](lib/api/security-headers.ts:176) prevents open redirects
3. **IP Detection**: [`getClientIp()`](lib/api/security-headers.ts:136) handles various proxy headers
4. **User Agent**: [`getUserAgent()`](lib/api/security-headers.ts:159) extracts user agent information

### Performance Optimizations

1. **Next.js Caching**: Uses `unstable_cache` for data caching
2. **Static Generation**: Location pages pre-rendered with [`generateStaticParams()`](app/(home)/location/[city]/page.tsx:24)
3. **Cache Tags**: Selective cache invalidation
4. **Stale-While-Revalidate**: Background revalidation for improved UX
5. **External API Caching**: Built-in caching with TTL

### Monitoring & Observability

1. **Request Tracking**: Unique request IDs for tracing
2. **Response Time**: `X-Response-Time` header
3. **Cache Metrics**: Hit/miss tracking and hit rate calculation
4. **Structured Logging**: Context-aware logging throughout the application
5. **Error Tracking**: Comprehensive error logging with context


## 🎨 UI Components

Built with shadcn/ui:
- Card, Button, Table, Dialog
- Alert, Toast (Sonner), Tabs
- Select, Badge, Skeleton
- Dropdown Menu, Input, Label

## 🔒 Security

- Admin routes protected by NextAuth middleware
- Password hashing with bcryptjs
- Server-side validation
- File type restrictions
- File size limits
- Rate limiting ready (add middleware as needed)

## 🚀 Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` (MongoDB Atlas recommended)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/ramadan-clock"
NEXTAUTH_SECRET="<generate-secret>"
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed initial data
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built for the Muslim community during Ramadan
- Inspired by the need for accurate prayer time information
- Made with ❤️ using modern web technologies

---

**Ramadan Mubarak! 🌙**
