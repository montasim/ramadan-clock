# UI Improvements Plan: Location Selection and Display

## Overview

This plan outlines the changes needed to improve location selection and display across the application, focusing on default location behavior, alphabetical sorting, and dynamic updates.

## Current State Analysis

### Root Page (`/`)
- **Default:** Shows "All Locations" (no specific location selected)
- **Location Dropdown:** Unsorted list of all locations
- **Quick Links:** Shows 37 locations (should show all 64)
- **Data Fetching:** Uses `getScheduleDisplayData(null)` for all locations

### Calendar Page (`/calendar`)
- **Default:** Shows "All Locations" (no specific location selected)
- **Location Dropdown:** Unsorted list of all locations
- **Data Fetching:** Uses `getFullSchedule(null)` for all locations

### Location Page (`/location/[city]`)
- **Behavior:** Shows only the specific location's data (correct)
- **Data Fetching:** Uses `getFullSchedule(decodedCity)` for that location

### Data Fetching Actions
- **`getLocations()`**: Returns locations from database but does NOT sort them alphabetically
- **`getScheduleDisplayData()`**: Fetches today's and tomorrow's schedules
- **`getFullSchedule()`**: Fetches full schedule

## Required Changes

### 1. Update `getLocations()` Action

**File:** [`actions/time-entries.ts`](actions/time-entries.ts:247-271)

**Change:** Sort locations alphabetically before returning

**Current Code:**
```typescript
return result.map((r) => r.location!).filter(Boolean);
```

**Updated Code:**
```typescript
return result
  .map((r) => r.location!)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));
```

### 2. Root Page (`/`) - Set Default Location to Rangpur

**File:** [`app/page.tsx`](app/page.tsx:32-262)

**Changes:**

#### 2.1: Set Default Location
**Current:**
```typescript
const { location } = await searchParams;
const scheduleData = await getScheduleDisplayData(location || null);
```

**Updated:**
```typescript
const { location } = await searchParams;
const selectedLocation = location || "Rangpur"; // Default to Rangpur
const scheduleData = await getScheduleDisplayData(selectedLocation);
```

#### 2.2: Update Select Dropdown Default Value
**Current:**
```typescript
<Select defaultValue={location || "all"}>
```

**Updated:**
```typescript
<Select defaultValue={location || "Rangpur"}>
```

#### 2.3: Update SelectItem for "All Locations"
**Current:**
```typescript
<SelectItem value="all">All Locations</SelectItem>
```

**Updated:**
```typescript
<SelectItem value="">All Locations</SelectItem>
```

**Note:** Change value from "all" to empty string "" to match the null/undefined behavior

#### 2.4: Update DownloadButton Location Prop
**Current:**
```typescript
<DownloadButton location={location} type="today" ... />
```

**Updated:**
```typescript
<DownloadButton location={selectedLocation} type="today" ... />
```

#### 2.5: Quick Links - Show All Locations
**Current:** Already shows all locations from the `locations` array (no changes needed)

### 3. Calendar Page (`/calendar`) - Set Default Location to Rangpur

**File:** [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:32-129)

**Changes:**

#### 3.1: Set Default Location
**Current:**
```typescript
const { location } = await searchParams;
const schedule = await getFullSchedule(location || null);
```

**Updated:**
```typescript
const { location } = await searchParams;
const selectedLocation = location || "Rangpur"; // Default to Rangpur
const schedule = await getFullSchedule(selectedLocation);
```

#### 3.2: Update Select Dropdown Default Value
**Current:**
```typescript
<Select defaultValue={location || "all"}>
```

**Updated:**
```typescript
<Select defaultValue={location || "Rangpur"}>
```

#### 3.3: Update SelectItem for "All Locations"
**Current:**
```typescript
<SelectItem value="all">All Locations</SelectItem>
```

**Updated:**
```typescript
<SelectItem value="">All Locations</SelectItem>
```

#### 3.4: Update DownloadButton Location Prop
**Current:**
```typescript
<DownloadButton location={location} type="full" ... />
```

**Updated:**
```typescript
<DownloadButton location={selectedLocation} type="full" ... />
```

#### 3.5: Update Today Schedule Fetch
**Current:**
```typescript
const todaySchedule = await getTodayOrNextDaySchedule(location || null);
```

**Updated:**
```typescript
const todaySchedule = await getTodayOrNextDaySchedule(selectedLocation);
```

### 4. Location Page (`/location/[city]`) - No Changes Needed

**File:** [`app/(home)/location/[city]/page.tsx`](app/(home)/location/[city]/page.tsx:40-142)

**Status:** This page already correctly shows only the specific location's data. No changes needed.

### 5. Client-Side Location Selection (Optional Enhancement)

**Note:** The current implementation uses server-side rendering with search params. For a smoother user experience, consider adding client-side interactivity.

**Implementation Approach:**
- Create a client component that wraps the location dropdown
- Use `useSearchParams()` and `useRouter()` from `next/navigation`
- Update the URL when a location is selected
- This provides immediate feedback without page reload

**Example:**
```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function LocationSelector({ locations, currentLocation }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLocationChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete('location');
    } else {
      params.set('location', value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentLocation || ''} onValueChange={handleLocationChange}>
      {/* ... */}
    </Select>
  );
}
```

## Files to Modify

| File | Changes |
|------|---------|
| [`actions/time-entries.ts`](actions/time-entries.ts:247-271) | Sort locations alphabetically in `getLocations()` |
| [`app/page.tsx`](app/page.tsx:32-262) | Set default location to Rangpur, update dropdown and data fetching |
| [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:32-129) | Set default location to Rangpur, update dropdown and data fetching |

## Testing Checklist

After implementing the changes:

- [ ] Root page shows Rangpur data by default
- [ ] Root page location dropdown shows "Rangpur" as selected
- [ ] Root page locations are sorted alphabetically in dropdown and Quick Links
- [ ] Root page updates sehri/iftar cards when location is changed
- [ ] Root page updates "Today's Passed Schedule" section when location is changed
- [ ] Calendar page shows Rangpur data by default
- [ ] Calendar page location dropdown shows "Rangpur" as selected
- [ ] Calendar page locations are sorted alphabetically
- [ ] Calendar page updates schedule table when location is changed
- [ ] Location page still shows only the specific location's data
- [ ] All 64 locations are visible in Quick Links section
- [ ] "All Locations" option works correctly (shows data for all locations)

## Impact Assessment

- **Risk:** Low - Changes are straightforward and localized
- **Breaking Changes:** None - Default behavior change is an improvement
- **Performance:** No impact - Sorting 64 items is negligible
- **User Experience:** Significantly improved - Better default location and sorted lists

## Additional Considerations

1. **Caching:** The `getLocations()` function is already cached with `unstable_cache`. The sorting will be done once and cached.

2. **SEO:** Changing the default location to Rangpur may affect SEO. Consider if this is the desired default for all users.

3. **User Preferences:** In the future, consider storing user's preferred location in localStorage or cookies.

4. **Mobile Experience:** The Quick Links section with 64 locations may be overwhelming on mobile. Consider adding a search or filter.

## Implementation Order

1. Update `getLocations()` to sort alphabetically
2. Update root page to use Rangpur as default
3. Update calendar page to use Rangpur as default
4. Test all changes across the application

## Rollback Plan

If any issues arise:
1. Revert default location changes (change "Rangpur" back to null or "all")
2. Revert sorting in `getLocations()`
3. Clear Next.js cache to ensure changes take effect
