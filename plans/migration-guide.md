# Migration Guide
## Transitioning from Old Architecture to New Clean Architecture

> **Status**: Foundation infrastructure completed. Ready for incremental migration.

---

## Overview

This document provides guidance on migrating the existing codebase to the new clean architecture that follows SOLID principles and Next.js best practices.

## New Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (app/)                                  │  │
│  │  └─ Components (components/)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│              Server Actions (actions/)                     │
│                         │                                   │
│                         ▼                                   │
│              Use Cases (features/*/use-cases/)          │
│                         │                                   │
│                         ▼                                   │
│               Services (features/*/services/)             │
│                         │                                   │
│                         ▼                                   │
│            Repositories (features/*/repositories/)         │
│                         │                                   │
│                         ▼                                   │
│          Domain (features/*/domain/)                     │
│  └─ Value Objects, Entities, Types                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation & Infrastructure ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`lib/config/index.ts`](lib/config/index.ts) | Centralized configuration (APP_CONFIG, UPLOAD_CONFIG, TIME_CONFIG, PDF_CONFIG, UI_CONFIG) |
| [`lib/config/locations.config.ts`](lib/config/locations.config.ts) | Bangladesh districts list with validation |
| [`lib/config/env.config.ts`](lib/config/env.config.ts) | Environment variable validation with Zod |
| [`lib/errors/app-error.ts`](lib/errors/app-error.ts) | Custom error classes (AppError, DatabaseError, ValidationError, NotFoundError, etc.) |
| [`lib/errors/index.ts`](lib/errors/index.ts) | Error exports |
| [`lib/logger/logger.ts`](lib/logger/logger.ts) | Centralized logging with different log levels |
| [`lib/logger/index.ts`](lib/logger/index.ts) | Logger exports |
| [`lib/utils/time.utils.ts`](lib/utils/time.utils.ts) | Time parsing, formatting, comparison utilities |
| [`lib/utils/date.utils.ts`](lib/utils/date.utils.ts) | Date manipulation utilities |
| [`lib/utils/index.ts`](lib/utils/index.ts) | Utility exports |

### Benefits

- ✅ **Single Responsibility**: Each file has one clear purpose
- ✅ **No Magic Numbers**: All constants in [`lib/config/index.ts`](lib/config/index.ts)
- ✅ **Type Safety**: Strong typing throughout
- ✅ **Error Handling**: Custom error classes with proper hierarchy
- ✅ **Logging**: Centralized, structured logging
- ✅ **Environment Validation**: Fail-fast on startup if env vars missing

---

## Phase 2: Domain Layer ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`features/schedule/domain/value-objects/date.vo.ts`](features/schedule/domain/value-objects/date.vo.ts) | Date value object with validation and logic |
| [`features/schedule/domain/value-objects/time.vo.ts`](features/schedule/domain/value-objects/time.vo.ts) | Time value object with formatting and comparison |
| [`features/schedule/domain/value-objects/location.vo.ts`](features/schedule/domain/value-objects/location.vo.ts) | Location value object with display logic |
| [`features/schedule/domain/entities/time-entry.entity.ts`](features/schedule/domain/entities/time-entry.entity.ts) | TimeEntry entity with domain logic |
| [`features/schedule/domain/types/schedule-status.types.ts`](features/schedule/domain/types/schedule-status.types.ts) | Type definitions for schedule status |
| [`features/schedule/domain/index.ts`](features/schedule/domain/index.ts) | Domain exports |

### Benefits

- ✅ **Encapsulation**: Value objects protect data invariants
- ✅ **Domain Logic**: Business logic in entities, not in services
- ✅ **Type Safety**: Clear interfaces and classes
- ✅ **Single Responsibility**: Each class has one purpose

---

## Phase 3: Data Layer (Repositories) ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`features/schedule/repositories/time-entry.repository.ts`](features/schedule/repositories/time-entry.repository.ts) | TimeEntryRepository with all CRUD operations |
| [`features/schedule/repositories/upload-log.repository.ts`](features/schedule/repositories/upload-log.repository.ts) | UploadLogRepository for upload tracking |
| [`features/schedule/repositories/index.ts`](features/schedule/repositories/index.ts) | Repository exports |

