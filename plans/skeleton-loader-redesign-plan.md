# Skeleton Loader Redesign Plan

## Overview
Redesign all skeleton loaders across the application to accurately reflect the actual components with data, using gradient backgrounds for a more visually consistent and polished loading experience.

## Current State Analysis

### Existing Skeleton Components
1. **Base Skeleton** (`components/ui/skeleton.tsx`)
   - Currently uses: `bg-accent animate-pulse rounded-md`
   - Simple solid background with pulse animation

2. **TodayScheduleSkeleton** (`components/public/today-schedule-skeleton.tsx`)
   - Used on: Home page (`app/page.tsx`)
   - Components: Hero banner, Sehri/Iftar cards, Quick links card

3. **CalendarSkeleton** (`components/public/calendar-skeleton.tsx`)
   - Used on: Calendar page (`app/(home)/calendar/page.tsx`)
   - Components: Hero banner, Next day info card, Sehri/Iftar cards, Schedule table

4. **LocationSkeleton** (`components/public/location-skeleton.tsx`)
   - Used on: Location page (`app/(home)/location/[city]/page.tsx`)
   - Components: Hero banner with location icon, Next day info card, Sehri/Iftar cards, Schedule table

### Gradient Tokens Available (from globals.css)
```css
--grad-primary: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);  /* Blue to Purple */
--grad-sehri: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);     /* Amber to Orange */
--grad-iftar: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);     /* Purple to Cyan */
--grad-cta: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);      /* Darker Blue to Purple */
```

## Design Approach

### Key Principles
1. **Mirror Actual Layout**: Skeleton loaders should match the exact structure of their corresponding components
2. **Gradient Backgrounds**: Use appropriate gradients for different element types
3. **Visual Hierarchy**: Maintain the same visual hierarchy as actual components
4. **Responsive Design**: Preserve responsive breakpoints and layouts
5. **Animation**: Keep the `animate-pulse` effect for smooth loading indication

### Gradient Mapping

| Element Type | Gradient | Use Case |
|-------------|----------|----------|
| Hero decorative orb | `--grad-primary` | Background blur effect |
| Hero text/title | `--grad-primary` | Main headings, badges |
| Sehri card | `--grad-sehri` | Sehri-specific elements |
| Iftar card | `--grad-iftar` | Iftar-specific elements |
| Primary buttons/CTAs | `--grad-cta` | Action buttons |
| General skeleton | `--grad-primary` | Default skeleton elements |

## Implementation Plan

### Step 1: Update Base Skeleton Component
**File**: `components/ui/skeleton.tsx`

**Changes**:
- Add support for gradient backgrounds via a `variant` prop
- Maintain backward compatibility with default `bg-accent` behavior
- Support variants: `default`, `primary`, `sehri`, `iftar`

**Proposed API**:
```typescript
interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "primary" | "sehri" | "iftar";
}
```

**Gradient Classes**:
- `variant="primary"` → `bg-gradient-to-r from-blue-500/20 to-purple-500/20`
- `variant="sehri"` → `bg-gradient-to-r from-amber-500/20 to-orange-500/20`
- `variant="iftar"` → `bg-gradient-to-r from-violet-500/20 to-cyan-500/20`
- `variant="default"` → `bg-accent` (current behavior)

### Step 2: Redesign TodayScheduleSkeleton
**File**: `components/public/today-schedule-skeleton.tsx`

**Structure to Match** (`app/page.tsx`):
1. Hero Banner
   - Decorative orb (gradient background blur)
   - Small text badge (gradient background)
   - Title (gradient text placeholder)
   - Subtitle text
   - Location selector dropdown
   - Download button

2. Sehri Card
   - Large decorative icon (gradient background)
   - Icon container (gradient background)
   - Small text label
   - Subtext
   - Large time display
   - Location text
   - Optional countdown timer

3. Iftar Card
   - Same structure as Sehri but with Iftar gradient

4. Today's Passed Schedule Card (optional)
   - Card with gradient border
   - Two time displays

5. Hadith Card (optional)
   - Quote icon
   - Title
   - Quote text
   - Source with decorative lines

6. Quick Links Card
   - Title
   - Description
   - Multiple button links (gradient backgrounds)

**Key Improvements**:
- Use `variant="primary"` for hero elements
- Use `variant="sehri"` for Sehri card elements
- Use `variant="iftar"` for Iftar card elements
- Add gradient decorative elements matching actual component
- Preserve exact spacing and responsive breakpoints

### Step 3: Redesign CalendarSkeleton
**File**: `components/public/calendar-skeleton.tsx`

**Structure to Match** (`app/(home)/calendar/page.tsx`):
1. Hero Banner (similar to TodayScheduleSkeleton but with calendar icon)
2. Next Day Info Card
   - Gradient border
   - Title and description
3. Sehri/Iftar Cards (same as TodayScheduleSkeleton)
4. Schedule Table Card
   - Table with gradient borders
   - Header row with multiple columns
   - Multiple data rows with badges

**Key Improvements**:
- Match exact table structure (5 columns: Date, Sehri, Iftar, Location, Status)
- Add skeleton badges for status column
- Use gradient backgrounds for table headers

