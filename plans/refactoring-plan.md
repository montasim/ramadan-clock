# Code Refactoring Plan: Clean Code, SOLID Principles & Next.js Best Practices

## Executive Summary

This plan outlines a comprehensive refactoring of the ramadan-clock codebase to align with Clean Code principles, SOLID design principles, and Next.js best practices. The refactoring will **not alter any functionality or UI** - it's purely an internal code quality improvement.

---

## Current State Analysis

### Strengths Already in Place
- ✅ Domain-Driven Design (DDD) structure with entities, value objects, repositories, and use cases
- ✅ Custom error handling system with `AppError` hierarchy
- ✅ Repository pattern for data access
- ✅ Service layer for business logic
- ✅ Caching with Next.js `unstable_cache`
- ✅ API middleware (rate limiting, auth, error handling)
- ✅ TypeScript with strict mode enabled

### Identified Issues

#### SOLID Principle Violations

| Principle | Violations | Impact |
|-----------|------------|--------|
| **SRP** | `actions/time-entries.ts` (413 lines) - handles caching, formatting, data fetching, time calculations | Difficult to test, maintain, and extend |
| **SRP** | `app/page.tsx` (267 lines) - mixed concerns: data fetching, UI, time calculations | Component is too large, hard to reuse |
| **SRP** | `lib/api/prayer-time-api.ts` (333 lines) - caching, retry logic, API calls, data processing, filtering | Service has too many responsibilities |
| **OCP** | Hardcoded configurations scattered throughout | Difficult to extend without modifying existing code |
| **OCP** | Status badge logic in `schedule-table.tsx` is tightly coupled | Cannot add new statuses without modifying component |
| **DIP** | Direct Prisma dependencies in actions | Tight coupling to implementation details |
| **DIP** | Components directly call server actions | Violates dependency inversion |

#### Clean Code Issues

| Issue | Location | Description |
|-------|----------|-------------|
| Magic numbers/strings | Multiple files | Hardcoded values without constants |
| Duplicate code | Time formatting, comparison logic | Same logic in multiple places |
| Large functions | `actions/time-entries.ts` | Functions doing too much |
| Inconsistent error handling | Various files | Some use try/catch, some don't |
| Mixed concerns | UI components | Business logic in components |
| Poor abstraction | Direct Prisma calls | No proper abstraction layer |

#### Next.js Best Practices Gaps

| Issue | Current State | Recommended |
|-------|---------------|-------------|
| Server Actions | Mixed with UI logic | Proper separation with error boundaries |
| RSC usage | Not fully optimized | Better use of Server Components |
| Caching strategy | Inconsistent | Unified caching approach |
| Route organization | Some inconsistency | Clearer structure |
| Data fetching | Direct in components | Use proper data fetching patterns |

---

## Refactoring Strategy

### Phase 1: Extract Constants and Configuration

**Goal:** Eliminate magic numbers/strings and centralize configuration

#### 1.1 Create Constants Module
- Create `lib/constants/` directory
- Extract all magic numbers and strings
- Group by domain (time, cache, validation, etc.)

**Files to create:**
```
lib/constants/
├── index.ts
├── time.constants.ts
├── cache.constants.ts
├── validation.constants.ts
└── ui.constants.ts
```

**Example:**
```typescript
// lib/constants/time.constants.ts
export const TIME_FORMATS = {
  HOUR_24: 'HH:mm',
  HOUR_12: 'h:mm A',
  DATE_ISO: 'YYYY-MM-DD',
  DATE_DISPLAY: 'dddd, MMMM D, YYYY',
} as const;

export const TIME_ADJUSTMENTS = {
  DEFAULT_SEHRI: 0,
  DEFAULT_IFTAR: 0,
} as const;
```

### Phase 2: Apply Single Responsibility Principle

**Goal:** Split large files into focused, single-responsibility modules

#### 2.1 Refactor `actions/time-entries.ts`

