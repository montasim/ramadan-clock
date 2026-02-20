# Fix Timezone and Cache Issues for Iftar Time Detection

## Problem Statement

The application is not correctly detecting when iftar time has passed. For the scenario:
- Date: Friday, February 20, 2026
- Iftar time: 6:00 PM (18:00)
- Current time: 7:33 PM (19:33)

The expected behavior is to show "Tomorrow's Schedule" but it's not working.

## Root Causes Identified

### 1. **Timezone Issue (Primary Issue)**

**Location:** [`actions/time-entries.ts`](actions/time-entries.ts:65-88)

The functions `hasIftarPassed()` and `hasSehriPassed()` use `moment()` without timezone specification:

```typescript
function hasIftarPassed(todaySchedule: TimeEntry): boolean {
  const now = moment(); // ❌ Uses server's local time, not configured timezone
  const iftarTime = moment(todaySchedule.iftar, 'HH:mm');
  iftarTime.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });
  return now.isSameOrAfter(iftarTime);
}
```

**Problems:**
- The application has a configured timezone in [`lib/config/index.ts`](lib/config/index.ts:9): `'Asia/Dhaka'` (UTC+6)
- However, this timezone is **never used** in the time comparison logic
- `moment()` without timezone specification uses the **server's local time**
- If the server is running in UTC or a different timezone, comparisons will be incorrect
- `moment-timezone` package is **not installed**, so named timezones cannot be used

**Example Scenario:**
- Server timezone: UTC
- Configured timezone: Asia/Dhaka (UTC+6)
- Current time in UTC: 13:33 (7:33 PM in Dhaka)
- Iftar time: 18:00 (6:00 PM in Dhaka)
- Comparison: 13:33 < 18:00 → `hasIftarPassed()` returns `false` ❌
- Expected: 19:33 >= 18:00 → `hasIftarPassed()` should return `true` ✅

### 2. **Cache Issue (Secondary Issue)**

**Location:** [`lib/cache/cache-config.ts`](lib/cache/cache-config.ts:54-56)

The schedule data is cached for 60 seconds:

```typescript
todaySchedule: {
  duration: CACHE_DURATIONS.SHORT, // 60 seconds
  tags: [CACHE_TAGS.SCHEDULE],
}
```

**Problems:**
- During testing or rapid time changes, cached data may not reflect the current time status
- The cache key doesn't include the current time, so it returns stale time status

### 3. **Time Format Inconsistency**

**Location:** [`actions/time-entries.ts`](actions/time-entries.ts:17-26)

The code handles both 12-hour and 24-hour formats:

```typescript
function formatTimeEntry(entry: TimeEntry): FormattedTimeEntry {
  return {
    ...entry,
    sehri: moment(entry.sehri, 'HH:mm').format('h:mm A'), // Converts to 12-hour
    iftar: moment(entry.iftar, 'HH:mm').format('h:mm A'),
    sehri24: entry.sehri, // Preserves 24-hour
    iftar24: entry.iftar,
  };
}
```

**Problems:**
- Database stores times in 24-hour format (`HH:mm`)
- Display uses 12-hour format (`h:mm A`)
- The comparison logic uses the original 24-hour format (correct)
- However, there's no validation that the stored times are in the correct format

## Solution Plan

### Phase 1: Fix Timezone Handling (Critical)

#### Option A: Use moment-timezone (Recommended)

**Steps:**
1. Install `moment-timezone` package:
   ```bash
   pnpm add moment-timezone
   ```

