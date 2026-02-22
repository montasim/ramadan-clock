# API Keys Setup Guide

This guide explains how to obtain API keys for the third-party services used in Ramadan Clock.

## Table of Contents

- [Aladhan Prayer Time API](#aladhan-prayer-time-api)
- [Hadith API](#hadith-api)
- [PostgreSQL Database](#postgresql-database)

---

## Aladhan Prayer Time API

### Overview
The Aladhan API provides accurate prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) based on geographic coordinates and calculation methods.

### Do I Need an API Key?
**No!** The Aladhan API is **completely free** and does not require an API key for basic usage.

### Usage Limits
- **Free tier**: Unlimited requests
- **Rate limiting**: None for basic usage
- **Authentication**: Not required

### Configuration

Set these environment variables in your `.env.local`:

```env
# Base URL (already set in .env.example)
PRAYER_TIME_API_URL="https://api.aladhan.com/v1"

# Calculation method (see options below)
PRAYER_TIME_API_METHOD="2"

# School of thought
PRAYER_TIME_API_SCHOOL="0"

# Time adjustments (optional)
PRAYER_TIME_SEHRI_ADJUSTMENT_MINUTES="0"
PRAYER_TIME_IFTAR_ADJUSTMENT_MINUTES="0"
```

### Calculation Methods

| Method | Name | Description |
|---------|-------|-------------|
| 0 | Ithna Ashari (Jafari) | Shia calculation method |
| 1 | University of Islamic Sciences, Karachi | Hanafi calculation |
| 2 | ISNA | Islamic Society of North America (Recommended for North America) |
| 3 | Muslim World League | MWL calculation method |
| 4 | Umm Al-Qura University, Makkah | Based in Saudi Arabia |
| 5 | Egyptian General Authority of Survey | Egyptian calculation |
| 7 | Institute of Geophysics, University of Tehran | Iranian calculation |
| 8 | Gulf Region | Gulf countries calculation |
| 9 | Kuwait | Kuwaiti calculation |
| 10 | Qatar | Qatari calculation |
| 11 | Majlis Ugama Islam Singapura | Singapore calculation |
| 12 | Union Organization Islamic de France | French calculation |
| 13 | Diyanet İşleri Başkanlığı | Turkish calculation |
| 14 | Spiritual Administration of Muslims of Russia | Russian calculation |
| 15 | Moonsighting Committee Worldwide | Global moonsighting |
| 16 | Dubai | Dubai calculation (unofficial) |

### School of Thought (Madhab)

| Value | Name | Followers |
|-------|-------|------------|
| 0 | Shafi | Indonesia, Malaysia, Singapore, Egypt, Saudi Arabia, etc. |
| 1 | Hanafi | Pakistan, India, Bangladesh, Turkey, etc. |

### Documentation
- [Official Documentation](https://aladhan.com/prayer-times-api)
- [GitHub Repository](https://github.com/aladhan/api)

### Testing the API

You can test the API directly in your browser:

```
https://api.aladhan.com/v1/calendar/2025/3?latitude=23.8103&longitude=90.4125&method=2&school=0
```

This will return prayer times for March 2025 in Dhaka, Bangladesh.

---

## Hadith API

### Overview
The Hadith API provides authentic hadith (sayings of Prophet Muhammad ﷺ) from various collections.

### Do I Need an API Key?
**Yes!** You need a free API key to use this service.

### Getting Your API Key

1. **Visit the website**: https://hadithapi.com/

2. **Sign up for a free account**:
   - Click "Sign Up" or "Register"
   - Enter your email and create a password
   - Verify your email address

3. **Get your API key**:
   - Log in to your dashboard
   - Navigate to "API Keys" section
   - Copy your API key

4. **Add to your environment**:
   ```env
   HADITH_API_KEY="your-actual-api-key-here"
   ```

### Usage Limits (Free Tier)

| Feature | Limit |
|----------|--------|
| Requests per month | 1,000 |
| Daily requests | ~33 |
| Authentication | Required |
| Rate limiting | Yes |

### Configuration

```env
# Add to .env.local
HADITH_API_KEY="your-hadith-api-key"
```

### Documentation
- [Official Documentation](https://hadithapi.com/docs)
- [GitHub Repository](https://github.com/hadithapi/hadithapi)

### Testing the API

Test your API key with curl:

```bash
curl -X GET "https://hadithapi.com/api/hadiths/random?apiKey=YOUR_API_KEY"
```

Or in your browser:

```
https://hadithapi.com/api/hadiths/random?apiKey=YOUR_API_KEY
```

### What If I Don't Have an API Key?

If you don't provide a `HADITH_API_KEY`, the hadith feature will be **disabled** automatically. The application will still work, but the "Hadith of the Day" section won't be displayed.

---

## PostgreSQL Database

### Overview
PostgreSQL is required to store prayer times, user data, and application settings.

### Do I Need an API Key?
**No!** You need a database connection string, not an API key.

### Getting a Free Database

#### Option 1: Supabase (Recommended)

1. **Visit**: https://supabase.com/

2. **Create a free account**:
   - Click "Start your project"
   - Sign up with GitHub or email

3. **Create a new project**:
   - Project name: `ramadan-clock`
   - Database password: Generate a strong password
   - Region: Choose closest to your users

4. **Get connection string**:
   - Go to Project Settings → Database
   - Copy the "Connection string"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

5. **Add to your environment**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

#### Option 2: Neon

1. **Visit**: https://neon.tech/

2. **Create a free account**:
   - Click "Sign in" → "Create account"

3. **Create a project**:
   - Project name: `ramadan-clock`
   - PostgreSQL version: 16
   - Region: Choose closest to your users

4. **Get connection string**:
   - Go to Dashboard → Projects
   - Click on your project
   - Copy the "Connection string"

5. **Add to your environment**:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]"
   ```

#### Option 3: Local Development

For local development, you can use Docker:

```bash
docker run --name postgres-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=ramadan-clock \
  -p 5432:5432 \
  -d postgres:16
```

Then use:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ramadan-clock"
```

### Configuration

```env
# Add to .env.local
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Database Schema

The application uses Prisma ORM. After setting your `DATABASE_URL`, run:

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### Documentation
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Summary

| Service | API Key Required? | Free Tier | Notes |
|----------|-------------------|------------|--------|
| Aladhan Prayer Time API | ❌ No | ✅ Unlimited | No setup needed |
| Hadith API | ✅ Yes | ✅ 1,000/month | Optional feature |
| PostgreSQL Database | ❌ No | ✅ Free tiers available | Required for app |

---

## Next Steps

1. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values**:
   - Add your database connection string
   - Add your Hadith API key (optional)
   - Configure Ramadan dates
   - Set timezone

3. **Run database migrations**:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

---

## Troubleshooting

### Aladhan API Issues

**Problem**: API returning incorrect times
- **Solution**: Check your `PRAYER_TIME_API_METHOD` and `PRAYER_TIME_API_SCHOOL` settings
- **Solution**: Verify latitude/longitude coordinates are correct

### Hadith API Issues

**Problem**: "Invalid API key" error
- **Solution**: Verify your API key is correct in `.env.local`
- **Solution**: Check if your API key has expired or reached limits

**Problem**: Hadith not displaying
- **Solution**: Ensure `HADITH_API_KEY` is set in `.env.local`
- **Solution**: Check browser console for API errors

### Database Issues

**Problem**: "Connection refused" error
- **Solution**: Verify database is running
- **Solution**: Check connection string format
- **Solution**: Ensure firewall allows connections

**Problem**: Migration errors
- **Solution**: Drop and recreate database: `pnpm db:push --force-reset`
- **Solution**: Check Prisma schema for syntax errors

---

## Support

For issues related to:
- **Aladhan API**: https://github.com/aladhan/api/issues
- **Hadith API**: https://hadithapi.com/support
- **PostgreSQL**: https://www.postgresql.org/community/
- **Ramadan Clock**: https://github.com/[your-username]/ramadan-clock/issues