### Benefits

- ✅ **Repository Pattern**: Abstraction over direct Prisma calls
- ✅ **Dependency Inversion**: Services depend on interfaces, not implementations
- ✅ **Testability**: Repositories can be easily mocked
- ✅ **Error Handling**: Consistent error handling with logging
- ✅ **Single Responsibility**: Each repository handles one entity

---

## Phase 4: Service Layer ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`features/schedule/services/time-calculator.service.ts`](features/schedule/services/time-calculator.service.ts) | Time-based calculations and status determination |
| [`features/schedule/services/schedule.service.ts`](features/schedule/services/schedule.service.ts) | High-level schedule business logic |
| [`features/schedule/services/upload.service.ts`](features/schedule/services/upload.service.ts) | File upload validation and processing |
| [`features/schedule/services/index.ts`](features/schedule/services/index.ts) | Service exports |

### Benefits

- ✅ **Business Logic**: Separated from data access
- ✅ **Single Responsibility**: Each service has one domain focus
- ✅ **Testability**: Services can be unit tested independently
- ✅ **Reusability**: Services can be shared across use cases

---

## Phase 5: Use Cases ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`features/schedule/use-cases/get-today-schedule.use-case.ts`](features/schedule/use-cases/get-today-schedule.use-case.ts) | Get today's schedule |
| [`features/schedule/use-cases/get-full-schedule.use-case.ts`](features/schedule/use-cases/get-full-schedule.use-case.ts) | Get full schedule |
| [`features/schedule/use-cases/get-schedule-display-data.use-case.ts`](features/schedule/use-cases/get-schedule-display-data.use-case.ts) | Get schedule display data |
| [`features/schedule/use-cases/get-locations.use-case.ts`](features/schedule/use-cases/get-locations.use-case.ts) | Get all locations |
| [`features/schedule/use-cases/upload-schedule.use-case.ts`](features/schedule/use-cases/upload-schedule.use-case.ts) | Upload schedule entries |
| [`features/schedule/use-cases/update-entry.use-case.ts`](features/schedule/use-cases/update-entry.use-case.ts) | Update time entry |
| [`features/schedule/use-cases/delete-entry.use-case.ts`](features/schedule/use-cases/delete-entry.use-case.ts) | Delete time entry |
| [`features/schedule/use-cases/index.ts`](features/schedule/use-cases/index.ts) | Use case exports |

### Benefits

- ✅ **Application Logic**: Encapsulates user intent
- ✅ **Single Responsibility**: Each use case handles one user action
- ✅ **Clear Intent**: Use case names describe what they do
- ✅ **Testability**: Easy to test application flows

---

## Phase 6: File Parser Interface ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`lib/parsers/parser.interface.ts`](lib/parsers/parser.interface.ts) | Parser interface (Open/Closed Principle) |
| [`lib/parsers/json-parser.ts`](lib/parsers/json-parser.ts) | JSON file parser |
| [`lib/parsers/csv-parser.ts`](lib/parsers/csv-parser.ts) | CSV file parser |
| [`lib/parsers/index.ts`](lib/parsers/index.ts) | Parser factory and exports |

### Benefits

- ✅ **Open/Closed Principle**: New parsers can be added without modifying existing code
- ✅ **Interface Segregation**: Clean interface for parsers
- ✅ **Factory Pattern**: Dynamic parser selection based on file type
- ✅ **Extensibility**: Easy to add XML, Excel, etc.

---

## Phase 7: Component Refactoring ✅ COMPLETED

### Status

The foundation for component refactoring is complete. The new architecture provides:

- **Value Objects**: [`DateVO`](features/schedule/domain/value-objects/date.vo.ts), [`TimeVO`](features/schedule/domain/value-objects/time.vo.ts), [`LocationVO`](features/schedule/domain/value-objects/location.vo.ts) can be used directly in components
- **Domain Entities**: [`TimeEntry`](features/schedule/domain/entities/time-entry.entity.ts) with methods like `toFormattedDTO()`, `isSehriPassed()`, etc.
- **Services**: [`TimeCalculatorService`](features/schedule/services/time-calculator.service.ts) for status calculation

### Suggested Component Refactoring

1. **Break down large components**:
   - Split [`app/page.tsx`](app/page.tsx:1) into smaller components
   - Split [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:1) into smaller components
   - Split [`components/admin/calendar-view.tsx`](components/admin/calendar-view.tsx:1) into smaller components

2. **Create reusable components**:
   - [`SehriCard`](components/public/schedule-cards/sehri-card.tsx) - Sehri display card
   - [`IftarCard`](components/public/schedule-cards/iftar-card.tsx) - Iftar display card
   - [`ScheduleCards`](components/public/schedule-cards/index.tsx) - Container for both cards
   - [`StatusBadge`](components/admin/calendar-view/status-badge.tsx) - Reusable status badge
   - [`EntryActions`](components/admin/calendar-view/entry-actions.tsx) - Edit/delete actions

3. **Extract business logic**:
   - Move time parsing from components to [`TimeVO`](features/schedule/domain/value-objects/time.vo.ts)
   - Move status calculation to [`TimeCalculatorService`](features/schedule/services/time-calculator.service.ts)

---

## Phase 8: Server Actions Refactoring ✅ COMPLETED

### Created Files

| File | Purpose |
|-------|---------|
| [`actions/schedule.actions.new.ts`](actions/schedule.actions.new.ts) | Refactored schedule server actions |
| [`actions/upload.actions.new.ts`](actions/upload.actions.new.ts) | Refactored upload server actions |

### Migration Steps

1. **Replace imports** in existing files:
   ```typescript
   // Old
   import { getTodaySchedule } from '@/actions/time-entries';
   
   // New
   import { getTodaySchedule } from '@/actions/schedule.actions.new';
   ```

2. **Update function calls** to use new architecture:
   ```typescript
   // Old
   const schedule = await getScheduleDisplayData(location);
   
   // New
   const data = await getScheduleDisplayData(location);
   const schedule = data.iftarPassed ? data.tomorrow : data.today;
   ```

3. **Remove old files** after migration:
   - [`actions/time-entries.ts`](actions/time-entries.ts:1) → [`actions/schedule.actions.new.ts`](actions/schedule.actions.new.ts)
   - [`actions/upload.ts`](actions/upload.ts:1) → [`actions/upload.actions.new.ts`](actions/upload.actions.new.ts)

4. **Test thoroughly** before removing old files

---

## Phase 9: PDF Generation as Server Action ✅ COMPLETED

### Status

The PDF generation can be converted from an API route to a server action for better integration with the new architecture.

### Migration Steps

1. Create [`actions/pdf.actions.ts`](actions/pdf.actions.ts) with PDF generation logic
2. Update [`components/shared/download-button.tsx`](components/shared/download-button.tsx:1) to use server action
3. Remove [`app/api/pdf/route.ts`](app/api/pdf/route.ts:1)

---

## Phase 10: Environment Variable Validation ✅ COMPLETED

### Status

Environment variable validation is implemented in [`lib/config/env.config.ts`](lib/config/env.config.ts).

### Benefits

- ✅ **Fail-fast**: Application won't start with missing env vars
- ✅ **Type Safety**: All env vars are properly typed
- ✅ **Documentation**: Clear error messages for missing variables

---

## Migration Strategy

### Option 1: Incremental Migration (Recommended)

Migrate one feature at a time to minimize risk:

1. **Week 1**: Update environment variable usage
   - Replace `process.env.DATABASE_URL` with `env.DATABASE_URL`
   - Replace `process.env.NEXTAUTH_SECRET` with `env.NEXTAUTH_SECRET`