**Current structure (413 lines):**
- Data fetching functions
- Time formatting logic
- Time comparison logic
- Cache management

**Proposed new structure:**
```
features/schedule/
├── actions/                    # Server Actions (thin wrappers)
│   ├── index.ts
│   ├── schedule.actions.ts     # Public action exports
│   └── cache.actions.ts        # Cache invalidation actions
├── services/
│   ├── schedule.service.ts    # Business logic (already exists)
│   ├── time-formatter.service.ts  # NEW: Time formatting
│   └── time-calculator.service.ts # Time calculations (already exists)
├── repositories/
│   └── time-entry.repository.ts # Data access (already exists)
└── use-cases/
    └── index.ts                # Use case orchestrators (already exists)
```

**New `time-formatter.service.ts`:**
```typescript
export class TimeFormatterService {
  formatTo12Hour(time24: string): string { ... }
  formatTo24Hour(time12: string): string { ... }
  formatEntry(entry: TimeEntryDTO): FormattedTimeEntry { ... }
}
```

#### 2.2 Refactor `app/page.tsx`

**Current structure (267 lines):**
- Data fetching
- Time calculations
- UI rendering
- SEO metadata

**Proposed new structure:**
```
app/
└── (home)/
    ├── page.tsx                 # Main page (thin)
    ├── components/
    │   ├── hero-section.tsx    # Hero banner
    │   ├── sehri-iftar-cards.tsx # Time cards
    │   ├── hadith-card.tsx     # Hadith display
    │   └── quick-links.tsx     # Navigation links
    └── hooks/
        └── use-schedule-data.ts # Data fetching hook
```

#### 2.3 Refactor `lib/api/prayer-time-api.ts`

**Current structure (333 lines):**
- API calls
- Retry logic
- Caching
- Data processing
- Ramadan filtering

**Proposed new structure:**
```
lib/api/prayer-time/
├── index.ts
├── prayer-time-api-client.ts   # API calls only
├── prayer-time-cache.ts        # Caching logic
├── prayer-time-processor.ts    # Data processing
├── prayer-time-filter.ts       # Ramadan filtering
└── prayer-time-retry.ts        # Retry logic
```

### Phase 3: Apply Open/Closed Principle

**Goal:** Make code extensible without modification

#### 3.1 Strategy Pattern for Status Badges

**Current:** Hardcoded switch statement in `schedule-table.tsx`

**Proposed:**
```typescript
// components/shared/status-badge/
├── index.ts
├── status-badge-registry.ts   # Registry of badge renderers
├── status-badge-strategy.ts    # Strategy interface
└── strategies/
    ├── passed-badge.tsx
    ├── today-badge.tsx
    ├── tomorrow-badge.tsx
    └── upcoming-badge.tsx
```

**Usage:**
```typescript
// Register new badge without modifying existing code
statusBadgeRegistry.register('custom', CustomBadgeStrategy);
```

#### 3.2 Plugin Architecture for Data Sources

**Create abstraction for data fetching:**
```typescript
// lib/data-sources/
├── index.ts
├── data-source.interface.ts
├── prisma-data-source.ts
└── cache-data-source.ts
```

### Phase 4: Apply Liskov Substitution Principle

**Goal:** Ensure derived classes can substitute base classes

#### 4.1 Refactor Error Hierarchy

**Current:** Good foundation, but can be improved

**Enhancement:**
- Ensure all `AppError` subclasses maintain the same contract
- Add proper error serialization
- Ensure consistent error handling across all layers

### Phase 5: Apply Interface Segregation Principle

**Goal:** Split large interfaces into focused ones

#### 5.1 Split Repository Interfaces

**Current:** `ITimeEntryRepository` has 9 methods

