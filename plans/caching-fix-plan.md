# Caching Issue Fix Plan

## Problem Analysis

### Current Issue
When iftar time has passed, the "Today's Schedule" page still displays today's times instead of automatically switching to show tomorrow's schedule. This is caused by caching that prevents real-time updates.

### Root Cause
The time-sensitive logic (checking if iftar has passed) is being cached with a 5-minute TTL, which means:

1. **[`getScheduleDisplayData()`](actions/time-entries.ts:156-163)** is cached for 300 seconds
2. This function determines `iftarPassed` status by calling [`hasTimePassed(todayEntry.iftar)`](lib/utils/time.utils.ts:39-48)
3. Once cached, the `iftarPassed` flag remains stale until the cache expires
4. Users continue seeing "Today's Schedule" even after iftar time has passed

### Affected Components
- **Server Actions**:
  - [`getScheduleDisplayData()`](actions/time-entries.ts:156-163) - 5 min cache
  - [`getTodayOrNextDaySchedule()`](actions/time-entries.ts:97-104) - 5 min cache
  - [`getTodaySchedule()`](actions/time-entries.ts:54-61) - 5 min cache

- **Page Level**:
  - [`app/page.tsx`](app/page.tsx:23) - ISR with 300 second revalidation

### Cache Configuration
From [`lib/constants/cache.constants.ts`](lib/constants/cache.constants.ts:9-18):
```typescript
CACHE_TTL.SHORT: 300  // 5 minutes
```

## Proposed Solution

### Approach: Separate Data Caching from Time Status Checks

The key insight is that **schedule data** (sehri/iftar times) can be cached, but **time status** (whether iftar has passed) should be calculated in real-time.

### Implementation Strategy

#### 1. Create a New Time-Only Function
Create a new server action that ONLY checks time status without caching:
```typescript
// New function in actions/time-entries.ts
export async function getTimeStatus(location?: string | null) {
  const today = getCurrentDate();
  const where = location ? { date: today, location } : { date: today };
  const todayEntry = await prisma.timeEntry.findFirst({ where });

  if (!todayEntry) {
    return { sehriPassed: false, iftarPassed: false };
  }

  return {
    sehriPassed: hasTimePassed(todayEntry.sehri),
    iftarPassed: hasTimePassed(todayEntry.iftar),
  };
}
```

#### 2. Modify getScheduleDisplayData to Remove Time Status
Keep the cached version but remove the time status calculation:
```typescript
async function getScheduleDisplayDataUncached(location?: string | null) {
  const today = getCurrentDate();
  const tomorrow = moment().tz(timezone).add(1, 'day').format('YYYY-MM-DD');

  const todayEntry = await prisma.timeEntry.findFirst({
    where: location ? { date: today, location } : { date: today }
  });

  const tomorrowEntry = await prisma.timeEntry.findFirst({
    where: location ? { date: tomorrow, location } : { date: tomorrow }
  });

  return {
    today: todayEntry ? formatTimeEntry(todayEntry) : null,
    tomorrow: tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null,
    // NOTE: Time status removed - will be calculated client-side or separately
  };
}
```

#### 3. Update Page Component to Combine Data + Time Status
In [`app/page.tsx`](app/page.tsx:25-35), modify to fetch both:
```typescript
async function TodayScheduleContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const selectedLocation = location || "Rangpur";

  // Fetch cached schedule data
  const scheduleData = await getScheduleDisplayData(selectedLocation);
  // Fetch real-time time status (uncached)
  const timeStatus = await getTimeStatus(selectedLocation);

  const locations = await getLocations();
  const hadith = await getRandomHadith();

  // Combine for display
  const displayData = {
    ...scheduleData,
    ...timeStatus,
  };

  // Rest of component uses displayData instead of scheduleData
}
```

#### 4. Alternative: Client-Side Time Status (Recommended)
For better UX, calculate time status on the client using the countdown timer component:

**Pros**:
- Zero server-side caching issues
- Instant updates when time passes
- Better for countdown timers

**Implementation**:
- Server sends both today's and tomorrow's schedules (cached)
- Client component checks current time and decides which to display
- Countdown timer can trigger re-renders when time passes

### Detailed Implementation Steps

#### Step 1: Create Time Status Server Action
- Add `getTimeStatus()` function in [`actions/time-entries.ts`](actions/time-entries.ts)
- This function should NOT be cached
- Returns only `sehriPassed` and `iftarPassed` flags

#### Step 2: Modify getScheduleDisplayData
- Remove time status calculation from [`getScheduleDisplayDataUncached()`](actions/time-entries.ts:110-153)
- Keep returning `today` and `tomorrow` schedules
- Maintain caching for schedule data (5 min is fine)

#### Step 3: Update Page Component
- Import and call `getTimeStatus()` in [`TodayScheduleContent()`](app/page.tsx:25)
- Merge time status with schedule data
- Use merged data for all conditional rendering

#### Step 4: Update Page-Level Caching
- Consider reducing [`app/page.tsx`](app/page.tsx:23) ISR from 300 to 60 seconds
- Or remove ISR entirely since we're handling time status dynamically

### Alternative Approaches Considered

#### Option A: Reduce Cache Duration to 30-60 Seconds
**Pros**: Simple change
**Cons**: Still has delay, increased server load

#### Option B: Remove Caching Entirely
**Pros**: Always fresh data
**Cons**: Performance degradation, unnecessary DB queries

#### Option C: Time-Based Cache Invalidation
**Pros**: Efficient
**Cons**: Complex to implement, requires background jobs

#### Option D: Client-Side Only Time Status (Selected)
**Pros**: Best UX, no caching issues, instant updates
**Cons**: Requires client-side time calculation (already done for countdown)

### Recommended Solution

**Use Option D (Client-Side Time Status)** with the following approach:

1. **Server sends both today and tomorrow schedules** (cached)
2. **Client calculates time status** using the countdown timer logic
3. **No server-side caching of time status**
4. **Instant UI updates** when iftar time passes

This leverages the existing [`CountdownTimer`](components/shared/countdown-timer.tsx) component and provides the best user experience.

### Files to Modify

1. **`actions/time-entries.ts`**
   - Modify `getScheduleDisplayDataUncached()` to remove time status
   - Optionally add `getTimeStatus()` for hybrid approach

2. **`app/page.tsx`**
   - Update `TodayScheduleContent()` to handle time status
   - Consider reducing page-level ISR duration

3. **`components/shared/countdown-timer.tsx`** (if needed)
   - May need to expose time status to parent component

### Testing Strategy

1. **Test before iftar time**: Verify today's schedule displays
2. **Test after iftar time**: Verify tomorrow's schedule displays
3. **Test cache behavior**: Ensure schedule data is still cached
4. **Test time transition**: Verify smooth transition when iftar passes
5. **Test with different locations**: Ensure location-specific caching works

### Performance Impact

- **Positive**: Reduced unnecessary cache invalidations
- **Neutral**: Same number of DB queries (cached schedule data)
- **Positive**: Better UX with instant time-based updates

### Migration Path

1. Implement changes in development
2. Test thoroughly with various time scenarios
3. Deploy to staging
4. Monitor cache hit rates and performance
5. Deploy to production

### Rollback Plan

If issues arise:
1. Revert to original `getScheduleDisplayData` implementation
2. Restore time status calculation in server action
3. Keep existing cache configuration
