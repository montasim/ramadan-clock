# Cron Job Setup Guide

This guide explains how to set up automated cron jobs for the Ramadan Clock application to automatically fetch and update prayer times.

## Overview

The application supports automated prayer time updates through cron jobs. The cron job will:
1. Fetch prayer times from the Aladhan API for all configured locations
2. Process and validate the data
3. Upload the data to the database
4. Invalidate caches
5. Log the execution result
6. Send notifications on failure (if configured)

## Environment Variables

Configure the following environment variables in your `.env` file:

```bash
# Enable/disable cron job (default: true)
CRON_ENABLED=true

# Cron schedule expression (default: "0 1 1 * *" - monthly on the 1st at 1:00 AM)
# Examples:
# - Daily at 2:00 AM: "0 2 * * *"
# - Weekly on Sunday at 3:00 AM: "0 3 * * 0"
# - Monthly on the 1st at 1:00 AM: "0 1 1 * *"
# - Every 6 hours: "0 */6 * * *"
CRON_SCHEDULE_EXPRESSION="0 1 1 * *"

# Timezone for cron schedule (default: Asia/Dhaka)
CRON_TIMEZONE="Asia/Dhaka"

# Secret key for securing cron endpoints (REQUIRED)
# Generate a secure random string for this
CRON_SECRET_KEY="your-secret-key-here"

# Enable notifications on cron failure (default: false)
CRON_NOTIFICATIONS_ENABLED=true

# Webhook URL for failure notifications (optional)
CRON_WEBHOOK_URL="https://your-webhook-url.com/notify"

# Email recipients for failure notifications (comma-separated, optional)
CRON_EMAIL_RECIPIENTS="admin@example.com,ops@example.com"

# Maximum retries for API fetch failures (default: 3)
CRON_MAX_RETRIES=3

# Retry delay in milliseconds (default: 5000)
CRON_RETRY_DELAY=5000

# Enable fallback to cached data on API failure (default: true)
CRON_FALLBACK_TO_CACHE=true
```

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

If you're deploying to Vercel, you can use Vercel's built-in cron jobs:

1. Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/prayer-times",
      "schedule": "0 1 1 * *"
    }
  ]
}
```

2. Deploy to Vercel - the cron job will be automatically configured

3. Vercel will automatically authenticate requests using the `CRON_SECRET_KEY`

### Option 2: External Cron Services

Use external cron services like cron-job.org, EasyCron, or GitHub Actions:

#### Using cron-job.org

1. Sign up at https://cron-job.org
2. Create a new cron job with:
   - URL: `https://your-domain.com/api/cron/prayer-times`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET_KEY`
   - Schedule: Set according to your needs
   - Body (JSON): `{}` (or specify `{"year": 2026, "month": 3}` for specific month)

#### Using GitHub Actions

Create `.github/workflows/prayer-times-cron.yml`:

```yaml
name: Prayer Times Cron Job

on:
  schedule:
    - cron: '0 1 1 * *'  # Monthly on the 1st at 1:00 AM UTC
  workflow_dispatch:  # Allow manual triggering

jobs:
  update-prayer-times:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron Job
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}' \
            https://your-domain.com/api/cron/prayer-times
```

Add your `CRON_SECRET_KEY` as a GitHub secret.

### Option 3: Server Cron (VPS/Dedicated Server)

If you have a VPS or dedicated server, use the system cron:

1. Open crontab:
   ```bash
   crontab -e
   ```

2. Add a cron job:
   ```bash
   # Run monthly on the 1st at 1:00 AM
   0 1 1 * * curl -X POST \
     -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{}' \
     https://your-domain.com/api/cron/prayer-times
   ```

3. Save and exit

## Monitoring

### Check Cron Status

You can check the status of the last cron execution:

```bash
curl https://your-domain.com/api/cron/prayer-times
```

Response:
```json
{
  "success": true,
  "data": {
    "lastExecution": {
      "id": "uuid",
      "executedAt": "2026-02-20T01:00:00.000Z",
      "success": true,
      "duration": 15000,
      "locationsProcessed": 64,
      "entriesProcessed": 1984,
      "entriesCreated": 1984,
      "entriesUpdated": 0,
      "entriesFailed": 0,
      "errors": null
    },
    "isHealthy": true,
    "nextScheduledUpdate": "2026-03-01T01:00:00.000Z"
  }
}
```

### View Execution History

The application logs all cron executions in the `CronExecutionLog` table. You can view the history in your database or through the admin dashboard (if implemented).

## Features

### Retry Logic

The cron job includes automatic retry logic for API fetch failures:
- Maximum retries: 3 (configurable via `CRON_MAX_RETRIES`)
- Retry delay: 5000ms with exponential backoff (configurable via `CRON_RETRY_DELAY`)

### Fallback Strategy

If the API fetch fails after all retries, the cron job can fall back to cached data:
- Retrieves the most recent successful upload from the database
- Uses cached entries for the requested month
- Configurable via `CRON_FALLBACK_TO_CACHE` environment variable

### Notifications

On cron failure, notifications are sent to:
- Webhook URL (if `CRON_WEBHOOK_URL` is configured)
- Email recipients (if `CRON_EMAIL_RECIPIENTS` is configured)

Notification payload includes:
- Execution status
- Error messages
- Timestamp
- Duration

### Rollback and Retry

The cron job uses the same upload mechanism as manual uploads, which includes:
- Transaction-based rollback on batch failures
- Individual entry retry with exponential backoff
- Detailed error reporting

## Troubleshooting

### Cron Job Not Running

1. Check if `CRON_ENABLED=true` is set
2. Verify the cron service is properly configured
3. Check server logs for errors

### API Fetch Failures

1. Verify the Aladhan API is accessible
2. Check `PRAYER_TIME_API_URL` environment variable
3. Review cron execution logs in the database
4. Enable fallback to cached data if needed

### Notification Not Working

1. Verify `CRON_NOTIFICATIONS_ENABLED=true`
2. Check `CRON_WEBHOOK_URL` or `CRON_EMAIL_RECIPIENTS` is configured
3. Test the webhook URL manually
4. Check server logs for notification errors

### Authentication Errors

1. Verify `CRON_SECRET_KEY` is set
2. Ensure the Authorization header is correctly formatted
3. Check the secret key matches between client and server

## Security

- Always use HTTPS for cron endpoints
- Keep `CRON_SECRET_KEY` secure and never commit it to version control
- Use environment-specific secrets for different environments (dev, staging, production)
- Monitor cron execution logs for suspicious activity

## Best Practices

1. **Schedule During Low Traffic**: Run cron jobs during off-peak hours (e.g., 1:00 AM - 3:00 AM)
2. **Monitor Executions**: Regularly check cron execution logs and status
3. **Set Up Alerts**: Configure notifications for failures
4. **Test Before Production**: Test cron jobs in staging environment first
5. **Keep Secrets Secure**: Rotate `CRON_SECRET_KEY` periodically
6. **Document Changes**: Keep this guide updated when modifying cron configuration

## Support

For issues or questions about cron job setup:
1. Check the application logs
2. Review the cron execution history in the database
3. Verify all environment variables are correctly configured
4. Test the cron endpoint manually using curl or Postman
