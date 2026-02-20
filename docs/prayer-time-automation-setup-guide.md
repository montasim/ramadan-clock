# Prayer Time Automation Setup Guide

This guide explains how to set up and configure the automated prayer time system for your Ramadan Clock application.

## Overview

The automation system uses the Aladhan API to fetch Sehri and Iftar times for all 64 Bangladesh districts automatically. The system updates once per month via a scheduled cron job, eliminating the need for manual data entry.

## Features

- **Automatic Updates**: Prayer times are fetched automatically from Aladhan API
- **Monthly Schedule**: Updates run once per month (configurable)
- **All 64 Districts**: Covers all Bangladesh districts with precise coordinates
- **Manual Trigger**: Admin can trigger updates anytime from the dashboard
- **Error Handling**: Comprehensive error handling with retry logic
- **Monitoring**: Health checks and status monitoring

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Completed setup of the base Ramadan Clock application

## Setup Steps

### 1. Database Migration

The automation system requires a new database model for tracking cron executions. Run the following commands:

```bash
# Generate Prisma client (required after schema changes)
pnpm db:generate

# Push schema changes to database
pnpm db:push
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Prayer Time API Configuration
PRAYER_TIME_API_URL=https://api.aladhan.com/v1
PRAYER_TIME_API_METHOD=2
PRAYER_TIME_API_SCHOOL=0
PRAYER_TIME_SEHRI_ADJUSTMENT_MINUTES=0
PRAYER_TIME_IFTAR_ADJUSTMENT_MINUTES=0

# Cron Job Configuration
CRON_SECRET_KEY=your-secure-secret-key-here
```

#### Environment Variable Details

| Variable | Description | Default | Example |
|----------|-------------|----------|----------|
| `PRAYER_TIME_API_URL` | Base URL for Aladhan API | `https://api.aladhan.com/v1` | - |
| `PRAYER_TIME_API_METHOD` | Calculation method (2=ISNA, 3=MWL, etc.) | `2` | `2` |
| `PRAYER_TIME_API_SCHOOL` | Madhab (0=Shafi, 1=Hanafi) | `0` | `0` |
| `PRAYER_TIME_SEHRI_ADJUSTMENT_MINUTES` | Minutes to add/subtract from Sehri time | `0` | `-5` |
| `PRAYER_TIME_IFTAR_ADJUSTMENT_MINUTES` | Minutes to add/subtract from Iftar time | `0` | `2` |
| `CRON_SECRET_KEY` | Secret key for cron job authentication | - | `random-secret-key` |

#### Calculation Methods

- `1`: University of Islamic Sciences, Karachi
- `2`: Islamic Society of North America (ISNA) - **Recommended**
- `3`: Muslim World League (MWL)
- `4`: Umm Al-Qura University, Makkah
- `5`: Egyptian General Authority of Survey
- `7`: Institute of Geophysics, University of Tehran
- `8`: Gulf Region
- `9`: Kuwait
- `10`: Qatar
- `11`: Majlis Ugama Islam Singapura, Singapore
- `12`: Union Organization Islamic de France
- `13`: Diyanet İşleri Başkanlığı, Turkey
- `14`: Spiritual Administration of Muslims of Russia

### 3. Cron Job Configuration

#### Option A: Vercel Cron Jobs (Recommended for Vercel Deployment)

Create or update `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/prayer-times",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

This will trigger the update on the 1st day of every month at midnight UTC.

#### Option B: External Cron Service

If you're not using Vercel, use an external cron service like:

- **cron-job.org**: Free tier available
- **GitHub Actions**: Schedule workflows
- **EasyCron**: Simple scheduling
- **Cronitor**: Monitoring included

Configure the cron service to call:
```
POST https://your-domain.com/api/cron/prayer-times
Authorization: Bearer YOUR_CRON_SECRET_KEY
```

### 4. Testing the Setup

#### Test Manual Trigger

1. Navigate to the admin dashboard at `/admin/dashboard`
2. Click the "Update Now" button in the Prayer Time Sync widget
3. Wait for the update to complete
4. Check the status and verify data was updated

#### Test API Endpoint

Use curl to test the cron endpoint:

```bash
curl -X POST https://your-domain.com/api/cron/prayer-times \
  -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" \
  -H "Content-Type: application/json"
