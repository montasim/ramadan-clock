/**
 * API Route: Preview Fetched Prayer Times
 * Returns preview data for fetched prayer times with pagination and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { BANGLADESH_DISTRICTS } from '@/lib/config/locations.config';
import { logger } from '@/lib/logger';
import { UnauthorizedError, AppError } from '@/lib/errors';

/**
 * In-memory cache for fetched prayer times (per session)
 * This allows previewing data without re-fetching
 */
const previewCache = new Map<string, { entries: any[]; timestamp: number }>();

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * GET /api/prayer-times/preview
 * Query parameters:
 * - district: district name (optional, default: all)
 * - page: page number (optional, default: 1)
 * - limit: entries per page (optional, default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Page number must be greater than 0',
          },
        },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 500) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Limit must be between 1 and 500',
          },
        },
        { status: 400 }
      );
    }

    // Validate district if provided
    if (district && !BANGLADESH_DISTRICTS.includes(district as any)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: `Invalid district: ${district}`,
            details: { availableDistricts: BANGLADESH_DISTRICTS },
          },
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = district || 'all';
    const cached = previewCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      logger.info('Returning cached preview data', { cacheKey, age: now - cached.timestamp });

      // Apply pagination to cached data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEntries = cached.entries.slice(startIndex, endIndex);

      return NextResponse.json(
        {
          success: true,
          data: {
            entries: paginatedEntries,
            pagination: {
              page,
              limit,
              total: cached.entries.length,
              totalPages: Math.ceil(cached.entries.length / limit),
              hasNext: endIndex < cached.entries.length,
              hasPrevious: page > 1,
            },
            meta: {
              district: district || 'All',
              cached: true,
              cacheAge: now - cached.timestamp,
            },
          },
        },
        { status: 200 }
      );
    }

    // No cache available or expired
    // Return empty response with instructions
    logger.info('No cached preview data available', { cacheKey });

    return NextResponse.json(
      {
        success: true,
        data: {
          entries: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: page > 1,
          },
          meta: {
            district: district || 'All',
            cached: false,
            message: 'No data available. Please fetch prayer times first using /api/prayer-times/fetch',
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in preview route', { error }, error as Error);

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
          message: 'Failed to get preview data',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prayer-times/preview/cache
 * Cache prayer times data for preview
 * This is called after successful fetch to store data in cache
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const body = await request.json();
    const { entries, district } = body;

    if (!Array.isArray(entries)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Entries must be an array',
          },
        },
        { status: 400 }
      );
    }

    // Validate entries structure
    if (entries.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Entries array cannot be empty',
          },
        },
        { status: 400 }
      );
    }

    // Validate each entry
    const entrySchema = {
      date: 'string',
      sehri: 'string',
      iftar: 'string',
      location: 'string',
    };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.date || !entry.sehri || !entry.iftar || !entry.location) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ValidationError',
              message: `Entry at index ${i} is missing required fields`,
              details: { entry },
            },
          },
          { status: 400 }
        );
      }
    }

    // Store in cache
    const cacheKey = district || 'all';
    previewCache.set(cacheKey, {
      entries,
      timestamp: Date.now(),
    });

    logger.info('Prayer times cached for preview', { cacheKey, entryCount: entries.length });

    return NextResponse.json(
      {
        success: true,
        data: {
          cached: true,
          cacheKey,
          entryCount: entries.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error caching preview data', { error }, error as Error);

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
          message: 'Failed to cache preview data',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prayer-times/preview/cache
 * Clear the preview cache
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    // Clear cache for specific district or all
    if (district) {
      previewCache.delete(district);
      logger.info('Preview cache cleared for district', { district });
    } else {
      previewCache.clear();
      logger.info('All preview cache cleared');
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          cleared: true,
          district: district || 'all',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error clearing preview cache', { error }, error as Error);

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
          message: 'Failed to clear preview cache',
        },
      },
      { status: 500 }
    );
  }
}