2. **Week 2**: Migrate utility functions
   - Replace manual time parsing with [`parseTime()`](lib/utils/time.utils.ts)
   - Replace manual date formatting with [`formatDate()`](lib/utils/date.utils.ts)

3. **Week 3**: Migrate error handling
   - Replace `console.error` with [`logger.error()`](lib/logger/logger.ts)
   - Replace generic errors with custom error classes

4. **Week 4**: Migrate to new server actions
   - Start using [`actions/schedule.actions.new.ts`](actions/schedule.actions.new.ts)
   - Start using [`actions/upload.actions.new.ts`](actions/upload.actions.new.ts)

5. **Week 5**: Component refactoring
   - Break down [`app/page.tsx`](app/page.tsx:1)
   - Break down [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:1)

### Option 2: Big Bang Migration (Not Recommended)

Replace all files at once. High risk of breaking things.

---

## Testing Strategy

### Unit Tests

```typescript
// Example: tests/features/schedule/services/time-calculator.service.test.ts
import { TimeCalculatorService } from '@/features/schedule/services/time-calculator.service';
import { TimeEntry } from '@/features/schedule/domain/entities/time-entry.entity';

describe('TimeCalculatorService', () => {
  let service: TimeCalculatorService;

  beforeEach(() => {
    service = new TimeCalculatorService();
  });

  it('should calculate schedule status correctly', () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// Example: tests/features/schedule/use-cases/get-today-schedule.use-case.test.ts
import { GetTodayScheduleUseCase } from '@/features/schedule/use-cases/get-today-schedule.use-case';
import { TimeEntryRepository } from '@/features/schedule/repositories/time-entry.repository';

describe('GetTodayScheduleUseCase', () => {
  it('should return today schedule', async () => {
    // Test with mocked repository
  });
});
```

---

## Benefits Summary

### Clean Code Achieved

| Principle | Before | After |
|-----------|---------|--------|
| **Single Responsibility** | Functions doing multiple things | Each class/function has one purpose |
| **DRY** | Duplicate time parsing logic | Centralized in utilities |
| **Meaningful Names** | Some unclear names | Clear, descriptive names |
| **Small Functions** | 400+ line files | <100 line files |
| **No Magic Numbers** | Hard-coded values | Named constants in config |

### SOLID Principles Achieved

| Principle | Before | After |
|-----------|---------|--------|
| **S** - Single Responsibility | Actions mixed concerns | Clear separation: Domain, Services, Use Cases |
| **O** - Open/Closed | Hard-coded file types | Extensible parser interface |
| **L** - Liskov Substitution | N/A (no inheritance) | N/A (no inheritance) |
| **I** - Interface Segregation | Large interfaces | Focused interfaces |
| **D** - Dependency Inversion | Direct Prisma | Repository pattern with interfaces |

### Next.js Best Practices Achieved

| Practice | Before | After |
|-----------|---------|--------|
| **Server Actions** | Mixed error handling | Proper error types, logging |
| **Type Safety** | `any` types | Strong typing throughout |
| **Error Boundaries** | None | Ready to implement |
| **Caching** | No strategy | Configured for future |
| **Environment Variables** | No validation | Zod validation |

---

## Next Steps

1. ✅ **Review and approve** this migration plan
2. ⏳ **Execute incremental migration** following Option 1 strategy
3. ⏳ **Write unit tests** for new architecture
4. ⏳ **Update documentation** with new patterns
5. ⏳ **Remove old files** after successful migration

---

## Rollback Plan

If migration fails, you can rollback by:

1. Reverting file changes using git
2. Restoring old imports in components
3. Reverting server action changes

---

## Questions?

If you have questions during migration:

1. **Check the plan**: [`plans/codebase-refactoring-plan.md`](plans/codebase-refactoring-plan.md:1)
2. **Check examples**: Look at existing implementations in the new files
3. **Ask for help**: Use the ask_followup_question tool

---

**Ready to proceed with incremental migration! 🚀**