2. Update [`actions/time-entries.ts`](actions/time-entries.ts) to use configured timezone:
   ```typescript
   import moment from 'moment-timezone';
   import { APP_CONFIG } from '@/lib/config';

   function hasIftarPassed(todaySchedule: TimeEntry): boolean {
     const now = moment().tz(APP_CONFIG.timezone); // ✅ Use configured timezone
     const iftarTime = moment.tz(todaySchedule.iftar, 'HH:mm', APP_CONFIG.timezone);
     iftarTime.set({
       year: now.year(),
       month: now.month(),
       date: now.date(),
     });
     return now.isSameOrAfter(iftarTime);
   }

   function hasSehriPassed(todaySchedule: TimeEntry): boolean {
     const now = moment().tz(APP_CONFIG.timezone); // ✅ Use configured timezone
     const sehriTime = moment.tz(todaySchedule.sehri, 'HH:mm', APP_CONFIG.timezone);
     sehriTime.set({
       year: now.year(),
       month: now.month(),
       date: now.date(),
     });
     return now.isSameOrAfter(sehriTime);
   }
   ```

3. Update all `moment()` calls in [`actions/time-entries.ts`](actions/time-entries.ts) to use timezone:
   - Line 31: `const today = moment().tz(APP_CONFIG.timezone).format('YYYY-MM-DD');`
   - Line 96: `const tomorrow = moment().tz(APP_CONFIG.timezone).add(1, 'day').format('YYYY-MM-DD');`
   - Line 138: `const today = moment().tz(APP_CONFIG.timezone).format('YYYY-MM-DD');`
   - Line 139: `const tomorrow = moment().tz(APP_CONFIG.timezone).add(1, 'day').format('YYYY-MM-DD');`

4. Update [`app/page.tsx`](app/page.tsx:36-37) to use timezone:
   ```typescript
   const today = moment().tz(APP_CONFIG.timezone).format('YYYY-MM-DD');
   const todayDisplay = moment().tz(APP_CONFIG.timezone).format("dddd, MMMM D, YYYY");
   ```

#### Option B: Use UTC Offset (Alternative)

If you prefer not to add `moment-timezone`, use UTC offset:

```typescript
import moment from 'moment';
import { APP_CONFIG } from '@/lib/config';

// Get UTC offset for Asia/Dhaka (UTC+6)
const TIMEZONE_OFFSET = 6; // hours

function hasIftarPassed(todaySchedule: TimeEntry): boolean {
  const now = moment().utcOffset(TIMEZONE_OFFSET);
  const iftarTime = moment(todaySchedule.iftar, 'HH:mm').utcOffset(TIMEZONE_OFFSET);
  iftarTime.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });
  return now.isSameOrAfter(iftarTime);
}
```

**Pros:** No additional dependency
**Cons:** Less flexible, requires manual offset updates for DST (if applicable)

### Phase 2: Address Cache Issues

#### Option A: Reduce Cache Duration (Quick Fix)

Update [`lib/cache/cache-config.ts`](lib/cache/cache-config.ts:54-56):

```typescript
todaySchedule: {
  duration: 10, // 10 seconds instead of 60
  tags: [CACHE_TAGS.SCHEDULE],
}
```

#### Option B: Use Time-Based Cache Invalidation (Recommended)

Create a time-based cache key that includes the current hour/minute:

```typescript
// In actions/time-entries.ts
function getTimeBasedCacheKey() {
  const now = moment().tz(APP_CONFIG.timezone);
  return `schedule-${now.format('YYYY-MM-DD-HH')}`; // Changes every hour
}

export const getScheduleDisplayData = unstable_cache(
  async (location?: string | null) => {
    const cacheKey = getTimeBasedCacheKey();
    return getScheduleDisplayDataUncached(location);
  },
  ['schedule-display-data', getTimeBasedCacheKey()], // Dynamic cache key
  {
    revalidate: CACHE_CONFIG.todaySchedule.duration,
    tags: [CACHE_TAGS.SCHEDULE],
  }
);
```

#### Option C: Disable Cache for Time-Sensitive Operations (Testing Only)

For testing purposes, temporarily disable caching:

```typescript
export const getScheduleDisplayData = unstable_cache(
  async (location?: string | null) => getScheduleDisplayDataUncached(location),
  ['schedule-display-data'],
  {
    revalidate: 0, // No caching
    tags: [CACHE_TAGS.SCHEDULE],
  }
);
```

