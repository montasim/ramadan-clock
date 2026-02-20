/**
 * Schedule API Endpoint
 * RESTful API for schedule management
 * 
 * GET    /api/schedule - Get schedule (with pagination)
 * POST   /api/schedule - Create new entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withErrorHandler,
  withRateLimit,
  withAuth,
  withValidation,
  success,
  paginated,
  error,
  notFound,
  type PaginationMeta,
} from '@/lib/api';
import { scheduleQuerySchema, timeEntryCreateSchema } from '@/lib/validations/api-schemas';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Get schedule with optional filtering and pagination
 * 
 * @param request - Next.js request object
 * @returns NextResponse with paginated schedule data
 * 
 * @example
 * // GET /api/schedule?location=Dhaka&page=1&limit=20
 * // Response: { success: true, data: [...], pagination: {...} }
 */
async function getScheduleHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { location, startDate, endDate, page, limit } = scheduleQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {};

    if (location) {
      where.location = location;
    }

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get total count
    const total = await prisma.timeEntry.count({ where });

    // Get paginated data
    const skip = (page - 1) * limit;
    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'asc' },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    logger.info('Schedule fetched successfully', {
      location,
      startDate,
      endDate,
      page,
      limit,
      total,
    });

    return paginated(entries, pagination);
  } catch (err) {
    logger.error('Failed to fetch schedule', {}, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleFetchError',
        'Failed to fetch schedule',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleFetchError',
      'Failed to fetch schedule'
    );
  }
}

/**
 * Create a new time entry
 * 
 * @param request - Next.js request object
 * @returns NextResponse with created entry
 * 
 * @example
 * // POST /api/schedule
 * // Body: { date: "2024-03-12", sehri: "04:30", iftar: "18:15", location: "Dhaka" }
 * // Response: { success: true, data: {...} }
 */
async function createScheduleHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const data = timeEntryCreateSchema.parse(body);

    // Check if entry already exists
    const existing = await prisma.timeEntry.findFirst({
      where: {
        date: data.date,
        location: data.location || null,
      },
    });

    if (existing) {
      return error(
        409,
        'ConflictError',
        'Time entry already exists for this date and location',
        { date: data.date, location: data.location }
      );
    }

    // Create new entry
    const entry = await prisma.timeEntry.create({
      data,
    });

    logger.info('Time entry created successfully', {
      id: entry.id,
      date: entry.date,
      location: entry.location,
    });

    return success(entry, 201);
  } catch (err) {
    logger.error('Failed to create time entry', {}, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleCreateError',
        'Failed to create time entry',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleCreateError',
      'Failed to create time entry'
    );
  }
}

/**
 * GET handler with middleware
 */
export const GET = withErrorHandler(
  withRateLimit(getScheduleHandler, { limit: 30, windowMs: 60 * 1000 })
);

/**
 * POST handler with middleware (admin only)
 */
export const POST = withErrorHandler(
  withRateLimit(
    withAuth(createScheduleHandler, { requireAdmin: true }),
    { limit: 10, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