### Step 4: Redesign LocationSkeleton
**File**: `components/public/location-skeleton.tsx`

**Structure to Match** (`app/(home)/location/[city]/page.tsx`):
1. Hero Banner
   - Location icon container (gradient background)
   - Title with gradient text placeholder
   - Subtitle
   - Back button
   - Download button

2. Next Day Info Card (same as CalendarSkeleton)

3. Sehri/Iftar Cards (same as TodayScheduleSkeleton)

4. Schedule Table Card
   - Table with 4 columns (Date, Sehri, Iftar, Status - no Location column)
   - Header row
   - Multiple data rows with badges

**Key Improvements**:
- Add location icon skeleton with gradient background
- Match exact table structure (4 columns without Location)
- Preserve responsive behavior

## Component Mapping

### TodayScheduleSkeleton ↔ app/page.tsx
| Skeleton Element | Actual Component | Gradient |
|-----------------|------------------|----------|
| Hero orb | Decorative blur | `--grad-primary` |
| Hero badge | "Ramadan 1446 AH" badge | `--grad-primary` |
| Hero title | "Today's Schedule" | `--grad-primary` |
| Sehri card background | `card-sehri` class | `--grad-sehri` |
| Sehri icon container | Amber background | `--grad-sehri` |
| Iftar card background | `card-iftar` class | `--grad-iftar` |
| Iftar icon container | Violet background | `--grad-iftar` |
| Quick links buttons | Gradient buttons | `--grad-cta` |

### CalendarSkeleton ↔ app/(home)/calendar/page.tsx
| Skeleton Element | Actual Component | Gradient |
|-----------------|------------------|----------|
| Hero orb | Decorative blur | `--grad-primary` |
| Hero badge | "Full Schedule" badge | `--grad-primary` |
| Hero title | "Ramadan Calendar" | `--grad-primary` |
| Next day card border | `border-primary/30` | `--grad-primary` |
| Sehri/Iftar cards | Same as TodayScheduleSkeleton | `--grad-sehri` / `--grad-iftar` |
| Table header | Gradient background | `--grad-primary` |

### LocationSkeleton ↔ app/(home)/location/[city]/page.tsx
| Skeleton Element | Actual Component | Gradient |
|-----------------|------------------|----------|
| Hero orb | Decorative blur | `--grad-primary` |
| Location icon container | Gradient background | `--grad-primary` |
| Hero badge | "Location Schedule" badge | `--grad-primary` |
| Hero title | City name | `--grad-primary` |
| Next day card border | `border-primary/30` | `--grad-primary` |
| Sehri/Iftar cards | Same as TodayScheduleSkeleton | `--grad-sehri` / `--grad-iftar` |
| Table header | Gradient background | `--grad-primary` |

## Technical Details

### Tailwind Gradient Classes
```css
/* Primary gradient (Blue to Purple) */
bg-gradient-to-r from-blue-500/20 to-purple-500/20

/* Sehri gradient (Amber to Orange) */
bg-gradient-to-r from-amber-500/20 to-orange-500/20

/* Iftar gradient (Violet to Cyan) */
bg-gradient-to-r from-violet-500/20 to-cyan-500/20

/* CTA gradient (Darker Blue to Purple) */
bg-gradient-to-r from-blue-600/30 to-purple-600/30
```

### Animation Enhancement
- Keep `animate-pulse` for all skeleton elements
- Consider adding `animate-shimmer` effect for more sophisticated loading states (optional)

### Responsive Considerations
- Preserve all existing responsive breakpoints (`sm:`, `md:`, etc.)
- Maintain mobile-first approach
- Ensure skeleton elements scale correctly on different screen sizes

## Testing Checklist

- [ ] Verify TodayScheduleSkeleton matches home page layout
- [ ] Verify CalendarSkeleton matches calendar page layout
- [ ] Verify LocationSkeleton matches location page layout
- [ ] Test responsive behavior on mobile, tablet, and desktop
- [ ] Verify gradient colors match actual component colors
- [ ] Ensure animation is smooth and not distracting
- [ ] Check that skeleton loaders display correctly during data fetching
- [ ] Verify accessibility (aria-hidden, etc.)

## Benefits

1. **Visual Consistency**: Skeleton loaders now match the actual component design
2. **Better UX**: Users see a preview of what's loading, reducing perceived wait time
3. **Polished Appearance**: Gradient backgrounds create a more modern, premium feel
4. **Accurate Representation**: Skeleton structure matches actual component structure
5. **Maintainability**: Centralized gradient tokens make updates easier

## Files to Modify

1. `components/ui/skeleton.tsx` - Add gradient variant support
2. `components/public/today-schedule-skeleton.tsx` - Complete redesign
3. `components/public/calendar-skeleton.tsx` - Complete redesign
4. `components/public/location-skeleton.tsx` - Complete redesign

## Estimated Impact

- **User Experience**: Significant improvement in loading state perception
- **Visual Quality**: Enhanced with modern gradient aesthetics
- **Code Quality**: More maintainable and consistent skeleton implementation
- **Performance**: Minimal impact (same animation, just different colors)