**Proposed:**
```typescript
// Read operations
interface ITimeEntryReader {
  findByDate(date: string, location?: string): Promise<TimeEntryDTO | null>;
  findByDateRange(startDate: string, endDate: string, location?: string): Promise<TimeEntryDTO[]>;
  findAll(location?: string): Promise<TimeEntryDTO[]>;
  findById(id: string): Promise<TimeEntryDTO | null>;
  getLocations(): Promise<string[]>;
  count(): Promise<number>;
}

// Write operations
interface ITimeEntryWriter {
  create(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;
  update(id: string, data: Partial<Omit<TimeEntryDTO, 'id'>>): Promise<TimeEntryDTO>;
  delete(id: string): Promise<void>;
  upsert(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;
}

// Combined for convenience
interface ITimeEntryRepository extends ITimeEntryReader, ITimeEntryWriter {}
```

#### 5.2 Split Service Interfaces

**Current:** `ScheduleService` has 10+ methods

**Proposed:**
```typescript
// Query operations
interface IScheduleQueryService {
  getTodaySchedule(location?: string): Promise<TimeEntry | null>;
  getTomorrowSchedule(location?: string): Promise<TimeEntry | null>;
  getFullSchedule(location?: string): Promise<TimeEntry[]>;
  getScheduleByDateRange(startDate: string, endDate: string, location?: string): Promise<TimeEntry[]>;
}

// Display operations
interface IScheduleDisplayService {
  getTodayOrNextDaySchedule(location?: string): Promise<TimeEntry | null>;
  getScheduleDisplayData(location?: string): Promise<ScheduleDisplayData>;
}

// Admin operations
interface IScheduleAdminService {
  updateTimeEntry(id: string, data: {...}): Promise<TimeEntry>;
  deleteTimeEntry(id: string): Promise<void>;
  getTimeEntryById(id: string): Promise<TimeEntry | null>;
}
```

### Phase 6: Apply Dependency Inversion Principle

**Goal:** Depend on abstractions, not concretions

#### 6.1 Create Service Container / DI Container

**Create dependency injection system:**
```typescript
// lib/di/
├── index.ts
├── container.ts
├── service-identifiers.ts
└── service-bindings.ts
```

**Usage:**
```typescript
// Instead of:
const service = new ScheduleService(repo, calc, uploadRepo);

// Use:
const service = container.get<IScheduleService>(SERVICE_IDS.SCHEDULE);
```

#### 6.2 Abstract Prisma Dependencies

**Create data source abstraction:**
```typescript
// lib/data-sources/prisma-data-source.ts
export class PrismaDataSource implements IDataSource {
  async find<T>(model: string, query: any): Promise<T | null> { ... }
  async findMany<T>(model: string, query: any): Promise<T[]> { ... }
  async create<T>(model: string, data: any): Promise<T> { ... }
  async update<T>(model: string, id: string, data: any): Promise<T> { ... }
  async delete(model: string, id: string): Promise<void> { ... }
}
```

### Phase 7: Improve Next.js Best Practices

#### 7.1 Server Actions Refactoring

**Current:** Actions mixed with business logic

**Proposed:**
```
features/schedule/actions/
├── index.ts                    # Public exports
├── schedule.actions.ts         # Thin wrappers around use cases
└── cache.actions.ts            # Cache invalidation actions
```

**Example:**
```typescript
// features/schedule/actions/schedule.actions.ts
"use server";

import { container } from '@/lib/di';
import { SERVICE_IDS } from '@/lib/di/service-identifiers';

export async function getTodaySchedule(location?: string) {
  const service = container.get<IScheduleQueryService>(SERVICE_IDS.SCHEDULE_QUERY);
  return await service.getTodaySchedule(location);
}
```

#### 7.2 Improve Server Components Usage

**Separate server and client components clearly:**
```
components/
├── server/                     # Server Components
│   ├── schedule-data-provider.tsx
│   └── location-data-provider.tsx
├── client/                     # Client Components
│   ├── interactive-elements/
│   └── forms/
└── shared/                     # Can be either (marked explicitly)
```

#### 7.3 Unified Caching Strategy

