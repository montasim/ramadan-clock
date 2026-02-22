/**
 * API Route: Fetch Prayer Times from Aladhan
 * Handles GET requests to fetch prayer times for Bangladesh districts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getGlobalAladhanWrapper, type FetchOptions, type FetchProgress, type AladhanPrayerTimes, type DateRangeOptions, type MultiMonthOptions, type RateLimitConfig } from '@/lib/api/aladhan-api-wrapper';
import { BANGLADESH_DISTRICTS } from '@/lib/config/locations.config';
import { logger } from '@/lib/logger';
import { UnauthorizedError, AppError } from '@/lib/errors';
import { RATE_LIMIT_PRESETS } from '@/lib/config/app.config';
import { progressStore } from '@/lib/progress/progress-store';

/**
 * GET /api/prayer-times/fetch
 * Query parameters:
 * - mode: 'dateRange' | 'multiMonth'
 * - startDate: YYYY-MM-DD (for dateRange mode)
 * - endDate: YYYY-MM-DD (for dateRange mode)
 * - year: number (for multiMonth mode)
 * - months: comma-separated month numbers (for multiMonth mode)
 * - districts: comma-separated district names (optional)
 */
export async function GET(request: NextRequest) {
  let progressOpId: string | null = null;
  
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operationId');

    // Parse rate limit configuration
    let rateLimitConfig: RateLimitConfig | undefined;
    const rateLimitPreset = searchParams.get('rateLimitPreset') as 'conservative' | 'balanced' | 'aggressive' | null;
    const rateLimitConfigJson = searchParams.get('rateLimitConfig');

    if (rateLimitPreset && RATE_LIMIT_PRESETS[rateLimitPreset]) {
      rateLimitConfig = RATE_LIMIT_PRESETS[rateLimitPreset];
      logger.info(`Using rate limit preset: ${rateLimitPreset}`, rateLimitConfig as unknown as Record<string, unknown>);
    } else if (rateLimitConfigJson) {
      try {
        rateLimitConfig = JSON.parse(rateLimitConfigJson) as RateLimitConfig;
        logger.info('Using custom rate limit config', rateLimitConfig as unknown as Record<string, unknown>);
      } catch (error) {
        logger.warn('Failed to parse rate limit config', { error: (error as Error).message });
      }
    }

    // Get or create wrapper with rate limit config
    const aladhanWrapper = getGlobalAladhanWrapper(rateLimitConfig);
    const mode = searchParams.get('mode') as 'dateRange' | 'multiMonth' | 'hijriMonth' | null;

    if (!mode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Mode parameter is required. Use "dateRange" or "multiMonth"',
          },
        },
        { status: 400 }
      );
    }

    // Parse districts parameter
    const districtsParam = searchParams.get('districts');
    let districts: string[] = [];

    if (districtsParam) {
      districts = districtsParam.split(',').map(d => d.trim()).filter(d => d.length > 0);
      
      // Validate districts
      const invalidDistricts = districts.filter(d => !BANGLADESH_DISTRICTS.includes(d as any));
      if (invalidDistricts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: `Invalid districts: ${invalidDistricts.join(', ')}`,
              details: { invalidDistricts },
            },
          },
          { status: 400 }
        );
      }
    }

    // Build fetch options
    let fetchOptions: FetchOptions;

    if (mode === 'dateRange') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'startDate and endDate are required for dateRange mode',
            },
          },
          { status: 400 }
        );
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'Invalid date format. Use YYYY-MM-DD',
            },
          },
          { status: 400 }
        );
      }

      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'startDate must be before or equal to endDate',
            },
          },
          { status: 400 }
        );
      }

      fetchOptions = {
        mode: 'dateRange',
        startDate,
        endDate,
        districts: districts.length > 0 ? districts : ['Dhaka'],
      };
    } else if (mode === 'multiMonth') {
      const yearParam = searchParams.get('year');
      const monthsParam = searchParams.get('months');

      if (!yearParam || !monthsParam) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'year and months are required for multiMonth mode',
            },
          },
          { status: 400 }
        );
      }

      const year = parseInt(yearParam, 10);
      const months = monthsParam.split(',')
        .map(m => parseInt(m.trim(), 10))
        .filter(m => !isNaN(m) && m >= 1 && m <= 12);

      if (isNaN(year) || year < 2020 || year > 2030) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'Invalid year. Must be between 2020 and 2030',
            },
          },
          { status: 400 }
        );
      }

      if (months.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'At least one month must be selected',
            },
          },
          { status: 400 }
        );
      }

      // Remove duplicates
      const uniqueMonths = [...new Set(months)];

      fetchOptions = {
        mode: 'multiMonth',
        year,
        months: uniqueMonths,
        districts: districts.length > 0 ? districts : ['Dhaka'],
      };
    } else if (mode === 'hijriMonth') {
      const hijriMonthParam = searchParams.get('hijriMonth');
      const hijriYearParam = searchParams.get('hijriYear');

      if (!hijriMonthParam || !hijriYearParam) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'hijriMonth and hijriYear are required for hijriMonth mode',
            },
          },
          { status: 400 }
        );
      }

      const hijriMonth = parseInt(hijriMonthParam, 10);
      const hijriYear = parseInt(hijriYearParam, 10);

      if (isNaN(hijriMonth) || hijriMonth < 1 || hijriMonth > 12) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'Invalid Hijri month. Must be between 1 and 12',
            },
          },
          { status: 400 }
        );
      }

      if (isNaN(hijriYear) || hijriYear < 1400 || hijriYear > 1500) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: 'Invalid Hijri year. Must be between 1400 and 1500',
            },
          },
          { status: 400 }
        );
      }

      fetchOptions = {
        mode: 'hijriMonth',
        hijriMonth,
        hijriYear,
        districts: districts.length > 0 ? districts : ['Dhaka'],
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Invalid mode. Use "dateRange", "multiMonth", or "hijriMonth"',
          },
        },
        { status: 400 }
      );
    }

    // Calculate total entries for progress tracking
    let totalEntries = 0;
    if (fetchOptions.mode === 'dateRange') {
      const startDate = (fetchOptions as DateRangeOptions).startDate;
      const endDate = (fetchOptions as DateRangeOptions).endDate;
      const daysCount = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalEntries = daysCount * districts.length;
    } else if (fetchOptions.mode === 'multiMonth') {
      const year = (fetchOptions as any).year;
      const months = (fetchOptions as any).months;
      const daysCount = months.reduce((sum: number, month: number) => {
        return sum + new Date(year, month, 0).getDate();
      }, 0);
      totalEntries = daysCount * districts.length;
    } else if (fetchOptions.mode === 'hijriMonth') {
      // For hijri month, we don't know exact days ahead of time, estimate 30 days
      totalEntries = 30 * districts.length;
    }

    // Create or use existing progress operation
    progressOpId = operationId;
    if (!progressOpId) {
      progressOpId = progressStore.create('fetch', totalEntries, 'initializing');
    } else {
      // Update existing operation
      const existing = progressStore.get(progressOpId);
      if (!existing || existing.type !== 'fetch') {
        throw new Error('Invalid operation ID');
      }
    }

    // Update status to fetching
    progressStore.update(progressOpId, { status: 'fetching', message: 'Fetching prayer times from Aladhan API...' });

    // Fetch prayer times from Aladhan API with progress callback
    const entries = await aladhanWrapper.fetchPrayerTimes(fetchOptions, (progress: FetchProgress) => {
      progressStore.update(progressOpId!, {
        current: progress.current,
        status: progress.status === 'completed' ? 'processing' : 'fetching',
        currentDistrict: progress.currentDistrict,
        message: `Fetching ${progress.currentDistrict}...`,
      });
    });

    // Calculate metadata - default to Dhaka only
    const selectedDistricts = districts.length > 0 ? districts : ['Dhaka'];
    const totalDistricts = selectedDistricts.length;
    const totalDays = entries.length / totalDistricts;
    const fetchedTotalEntries = entries.length;

    // Calculate date range for metadata
    let dateRange: { start: string; end: string } | undefined;
    if (fetchOptions.mode === 'dateRange') {
      dateRange = {
        start: (fetchOptions as DateRangeOptions).startDate,
        end: (fetchOptions as DateRangeOptions).endDate,
      };
    } else if (fetchOptions.mode === 'multiMonth') {
      const allDates = entries.map(e => e.date);
      const sortedDates = [...new Set(allDates)].sort();
      dateRange = {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1],
      };
    }

    // Mark progress as completed
    progressStore.complete(progressOpId, `Successfully fetched ${entries.length} prayer times`);

    logger.info('Prayer times fetched successfully', {
      mode,
      totalDistricts,
      totalDays,
      totalEntries: fetchedTotalEntries,
      dateRange,
      operationId: progressOpId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          entries,
          meta: {
            totalDistricts,
            totalDays,
            totalEntries: fetchedTotalEntries,
            fetchMode: mode,
            dateRange,
          },
          operationId: progressOpId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error fetching prayer times', { error }, error as Error);

    // Mark progress as failed if we have an operation ID
    if (progressOpId) {
      progressStore.fail(progressOpId, error instanceof Error ? error.message : 'Failed to fetch prayer times');
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.constructor.name,
            message: error.message,
          },
        },
        { status: error instanceof UnauthorizedError ? 401 : 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'InternalServerError',
          message: 'Failed to fetch prayer times',
        },
      },
      { status: 500 }
    );
  }
}
