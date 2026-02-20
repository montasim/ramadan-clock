# Caching Implementation Guide

This document explains the caching strategy implemented in the Ramadan Clock application.

## Overview

The application uses a multi-layered caching strategy to improve performance and reduce database load:

1. **Page-Level Caching (ISR)** - Next.js Incremental Static Regeneration
2. **API Route Caching** - HTTP cache headers for API responses
3. **Data Fetching Cache** - `unstable_cache` for database queries
4. **External API Cache** - In-memory caching for external API calls
5. **Cache Invalidation** - Automatic cache invalidation on data changes

## Cache Configuration

All cache configurations are centralized in [`lib/cache/cache-config.ts`](../lib/cache/cache-config.ts):

```typescript
export const CACHE_DURATIONS = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 900,           // 15 minutes
  VERY_LONG: 1800,     // 30 minutes
  HOUR: 3600,           // 1 hour
};

export const CACHE_TAGS = {
  SCHEDULE: 'schedule',
  LOCATIONS: 'locations',
  STATS: 'stats',
  HADITH: 'hadith',
  PDF: 'pdf',
};
```

## Page-Level Caching

### Public Pages

All public pages use ISR (Incremental Static Regeneration) with different revalidation intervals:

| Page | Revalidation Time | Config Location |
|------|------------------|----------------|
| Home (`/`) | 5 minutes | [`app/page.tsx`](../app/page.tsx) |
| Calendar (`/calendar`) | 15 minutes | [`app/(home)/calendar/page.tsx`](../app/(home)/calendar/page.tsx) |
| Location (`/location/[city]`) | 30 minutes | [`app/(home)/location/[city]/page.tsx`](../app/(home)/location/[city]/page.tsx) |

### Admin Pages

Admin pages are never cached to ensure real-time data:

| Page | Cache Setting | Config Location |
|------|---------------|----------------|
| Dashboard (`/admin/dashboard`) | No cache | [`app/admin/dashboard/page.tsx`](../app/admin/dashboard/page.tsx) |
| Upload (`/admin/upload`) | No cache | [`app/admin/upload/page.tsx`](../app/admin/upload/page.tsx) |

## API Route Caching

API routes use HTTP cache headers to control caching at the CDN/edge level:

| Route | Cache Duration | Cache Headers |
|--------|---------------|---------------|
| GET `/api/schedule` | 1 minute (stale 5 min) | `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` |
| GET `/api/hadith` | 1 hour (stale 2 hours) | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200` |
| GET `/api/pdf` | 10 minutes (stale 30 min) | `Cache-Control: public, s-maxage=600, stale-while-revalidate=1800` + ETag |

## Data Fetching Cache

Server actions use Next.js `unstable_cache` to cache database queries:

| Function | Cache Duration | Tags | Config Location |
|----------|---------------|------|----------------|
| `getTodaySchedule` | 1 minute | `SCHEDULE` | [`actions/time-entries.ts`](../actions/time-entries.ts) |
| `getTodayOrNextDaySchedule` | 1 minute | `SCHEDULE` | [`actions/time-entries.ts`](../actions/time-entries.ts) |
| `getScheduleDisplayData` | 1 minute | `SCHEDULE` | [`actions/time-entries.ts`](../actions/time-entries.ts) |
| `getFullSchedule` | 5 minutes | `SCHEDULE` | [`actions/time-entries.ts`](../actions/time-entries.ts) |
| `getLocations` | 1 hour | `LOCATIONS` | [`actions/time-entries.ts`](../actions/time-entries.ts) |
| `getStats` | 1 minute | `STATS` | [`actions/time-entries.ts`](../actions/time-entries.ts) |

## Cache Invalidation

Cache is automatically invalidated when data changes:

### Automatic Invalidation Points

1. **Schedule Upload** - Invalidates all caches when schedule is uploaded
   - Tags: `SCHEDULE`, `STATS`, `LOCATIONS`, `PDF`
   - Paths: `/`, `/calendar`, `/admin/dashboard`
   - Location: [`actions/upload.actions.new.ts`](../actions/upload.actions.new.ts)

2. **Schedule Update** - Invalidates caches when a time entry is updated
   - Tags: `SCHEDULE`, `STATS`, `LOCATIONS`
   - Paths: `/`, `/calendar`, `/admin/dashboard`
   - Location: [`actions/time-entries.ts`](../actions/time-entries.ts)

3. **Schedule Delete** - Invalidates caches when a time entry is deleted
   - Tags: `SCHEDULE`, `STATS`, `LOCATIONS`
   - Paths: `/`, `/calendar`, `/admin/dashboard`
   - Location: [`actions/time-entries.ts`](../actions/time-entries.ts)

### Manual Cache Invalidation

You can manually invalidate caches using helper functions from [`lib/cache/cache-helpers.ts`](../lib/cache/cache-helpers.ts):

```typescript
import { invalidateScheduleCache, invalidateLocationCache, invalidateAllCaches } from '@/lib/cache';

// Invalidate schedule-related caches
invalidateScheduleCache();