**Create centralized cache manager:**
```typescript
// lib/cache/cache-manager.ts
export class CacheManager {
  private static instance: CacheManager;
  
  static getInstance(): CacheManager { ... }
  
  async get<T>(key: string): Promise<T | null> { ... }
  async set<T>(key: string, value: T, ttl?: number): Promise<void> { ... }
  async invalidate(pattern: string): Promise<void> { ... }
  async invalidateTags(tags: string[]): Promise<void> { ... }
}
```

#### 7.4 Improved Route Organization

**Restructure for clarity:**
```
app/
├── (public)/                   # Public routes
│   ├── page.tsx
│   ├── calendar/
│   └── location/
├── (admin)/                    # Admin routes (protected)
│   ├── dashboard/
│   └── upload/
├── (auth)/                     # Auth routes
│   └── login/
└── api/                        # API routes
    ├── schedule/
    ├── cache/
    └── health/
```

### Phase 8: Clean Code Improvements

#### 8.1 Extract Helper Functions

**Create utility modules:**
```
lib/utils/
├── index.ts
├── time.utils.ts               # Time-related utilities
├── date.utils.ts               # Date-related utilities
├── validation.utils.ts         # Validation helpers
└── format.utils.ts             # Formatting helpers
```

#### 8.2 Improve Function Names

**Before:**
```typescript
function getScheduleDisplayDataUncached(location?: string | null) { ... }
```

**After:**
```typescript
async function fetchScheduleDisplayData(location?: string): Promise<ScheduleDisplayData> { ... }
```

#### 8.3 Reduce Function Parameters

**Use parameter objects:**
```typescript
// Before
function fetchSchedule(location: string, startDate: string, endDate: string, includeStats: boolean) { ... }

// After
interface ScheduleQueryParams {
  location?: string;
  dateRange?: { start: string; end: string };
  includeStats?: boolean;
}

function fetchSchedule(params: ScheduleQueryParams) { ... }
```

#### 8.4 Consistent Error Handling

**Create error handling decorator:**
```typescript
// lib/decorators/with-error-handling.ts
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error('Operation failed', { args }, error as Error);
      throw toAppError(error);
    }
  };
}
```

### Phase 9: Testing Infrastructure

**Add test utilities for better testability:**

```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── user-flows/
```

**Create test doubles:**
```typescript
tests/mocks/
├── mock-time-entry.repository.ts
├── mock-schedule.service.ts
└── mock-cache-manager.ts
```

---

## Implementation Order

### Priority 1 (High Impact, Low Risk)
1. ✅ Extract constants and configuration
2. ✅ Create utility modules
3. ✅ Improve function names and reduce parameters

### Priority 2 (Medium Impact, Medium Risk)
4. ✅ Refactor `actions/time-entries.ts` into smaller modules
5. ✅ Split large interfaces (ISP)
6. ✅ Improve error handling consistency

### Priority 3 (High Impact, Higher Risk)
7. ✅ Refactor `app/page.tsx` into smaller components
8. ✅ Refactor `lib/api/prayer-time-api.ts`
9. ✅ Implement strategy pattern for status badges

### Priority 4 (Foundation for Future)
10. ✅ Create dependency injection container
11. ✅ Abstract Prisma dependencies
12. ✅ Improve caching strategy

---

## File Structure After Refactoring