```

#### Test Health Check

```bash
curl https://your-domain.com/api/health/prayer-times
```

## Usage

### Manual Trigger from Dashboard

1. Log in to the admin panel
2. Go to the Dashboard
3. Find the "Prayer Time Sync" widget
4. Click "Update Now" to trigger an immediate update

### Manual Trigger via API

```bash
curl -X POST https://your-domain.com/api/cron/prayer-times \
  -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"year": 2026, "month": 3}'
```

### Check Status

```bash
curl https://your-domain.com/api/cron/prayer-times
```

## Monitoring

### Health Check Endpoint

The `/api/health/prayer-times` endpoint provides:

- Database connectivity status
- API connectivity status
- Cron execution status
- Error statistics

Example response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-20T14:00:00.000Z",
    "latency": 1234,
    "checks": {
      "database": {
        "healthy": true,
        "latency": 45
      },
      "api": {
        "healthy": true,
        "latency": 234
      },
      "cron": {
        "healthy": true,
        "lastExecution": "2026-02-01T00:00:00.000Z",
        "nextScheduled": "2026-03-01T00:00:00.000Z"
      }
    },
    "errorStats": {
      "total": 0,
      "unresolved": 0,
      "byType": {}
    }
  }
}
```

### Dashboard Widget

The admin dashboard includes a "Prayer Time Sync" widget that shows:
- Last execution time
- Execution duration
- Number of locations processed
- Number of entries created/updated
- Error status (if any)
- Manual trigger button

## Troubleshooting

### Issue: Cron job not executing

**Solution:**
1. Check your cron service configuration
2. Verify the `CRON_SECRET_KEY` is set correctly
3. Check server logs for errors
4. Test the endpoint manually

### Issue: API rate limiting

**Solution:**
1. The system includes a 500ms delay between location requests to avoid rate limiting
2. If you still hit rate limits, increase the delay in `lib/api/prayer-time-api.ts`
3. Consider using a different calculation method

### Issue: Invalid prayer times

**Solution:**
1. Check the calculation method in your environment variables
2. Verify location coordinates in `lib/config/locations.config.ts`
3. Use adjustment minutes to fine-tune times if needed

### Issue: Database errors

**Solution:**
1. Ensure the database schema is up to date: `pnpm db:push`
2. Check database connectivity
3. Verify database credentials in `DATABASE_URL`

### Issue: Cache not invalidating

**Solution:**
1. The cron job automatically invalidates cache after updates
2. If cache issues persist, manually clear cache by restarting the server
3. Check cache configuration in `lib/cache/cache-config.ts`

## Configuration Options

### Adjust Prayer Times

If you need to adjust Sehri or Iftar times:

```env
PRAYER_TIME_SEHRI_ADJUSTMENT_MINUTES=-5
PRAYER_TIME_IFTAR_ADJUSTMENT_MINUTES=2
```

Negative values subtract time, positive values add time.

### Change Calculation Method

To use a different calculation method:

```env
PRAYER_TIME_API_METHOD=3
```

See the "Calculation Methods" section above for available options.

### Change Madhab

To switch between Shafi and Hanafi:

```env
PRAYER_TIME_API_SCHOOL=1  # 0=Shafi, 1=Hanafi
```

## Maintenance

### Regular Tasks

1. **Monitor Health**: Periodically check the health endpoint
2. **Review Logs**: Check server logs for any errors
3. **Update Coordinates**: If needed, update location coordinates in `lib/config/locations.config.ts`
4. **Backup Database**: Regular backups are recommended

### Updating the System

When updating the automation system:

1. Pull the latest code
2. Run database migrations: `pnpm db:push`
3. Restart the application
4. Test the cron endpoint

## Security Considerations

1. **Keep `CRON_SECRET_KEY` Secure**: Never commit this to version control
2. **Use Environment Variables**: Store all sensitive data in environment variables
3. **Monitor Access**: Watch for unauthorized API calls
4. **Rate Limiting**: Consider implementing rate limiting for the cron endpoint

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review server logs
3. Check the health endpoint status
4. Open an issue on the project repository

## Additional Resources

- [Aladhan API Documentation](https://aladhan.com/prayer-times-api)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