### Phase 3: Add Time Format Validation

Add validation to ensure times are stored in correct format:

```typescript
// In actions/time-entries.ts or a new validation file
function validateTimeFormat(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

// Use when creating/updating entries
if (!validateTimeFormat(sehri) || !validateTimeFormat(iftar)) {
  throw new Error('Invalid time format. Use HH:mm format (24-hour)');
}
```

### Phase 4: Add Logging for Debugging

Add logging to track time comparisons:

```typescript
function hasIftarPassed(todaySchedule: TimeEntry): boolean {
  const now = moment().tz(APP_CONFIG.timezone);
  const iftarTime = moment.tz(todaySchedule.iftar, 'HH:mm', APP_CONFIG.timezone);
  iftarTime.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });

  console.log('Time comparison:', {
    now: now.format('YYYY-MM-DD HH:mm:ss'),
    iftarTime: iftarTime.format('YYYY-MM-DD HH:mm:ss'),
    timezone: APP_CONFIG.timezone,
    passed: now.isSameOrAfter(iftarTime)
  });

  return now.isSameOrAfter(iftarTime);
}
```

## Implementation Priority

1. **High Priority (Critical):** Fix timezone handling (Phase 1)
2. **Medium Priority:** Address cache issues (Phase 2)
3. **Low Priority:** Add validation and logging (Phase 3-4)

## Testing Strategy

After implementing fixes, test with the following scenarios:

### Test Case 1: Iftar Passed
- Date: 2026-02-20
- Iftar time: 18:00
- Current time: 19:33
- Expected: `hasIftarPassed()` returns `true`, shows "Tomorrow's Schedule"

### Test Case 2: Iftar Not Passed
- Date: 2026-02-20
- Iftar time: 18:00
- Current time: 17:30
- Expected: `hasIftarPassed()` returns `false`, shows "Today's Schedule"

### Test Case 3: Sehri Passed, Iftar Not Passed
- Date: 2026-02-20
- Sehri time: 04:30
- Iftar time: 18:00
- Current time: 12:00
- Expected: `hasSehriPassed()` returns `true`, `hasIftarPassed()` returns `false`

### Test Case 4: Both Passed
- Date: 2026-02-20
- Sehri time: 04:30
- Iftar time: 18:00
- Current time: 19:33
- Expected: Both return `true`

### Test Case 5: Boundary Conditions
- Current time exactly equals iftar time: Should return `true` (isSameOrAfter)
- Current time 1 minute before iftar: Should return `false`

## Files to Modify

1. [`actions/time-entries.ts`](actions/time-entries.ts) - Main fix location
2. [`app/page.tsx`](app/page.tsx) - Update moment calls
3. [`lib/cache/cache-config.ts`](lib/cache/cache-config.ts) - Adjust cache duration
4. [`package.json`](package.json) - Add moment-timezone dependency

## Additional Considerations

1. **Server Timezone:** Ensure the server's timezone is set correctly or use the configured timezone consistently
2. **DST Handling:** If using Asia/Dhaka, note that Bangladesh doesn't observe DST, so UTC+6 is constant
3. **Client-Side Time:** The countdown timer component should also use the configured timezone
4. **Database Timezone:** PostgreSQL stores times without timezone, which is correct for this use case

## Rollback Plan

If issues arise after implementation:
1. Revert to original `moment()` calls without timezone
2. Restore original cache duration
3. Remove moment-timezone dependency

## Success Criteria

- ✅ `hasIftarPassed()` correctly returns `true` when current time >= iftar time
- ✅ `hasSehriPassed()` correctly returns `true` when current time >= sehri time
- ✅ UI correctly shows "Tomorrow's Schedule" after iftar time
- ✅ Countdown timer correctly counts down to iftar time
- ✅ Cache doesn't interfere with time-sensitive operations
- ✅ All test cases pass
