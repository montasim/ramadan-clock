# Moment Migration Plan

## Overview
Replace all custom time/date wrapper code with direct moment.js usage. This involves removing value objects (`TimeVO`, `DateVO`) and utility wrappers (`time.utils.ts`, `date.utils.ts`) and updating all consuming code to use moment directly.

## Current State Analysis

### Files Using Custom Wrappers
1. **Value Objects** (to be removed):
   - `features/schedule/domain/value-objects/time.vo.ts` - 114 lines
   - `features/schedule/domain/value-objects/date.vo.ts` - 127 lines

2. **Utility Wrappers** (to be removed):
   - `lib/utils/time.utils.ts` - 120 lines
   - `lib/utils/date.utils.ts` - 164 lines

3. **Files Consuming These Wrappers** (need updates):
   - `features/schedule/domain/entities/time-entry.entity.ts`
   - `features/schedule/services/time-calculator.service.ts`
   - `features/schedule/services/schedule.service.ts`
   - `actions/time-entries.ts`
   - `components/shared/countdown-timer.tsx`

### Current Usage Patterns

#### TimeVO Methods → Moment Equivalents
| TimeVO Method | Moment Equivalent |
|---------------|-------------------|
| `isValid(value)` | `moment(value, 'HH:mm', true).isValid()` |
| `to12HourFormat()` | `moment(value, 'HH:mm').format('h:mm A')` |
| `hasPassed()` | `moment().isSameOrAfter(targetMoment)` |
| `isWithinThreshold()` | Calculate diff and compare |
| `toDate()` | `moment(value, 'HH:mm').toDate()` with date context |
| `hours` | `moment(value, 'HH:mm').hours()` |
| `minutes` | `moment(value, 'HH:mm').minutes()` |

#### DateVO Methods → Moment Equivalents
| DateVO Method | Moment Equivalent |
|---------------|-------------------|
| `isValid(value)` | `moment(value, 'YYYY-MM-DD', true).isValid()` |
| `toDate()` | `moment(value).toDate()` |
| `isToday()` | `moment(value).isSame(moment(), 'day')` |
| `isTomorrow()` | `moment(value).isSame(moment().add(1, 'day'), 'day')` |
| `isPast()` | `moment(value).startOf('day').isBefore(moment().startOf('day'))` |
| `toDisplayFormat()` | `moment(value).format('dddd, MMMM D, YYYY')` |
| `toShortFormat()` | `moment(value).format('MMM D, YYYY')` |
| `fromDate(date)` | `moment(date).format('YYYY-MM-DD')` |
| `today()` | `moment().format('YYYY-MM-DD')` |
| `tomorrow()` | `moment().add(1, 'day').format('YYYY-MM-DD')` |

## Refactoring Strategy

### Phase 1: Update Entity Layer
**File**: `features/schedule/domain/entities/time-entry.entity.ts`

**Changes**:
1. Remove imports of `DateVO` and `TimeVO`
2. Change properties from value objects to primitive strings:
   - `date: DateVO` → `date: string`
   - `sehri: TimeVO` → `sehri: string`
   - `iftar: TimeVO` → `iftar: string`
3. Update constructor to store raw strings directly
4. Replace value object method calls with moment:
   - `this.sehri.hasPassed()` → `moment(this.sehri, 'HH:mm')...`
   - `this.iftar.hasPassed()` → `moment(this.iftar, 'HH:mm')...`
   - `this.date.isPast()` → `moment(this.date).isBefore(moment(), 'day')`
   - `this.date.isToday()` → `moment(this.date).isSame(moment(), 'day')`
   - `this.date.isTomorrow()` → `moment(this.date).isSame(moment().add(1, 'day'), 'day')`
5. Update `toFormattedDTO()` to use moment for formatting:
   - `this.sehri.to12HourFormat()` → `moment(this.sehri, 'HH:mm').format('h:mm A')`

### Phase 2: Update Service Layer
**File**: `features/schedule/services/time-calculator.service.ts`

**Changes**:
1. Update `calculateScheduleStatus()`:
   - Replace `entry.date.value` with `entry.date`
   - All moment calls remain the same (already using moment)

**File**: `features/schedule/services/schedule.service.ts`

**Changes**:
1. No changes needed - already using moment directly for date operations

### Phase 3: Update Actions Layer
**File**: `actions/time-entries.ts`

**Changes**:
1. Already using moment directly - no changes needed
2. Helper functions `hasIftarPassed()` and `hasSehriPassed()` already use moment

### Phase 4: Update Components
**File**: `components/shared/countdown-timer.tsx`

**Changes**:
1. Already using moment directly - no changes needed

### Phase 5: Remove Wrapper Files
Delete the following files:
1. `features/schedule/domain/value-objects/time.vo.ts`
2. `features/schedule/domain/value-objects/date.vo.ts`
3. `lib/utils/time.utils.ts`
4. `lib/utils/date.utils.ts`

### Phase 6: Update Exports
**File**: `features/schedule/domain/index.ts`

**Changes**:
1. Remove exports:
   - `export { DateVO } from './value-objects/date.vo';`
   - `export { TimeVO } from './value-objects/time.vo';`

## Implementation Order

1. ✅ Analyze current codebase
2. Update `time-entry.entity.ts` to use moment directly
3. Update `time-calculator.service.ts` (minimal changes)
4. Update `schedule.service.ts` (minimal changes)
5. Verify `actions/time-entries.ts` (already using moment)
6. Verify `components/shared/countdown-timer.tsx` (already using moment)
7. Remove `time.vo.ts`
8. Remove `date.vo.ts`
9. Remove `time.utils.ts`
10. Remove `date.utils.ts`
11. Update `features/schedule/domain/index.ts`
12. Run build to verify no compilation errors

## Risk Assessment

### Low Risk
- Services and actions already use moment directly
- Components already use moment directly
- Only entity layer needs significant changes

### Medium Risk
- Entity property types change from value objects to strings
- Need to ensure all consumers handle primitive strings correctly

### Mitigation
- Run TypeScript compiler to catch type errors
- Test all schedule-related functionality
- Verify time comparisons and formatting work correctly

## Benefits

1. **Reduced Code Complexity**: Removes 500+ lines of wrapper code
2. **Simplified Maintenance**: One less abstraction layer to maintain
3. **Consistent API**: Direct moment usage throughout codebase
4. **Better Performance**: Eliminates wrapper object instantiation overhead
5. **Clearer Intent**: moment API is well-known and documented

## Post-Migration Verification

After completing the migration, verify:
- [ ] TypeScript compilation succeeds
- [ ] All schedule pages display correctly
- [ ] Time formatting (12-hour/24-hour) works
- [ ] Countdown timer functions properly
- [ ] Schedule status calculations are accurate
- [ ] Date comparisons (today/tomorrow/past) work correctly
- [ ] Admin dashboard displays data correctly
