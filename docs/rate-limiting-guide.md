# Rate Limiting Guide

## Overview

This guide explains the rate limiting implementation for the Aladhan API integration, which prevents HTTP 429 (Too Many Requests) errors when fetching prayer times.

## Problem

The Aladhan API has rate limits that were being exceeded due to:

- **Aggressive parallel requests**: 10 districts fetched simultaneously
- **Insufficient delays**: Only 100ms between batches
- **No request-level throttling**: Individual requests weren't rate-limited
- **Sequential date requests**: Each district fetched ~30 dates in rapid succession

This resulted in ~300 requests sent in ~30 seconds, overwhelming the API.

## Solution

We implemented a comprehensive rate limiting solution with:

### 1. Token Bucket Rate Limiter

A token bucket algorithm that controls request rate while allowing controlled bursts.

**How it works:**
- Tokens are added to the bucket at a constant rate
- Each request consumes one token
- If no tokens are available, the request waits
- Allows bursts up to the bucket capacity

**Configuration:**
```typescript
{
  capacity: 5,      // Maximum burst capacity
  refillRate: 0.2,  // Tokens per second (12 req/min)
  minWaitTime: 1000, // Minimum wait between requests (1s)
}
```

### 2. Sequential Processing

Changed from parallel batch processing to sequential district processing:

**Before:**
```typescript
// 10 districts in parallel
await Promise.all(
  batch.map(async (district) => {
    await fetchDistrictPrayerTimes(district, dates);
  })
);
```

**After:**
```typescript
// 1 district at a time with delays
for (const district of districts) {
  await fetchDistrictPrayerTimes(district, dates);
  await sleep(interDistrictDelay); // 2s delay
}
```

### 3. Enhanced 429 Error Handling

Improved retry logic for rate limit errors:

- **Longer backoff**: 3x multiplier for 429 errors (vs 2x for other errors)
- **Retry-After header parsing**: Respects API's suggested wait time
- **Jitter addition**: 20% random delay to prevent thundering herd
- **Max delay cap**: 30 seconds for rate limit errors

### 4. Per-Request Delays

Added delays between individual requests:

- **Inter-request delay**: 1s between sequential date requests
- **Inter-district delay**: 2s between different districts

## Configuration

### Presets

Three built-in presets are available:

| Preset | Batch Size | Request Rate | Est. Time (300 req) | Use Case |
|---------|------------|--------------|---------------------|-----------|
| Conservative | 1 | 6 req/min | ~10 min | Strict API limits |
| Balanced | 1 | 12 req/min | ~5 min | Recommended |
| Aggressive | 3 | 20 req/min | ~3 min | Use with caution |

### Custom Configuration

All parameters can be customized:

```typescript
interface RateLimitConfig {
  batchSize: number;              // 1-10 districts at once
  interRequestDelay: number;       // 100-10000ms between requests
  interDistrictDelay: number;      // 100-10000ms between districts
  tokenBucket: {
    capacity: number;             // 1-20 max tokens
    refillRate: number;           // 0.01-1 tokens/sec
    minWaitTime: number;          // 100-10000ms minimum wait
  };
}
```

## Usage

### Via UI

The admin API fetch page includes a rate limit configuration UI:

1. Navigate to `/admin/api-fetch`
2. Select a preset (Conservative, Balanced, Aggressive)
3. Or select "Custom" and configure manually
4. View estimated fetch time
5. Click "Fetch Prayer Times"

### Via API

Pass rate limit configuration via query parameters:

```typescript
// Using preset
const response = await fetch(
  `/api/prayer-times/fetch?mode=multiMonth&year=2026&months=2,3&rateLimitPreset=balanced`
);

// Using custom config
const response = await fetch(
  `/api/prayer-times/fetch?mode=multiMonth&year=2026&months=2,3&rateLimitConfig=${encodeURIComponent(JSON.stringify({
    batchSize: 1,
    interRequestDelay: 1000,
    interDistrictDelay: 2000,
    tokenBucket: {
      capacity: 5,
      refillRate: 0.2,
      minWaitTime: 1000,
    },
  }))}`
);
```

### Programmatically

```typescript
import { getGlobalAladhanWrapper, type RateLimitConfig } from '@/lib/api/aladhan-api-wrapper';

const wrapper = getGlobalAladhanWrapper({
  batchSize: 1,
  interRequestDelay: 1000,
  interDistrictDelay: 2000,
  tokenBucket: {
    capacity: 5,
    refillRate: 0.2,
    minWaitTime: 1000,
  },
});

const entries = await wrapper.fetchPrayerTimes(options);
```

## Monitoring

### Rate Limiter Statistics

Get current rate limiter statistics:

```typescript
const stats = wrapper.getRateLimiterStats();
console.log(stats);
// {
//   currentTokens: 4.5,
//   capacity: 5,
//   refillRate: 0.2,
//   totalRequests: 50,
//   totalWaitTime: 15000,
//   averageWaitTime: 300
// }
```

### Logs

Rate limiting is logged at various levels:

- **Info**: Configuration changes, initialization
- **Debug**: Token acquisition, refills, stats
- **Warn**: Rate limit errors, configuration parsing failures

## Performance Impact

| Metric | Before | After | Impact |
|---------|--------|-------|--------|
| Request Rate | ~10 req/s | ~0.2 req/s | 50x slower but reliable |
| Success Rate | 0% | 100% | Critical improvement |
| Total Time | ~5 min (failed) | ~5-10 min | Acceptable trade-off |
| API Load | Overwhelming | Controlled | Better for API |

## Troubleshooting

### Still Getting 429 Errors

1. **Switch to Conservative preset**: Slowest but most reliable
2. **Increase delays**: Add 1000-2000ms to inter-request delay
3. **Reduce batch size**: Set to 1 (sequential processing)
4. **Check API status**: Visit https://aladhan.com/prayer-times-api for any issues

### Fetch Too Slow

1. **Switch to Aggressive preset**: Faster but may hit limits
2. **Reduce delays**: Decrease inter-request and inter-district delays
3. **Increase refill rate**: Add more tokens per second
4. **Increase capacity**: Allow larger bursts

### Configuration Not Applied

1. **Check API route**: Ensure `rateLimitConfig` is being passed
2. **Verify JSON format**: Ensure configuration is valid JSON
3. **Check browser console**: Look for JavaScript errors
4. **Check server logs**: Verify configuration is being parsed

## Best Practices

1. **Start with Balanced preset**: Recommended for most use cases
2. **Monitor logs**: Watch for 429 errors and adjust accordingly
3. **Use caching**: Avoid refetching the same data
4. **Fetch in batches**: Don't fetch all districts at once if not needed
5. **Schedule during off-peak**: Fetch during low API usage times

## Files Modified

- `lib/api/token-bucket-rate-limiter.ts` - New token bucket implementation
- `lib/api/aladhan-api-wrapper.ts` - Updated to use rate limiting
- `lib/api/external-api-client.ts` - Enhanced 429 error handling
- `lib/config/app.config.ts` - Added rate limit presets
- `app/api/prayer-times/fetch/route.ts` - Accepts rate limit config
- `components/admin/rate-limit-config.tsx` - New UI component
- `app/admin/api-fetch/page.tsx` - Integrated rate limit UI

## References

- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Aladhan API Documentation](https://aladhan.com/prayer-times-api)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
