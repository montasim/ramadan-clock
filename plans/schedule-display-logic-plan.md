# Schedule Display Logic Enhancement Plan

## Overview
Update the schedule display logic to provide better context about sehri and iftar times based on the current time of day.

## Requirements Summary

### Display Logic Based on Time of Day

#### Scenario 1: Before Sehri Time
- **Main Cards**: Show today's sehri and iftar (both active/upcoming)
- **Next Day's Schedule**: Not shown

#### Scenario 2: After Sehri, Before Iftar
- **Main Cards**: 
  - Sehri card with "passed" indicator (visual styling change)
  - Iftar card (active/upcoming)
- **Next Day's Schedule**: Not shown

#### Scenario 3: After Iftar Time
- **Main Cards**: Show tomorrow's sehri and iftar (both active/upcoming)
- **Next Day's Schedule**: Show today's sehri and iftar (both passed)

## Implementation Plan

### Phase 1: Backend Changes (`actions/time-entries.ts`)

#### 1.1 Add Helper Function to Check if Sehri Has Passed
```typescript
function hasSehriPassed(todaySchedule: TimeEntry): boolean {
  const now = new Date();
  const [sehriHours, sehriMinutes] = todaySchedule.sehri.split(':').map(Number);
  const sehriTime = new Date();
  sehriTime.setHours(sehriHours, sehriMinutes, 0, 0);
  return now >= sehriTime;
}
```

#### 1.2 Create New Function to Get Schedule Data
Create a new function that returns both today's and tomorrow's schedules along with time status:

```typescript
export async function getScheduleDisplayData(location?: string | null) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Get today's schedule
  const todayWhere: Record<string, unknown> = { date: today };
  if (location) {
    todayWhere.location = location;
  }
  const todayEntry = await prisma.timeEntry.findFirst({ where: todayWhere });

  // Get tomorrow's schedule
  const tomorrowWhere: Record<string, unknown> = { date: tomorrowStr };
  if (location) {
    tomorrowWhere.location = location;
  }
  const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });

  // Determine time status
  let sehriPassed = false;
  let iftarPassed = false;

  if (todayEntry) {
    sehriPassed = hasSehriPassed(todayEntry);
    iftarPassed = hasIftarPassed(todayEntry);
  }

  return {
    today: todayEntry ? formatTimeEntry(todayEntry) : null,
    tomorrow: tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null,
    sehriPassed,
    iftarPassed,
  };
}
```

### Phase 2: Frontend Changes (`app/page.tsx`)

#### 2.1 Update Component to Use New Data Structure
Replace `getTodayOrNextDaySchedule` with `getScheduleDisplayData`:

```typescript
async function TodayScheduleContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const scheduleData = await getScheduleDisplayData(location || null);
  const locations = await getLocations();
  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
```

#### 2.2 Update Next Day's Schedule Card Logic
Change the condition to show when iftar has passed:

```typescript
{/* Add next day info card if iftar has passed */}
{scheduleData.iftarPassed && scheduleData.today && (
  <Card className="border-primary/30 bg-primary/5">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
        Today's Passed Schedule
      </CardTitle>
      <CardDescription>
        Today's sehri and iftar time have passed. View today's schedule.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex gap-4">
      <div className="flex-1">
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Sehri</p>
        <p className="text-lg font-semibold">{scheduleData.today.sehri}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
        <p className="text-lg font-semibold">{scheduleData.today.iftar}</p>
      </div>
    </CardContent>
  </Card>
)}
```

#### 2.3 Update Main Cards Display Logic
Implement conditional rendering based on time status:

```typescript
{/* ── Sehri / Iftar Cards ─────────────── */}
{(() => {
  // Determine which schedule to display on main cards
  const displaySchedule = scheduleData.iftarPassed ? scheduleData.tomorrow : scheduleData.today;
  
  if (!displaySchedule) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
             style={{ background: "linear-gradient(135deg,rgba(59,130,246,.12),rgba(168,85,247,.12))" }}>
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-bold">No Schedule Available</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {scheduleData.iftarPassed ? "Tomorrow's schedule has not been uploaded yet." : "Today's schedule has not been uploaded yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Sehri Card */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm ${
        scheduleData.sehriPassed && !scheduleData.iftarPassed 
          ? 'card-sehri-passed opacity-60' 
          : 'card-sehri'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sun className="h-32 w-32 text-amber-500" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/15 shadow-inner">
            <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Sehri
            </p>
            <p className="text-xs text-amber-600/60 dark:text-amber-500/60">
              {scheduleData.sehriPassed && !scheduleData.iftarPassed 
                ? 'Passed — fast has begun' 
                : 'End time — fast begins'}
            </p>
          </div>
        </div>
        <div className="text-5xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
          {displaySchedule.sehri}
        </div>
        {displaySchedule.location && (
          <p className="text-xs text-amber-700/60 dark:text-amber-400/60 mt-3 flex items-center gap-1">
            <MapPin className="h-3 w-3" />{displaySchedule.location}
          </p>
        )}
      </div>

      {/* Iftar Card */}
      <div className="relative overflow-hidden rounded-2xl card-iftar p-6 shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Moon className="h-32 w-32 text-violet-500" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-violet-500/15 shadow-inner">
            <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400">
              Iftar
            </p>
            <p className="text-xs text-violet-600/60 dark:text-violet-500/60">
              Start time — fast breaks
            </p>
          </div>
        </div>
        <div className="text-5xl font-bold text-violet-900 dark:text-violet-100 tracking-tight">
          {displaySchedule.iftar}
        </div>
        {displaySchedule.location && (
          <p className="text-xs text-violet-700/60 dark:text-violet-400/60 mt-3 flex items-center gap-1">
            <MapPin className="h-3 w-3" />{displaySchedule.location}
          </p>
        )}
      </div>
    </div>
  );
})()}
```

#### 2.4 Add CSS for Passed State (Optional)
Add styling for the passed sehri card in `app/globals.css`:

```css
.card-sehri-passed {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.2);
}
```

## Testing Scenarios

### Test Case 1: Before Sehri
- **Expected**: Both sehri and iftar cards shown with today's times
- **Next Day's Schedule**: Not visible

### Test Case 2: After Sehri, Before Iftar
- **Expected**: Sehri card shown with "passed" styling, iftar card shown normally
- **Next Day's Schedule**: Not visible

### Test Case 3: After Iftar
- **Expected**: Both cards shown with tomorrow's times
- **Next Day's Schedule**: Visible with today's passed times

### Edge Cases
- No schedule available for today
- No schedule available for tomorrow
- Location-specific schedules

## Files to Modify

1. `actions/time-entries.ts` - Add new helper functions and `getScheduleDisplayData`
2. `app/page.tsx` - Update component to use new data structure and display logic
3. `app/globals.css` (optional) - Add styling for passed state

## Backward Compatibility

The existing `getTodayOrNextDaySchedule` function can remain for other parts of the application that may be using it. The new `getScheduleDisplayData` function will be used specifically for the home page display.