// Invalidate location caches
invalidateLocationCache();

// Invalidate all caches (emergency use)
invalidateAllCaches();
```

## Cache Monitoring

### Debug API

A debug API endpoint is available at `/api/cache/debug` (admin only):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/cache/debug
```

Response includes:
- Application cache statistics (hits, misses, hit rate per key)
- External API cache statistics (size, keys)
- Overall cache metrics

### Cache Monitor Class

Use the [`CacheMonitor`](../lib/cache/cache-monitor.ts) class to track cache performance:

```typescript
import { CacheMonitor } from '@/lib/cache';

// Record a cache hit
CacheMonitor.recordHit('cache-key');

// Record a cache miss
CacheMonitor.recordMiss('cache-key');

// Get statistics for a specific key
const stats = CacheMonitor.getKeyStats('cache-key');

// Get overall statistics
const overall = CacheMonitor.getOverallStats();

// Get all statistics
const allStats = CacheMonitor.getStats();

// Reset metrics
CacheMonitor.resetMetrics();
```

## Static Asset Caching

Static assets are cached at the CDN/edge level via [`next.config.ts`](../next.config.ts):

| Asset Type | Cache Duration | Cache Headers |
|-------------|---------------|---------------|
| Static files (`/static/*`) | 1 year (immutable) | `public, max-age=31536000, immutable` |
| Next.js static (`/_next/static/*`) | 1 year (immutable) | `public, max-age=31536000, immutable` |
| Images (`/images/*`) | 1 day (stale 7 days) | `public, max-age=86400, stale-while-revalidate=604800` |

## Best Practices

### When to Use Caching

✅ **DO cache** when:
- Data changes rarely (locations, static schedules)
- Data is expensive to compute (PDF generation, complex queries)
- Data is read frequently (home page, calendar)
- Data is not user-specific (public pages)

❌ **DO NOT cache** when:
- Data changes frequently (real-time stats)
- Data is user-specific (admin dashboard)
- Data is sensitive (admin operations)
- Data requires authentication (protected routes)

### Cache Duration Guidelines

| Data Type | Recommended Duration | Rationale |
|-------------|-------------------|-----------|
| Static data (locations) | 1 hour | Changes very rarely |
| Schedule data | 5-15 minutes | Changes on upload, stale data acceptable |
| Today's schedule | 1 minute | Time-sensitive, changes daily |
| External API (hadith) | 1 hour | Static content, never changes |
| Generated content (PDF) | 10 minutes | Expensive to regenerate |

### Cache Invalidation Strategy

1. **Tag-based invalidation** - Use cache tags for selective invalidation
2. **Path-based invalidation** - Revalidate ISR pages by path
3. **Time-based revalidation** - Set appropriate revalidation intervals
4. **Manual invalidation** - Provide admin endpoints for emergency cache clearing

## Troubleshooting

### Cache Not Updating

If cached data is not updating:

1. Check if cache tags are being invalidated correctly
2. Verify `unstable_cache` is being used with correct tags
3. Check if revalidation intervals are appropriate
4. Use the debug API to check cache hit rates

### High Cache Miss Rate

If cache hit rate is low (< 50%):

1. Increase cache duration for stable data
2. Check if cache keys are consistent
3. Review cache invalidation patterns
4. Monitor for unnecessary cache clearing

### Stale Data

If users see stale data:

1. Reduce revalidation intervals
2. Implement on-demand revalidation
3. Check cache invalidation triggers
4. Consider using stale-while-revalidate headers

## Monitoring and Metrics

### Key Metrics to Track

1. **Cache Hit Rate** - Percentage of requests served from cache
2. **Cache Miss Rate** - Percentage of requests requiring fresh data
3. **Average Response Time** - With and without cache
4. **Database Query Reduction** - Reduction in database queries
5. **Cache Size** - Memory usage of cached data

### Monitoring Tools

1. **Debug API** - `/api/cache/debug` endpoint
2. **CacheMonitor** - Programmatic monitoring in code
3. **Application Logs** - Cache operations are logged
4. **CDN Metrics** - If using a CDN, check their dashboard

## Security Considerations

1. **Admin Pages Never Cached** - Ensure real-time data for admins
2. **User-Specific Data** - Never cache user-specific data
3. **Sensitive Data** - Never cache sensitive information
4. **Cache Poisoning Protection** - Validate all cached data
5. **Rate Limiting** - Maintain rate limiting even with caching

## Related Files

- [`lib/cache/cache-config.ts`](../lib/cache/cache-config.ts) - Cache configuration
- [`lib/cache/cache-helpers.ts`](../lib/cache/cache-helpers.ts) - Cache helper functions
- [`lib/cache/cache-monitor.ts`](../lib/cache/cache-monitor.ts) - Cache monitoring
- [`lib/cache/cache-cleanup.ts`](../lib/cache/cache-cleanup.ts) - Cache cleanup
- [`app/api/cache/debug/route.ts`](../app/api/cache/debug/route.ts) - Debug API endpoint

## Further Reading

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js unstable_cache API](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [HTTP Caching Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
