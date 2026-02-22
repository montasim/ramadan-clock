# Fix Plan: Automated Upload SQL Parameter Error

## Problem Summary

The automated upload is failing with a Prisma error:
```
Raw query failed. Code: `08P01`. Message: `bind message supplies 1 parameters, but prepared statement "" requires 1792`
```

## Root Cause Analysis

### Issue 1: Incorrect SQL Parameter Construction in `actions/upload.ts`

**Location:** [`actions/upload.ts`](actions/upload.ts:131-143)

**Current Problematic Code:**
```typescript
const values = uniqueEntries.map((entry, index) => {
  const i = index + 1;
  return `($${i}::text, $${i}::text, $${i}::text, $${i}::text, NOW())`;
}).join(', ');

const placeholders = uniqueEntries.map((entry, index) => {
  const i = index + 1;
  return `$${i}::text, $${i}::text, $${i}::text, $${i}::text, NOW()`;
}).join(', ');

const sql = 'INSERT INTO "TimeEntry" (date, sehri, iftar, location, "createdAt") VALUES ' + values + ' ON CONFLICT (date, location) DO UPDATE SET sehri = EXCLUDED.sehri, iftar = EXCLUDED.iftar RETURNING id';

await prisma.$executeRawUnsafe(sql, placeholders);
```

**Problems:**
1. **Wrong placeholder numbering:** Each entry uses the same placeholder number (e.g., `$1, $1, $1, $1`), which would reuse the same value for all fields
2. **Wrong parameter count:** For 1792 entries, each with 4 fields, we need 1792 × 4 = 7168 unique placeholders
3. **Wrong data type:** `placeholders` is a string, but `$executeRawUnsafe` expects an array of values
4. **Wrong SQL structure:** The placeholders are included in the SQL string instead of being passed as parameters

**Expected Behavior:**
- SQL should contain sequential placeholders: `$1, $2, $3, $4, $5, $6, $7, $8, ...`
- Values should be passed as a flat array: `[date1, sehri1, iftar1, location1, date2, sehri2, iftar2, location2, ...]`
- Each placeholder in SQL should map to a unique value in the array

### Issue 2: Data Transformation Clarification

**Current Flow:**
1. API returns: `{ sehri: "05:14 (+06)", iftar: "17:54 (+06)" }`
2. [`PrayerTimeProcessorService.convertToTimeEntry()`](lib/services/prayer-time-processor.service.ts:59-68) strips timezone via [`stripTimezoneOffset()`](lib/services/prayer-time-processor.service.ts:37-53)
3. Result: `{ sehri: "05:14", iftar: "17:54" }`

**Status:** This is **working correctly**. The timezone stripping is intentional and the processor logs show both the raw API data and the processed entry for debugging.

## Solution

### Fix the SQL Parameter Construction in `actions/upload.ts`

Replace lines 131-143 with corrected code that:
1. Creates a flat array of all values
2. Uses sequential numbered placeholders in SQL
3. Passes the array of values to `$executeRawUnsafe`

**Corrected Code:**
```typescript
// Create a flat array of all values
const valuesArray: any[] = [];
uniqueEntries.forEach(entry => {
  valuesArray.push(entry.date, entry.sehri, entry.iftar, entry.location);
});

// Create placeholder string with sequential numbering
const placeholders = uniqueEntries.map((_, index) => {
  const baseIndex = index * 4 + 1;
  return `($${baseIndex}::text, $${baseIndex + 1}::text, $${baseIndex + 2}::text, $${baseIndex + 3}::text, NOW())`;
}).join(', ');

const sql = 'INSERT INTO "TimeEntry" (date, sehri, iftar, location, "createdAt") VALUES ' + placeholders + ' ON CONFLICT (date, location) DO UPDATE SET sehri = EXCLUDED.sehri, iftar = EXCLUDED.iftar RETURNING id';

await prisma.$executeRawUnsafe(sql, ...valuesArray);
```

**Key Changes:**
1. **`valuesArray`**: Flat array containing all values in order: `[date1, sehri1, iftar1, location1, date2, sehri2, iftar2, location2, ...]`
2. **`placeholders`**: SQL string with sequential placeholders: `($1, $2, $3, $4, NOW()), ($5, $6, $7, $8, NOW()), ...`
3. **Parameter passing**: Use spread operator `...valuesArray` to pass array elements as individual parameters

## Testing Plan

After implementing the fix:
1. Test with a small batch (e.g., 10 entries) to verify the fix works
2. Test with the full 1792 entries to ensure performance is acceptable
3. Verify that the ON CONFLICT DO UPDATE logic still works correctly
4. Check that the upload log is created properly
5. Verify cache revalidation works

## Files to Modify

- [`actions/upload.ts`](actions/upload.ts:131-143) - Fix the SQL parameter construction

## Impact Assessment

- **Risk:** Low - This is a straightforward fix to parameter passing
- **Breaking Changes:** None - The function signature and behavior remain the same
- **Performance:** Should improve slightly due to correct parameter binding
- **Backward Compatibility:** Fully maintained