```
ramadan-clock/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Thin page component
│   │   ├── components/
│   │   │   ├── hero-section.tsx
│   │   │   ├── sehri-iftar-cards.tsx
│   │   │   ├── hadith-card.tsx
│   │   │   └── quick-links.tsx
│   │   ├── calendar/
│   │   └── location/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   └── upload/
│   ├── (auth)/
│   │   └── login/
│   └── api/
│       ├── schedule/
│       ├── cache/
│       └── health/
├── components/
│   ├── server/                         # Server Components
│   ├── client/                         # Client Components
│   ├── shared/                         # Shared Components
│   ├── ui/                             # UI primitives
│   └── seo/                            # SEO components
├── features/
│   └── schedule/
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   └── types/
│       ├── repositories/
│       ├── services/
│       │   ├── schedule.service.ts
│       │   ├── time-formatter.service.ts    # NEW
│       │   └── time-calculator.service.ts
│       ├── use-cases/
│       └── actions/                    # NEW: Server Actions
│           ├── index.ts
│           ├── schedule.actions.ts
│           └── cache.actions.ts
├── lib/
│   ├── api/
│   │   ├── prayer-time/                # NEW: Modularized
│   │   │   ├── index.ts
│   │   │   ├── prayer-time-api-client.ts
│   │   │   ├── prayer-time-cache.ts
│   │   │   ├── prayer-time-processor.ts
│   │   │   ├── prayer-time-filter.ts
│   │   │   └── prayer-time-retry.ts
│   │   ├── external-api-client.ts
│   │   └── middleware.ts
│   ├── cache/
│   │   ├── cache-manager.ts            # NEW: Unified cache
│   │   └── ...
│   ├── constants/                     # NEW: Centralized constants
│   │   ├── index.ts
│   │   ├── time.constants.ts
│   │   ├── cache.constants.ts
│   │   ├── validation.constants.ts
│   │   └── ui.constants.ts
│   ├── config/
│   │   └── ...
│   ├── data-sources/                   # NEW: Data source abstraction
│   │   ├── index.ts
│   │   ├── data-source.interface.ts
│   │   └── prisma-data-source.ts
│   ├── di/                             # NEW: Dependency injection
│   │   ├── index.ts
│   │   ├── container.ts
│   │   ├── service-identifiers.ts
│   │   └── service-bindings.ts
│   ├── decorators/                     # NEW: Function decorators
│   │   ├── index.ts
│   │   └── with-error-handling.ts
│   ├── errors/
│   │   └── ...
│   ├── guards/
│   │   └── ...
│   ├── logger/
│   │   └── ...
│   ├── parsers/
│   │   └── ...
│   └── utils/
│       ├── index.ts
│       ├── time.utils.ts              # NEW
│       ├── date.utils.ts              # NEW
│       ├── validation.utils.ts        # NEW
│       └── format.utils.ts            # NEW
├── tests/                              # NEW: Test structure
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── plans/
    └── refactoring-plan.md
```

---

## Success Criteria

### Code Quality Metrics
- ✅ Maximum function length: 50 lines
- ✅ Maximum file length: 300 lines (excluding generated files)
- ✅ Cyclomatic complexity: < 10 per function
- ✅ No code duplication (DRY principle)
- ✅ 100% TypeScript strict mode compliance

### SOLID Compliance
- ✅ Single Responsibility: Each class/function has one reason to change
- ✅ Open/Closed: Extensible without modification
- ✅ Liskov Substitution: Subtypes can replace base types
- ✅ Interface Segregation: Focused, client-specific interfaces
- ✅ Dependency Inversion: Depend on abstractions

### Next.js Best Practices
- ✅ Clear separation of Server/Client components
- ✅ Proper use of Server Actions
- ✅ Consistent caching strategy
- ✅ Optimized data fetching patterns
- ✅ Proper error boundaries

### Maintainability
- ✅ Clear, descriptive names
- ✅ Minimal dependencies between modules
- ✅ Easy to test (high testability)
- ✅ Well-documented code
- ✅ Consistent code style

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Incremental refactoring, thorough testing |
| Performance regression | Medium | Benchmark before/after, optimize hot paths |
| Increased complexity | Medium | Keep changes simple, document thoroughly |
| Time overruns | Low | Prioritize high-impact, low-risk changes first |

---

## Notes

- **No functionality changes**: This refactoring is purely internal
- **No UI changes**: All visual output remains identical
- **Incremental approach**: Changes will be made in small, testable increments
- **Backward compatibility**: Public APIs will remain compatible
- **Documentation**: All new modules will include clear documentation
