/**
 * Schedule Entry API Endpoint
 * RESTful API for individual schedule entry management
 * 
 * GET    /api/schedule/[id] - Get specific entry
 * PUT    /api/schedule/[id] - Update entry (admin only)
 * DELETE /api/schedule/[id] - Delete entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import {
  withErrorHandler,
  withRateLimit,
  withAuth,
  withValidation,
  success,
  error,
  notFound,
} from '@/lib/api';
import { scheduleIdSchema, timeEntryUpdateSchema } from '@/lib/validations/api-schemas';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Get a specific time entry by ID
 * 
 * @param request - Next.js request object
 * @param context - Route context with params
 * @returns NextResponse with entry data
 * 
 * @example
 * // GET /api/schedule/abc-123-def
 * // Response: { success: true, data: {...} }
 */
async function getScheduleEntryHandler(
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    const params = await context?.params;
    if (!params?.id) {
      return error(400, 'BadRequest', 'Missing ID parameter');
    }

    const { id } = scheduleIdSchema.parse({ id: params.id });

    const entry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return notFound('TimeEntry', id);
    }

    logger.info('Time entry fetched successfully', { id });

    return success(entry);
  } catch (err) {
    const params = await context?.params;
    const id = params?.id || 'unknown';

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      logger.error('Validation failed for schedule entry fetch', { id, errors }, err as Error);

      return error(
        400,
        'ValidationError',
        'Invalid ID parameter',
        { errors }
      );
    }

    // Handle other errors
    logger.error('Failed to fetch time entry', { id }, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleEntryFetchError',
        'Failed to fetch time entry',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleEntryFetchError',
      'Failed to fetch time entry'
    );
  }
}

/**
 * Update a specific time entry
 * 
 * @param request - Next.js request object
 * @param context - Route context with params
 * @returns NextResponse with updated entry data
 * 
 * @example
 * // PUT /api/schedule/abc-123-def
 * // Body: { sehri: "04:35", iftar: "18:20" }
 * // Response: { success: true, data: {...} }
 */
async function updateScheduleEntryHandler(
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    const params = await context?.params;
    if (!params?.id) {
      return error(400, 'BadRequest', 'Missing ID parameter');
    }

    const { id } = scheduleIdSchema.parse({ id: params.id });
    const body = await request.json();
    const data = timeEntryUpdateSchema.parse(body);

    // Check if entry exists
    const existing = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound('TimeEntry', id);
    }

    // Update entry
    const entry = await prisma.timeEntry.update({
      where: { id },
      data,
    });

    logger.info('Time entry updated successfully', { id });

    return success(entry);
  } catch (err) {
    const params = await context?.params;
    const id = params?.id || 'unknown';

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      logger.error('Validation failed for schedule entry update', { id, errors }, err as Error);

      return error(
        400,
        'ValidationError',
        'Invalid input parameters',
        { errors }
      );
    }

    // Handle other errors
    logger.error('Failed to update time entry', { id }, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleEntryUpdateError',
        'Failed to update time entry',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleEntryUpdateError',
      'Failed to update time entry'
    );
  }
}

/**
 * Delete a specific time entry
 * 
 * @param request - Next.js request object
 * @param context - Route context with params
 * @returns NextResponse with success status
 * 
 * @example
 * // DELETE /api/schedule/abc-123-def
 * // Response: { success: true }
 */
async function deleteScheduleEntryHandler(
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    const params = await context?.params;
    if (!params?.id) {
      return error(400, 'BadRequest', 'Missing ID parameter');
    }

    const { id } = scheduleIdSchema.parse({ id: params.id });

    // Check if entry exists
    const existing = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound('TimeEntry', id);
    }

    // Delete entry
    await prisma.timeEntry.delete({
      where: { id },
    });

    logger.info('Time entry deleted successfully', { id });

    return success({ message: 'Time entry deleted successfully' });
  } catch (err) {
    const params = await context?.params;
    const id = params?.id || 'unknown';

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      logger.error('Validation failed for schedule entry delete', { id, errors }, err as Error);

      return error(
        400,
        'ValidationError',
        'Invalid ID parameter',
        { errors }
      );
    }

    // Handle other errors
    logger.error('Failed to delete time entry', { id }, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'ScheduleEntryDeleteError',
        'Failed to delete time entry',
        { message: err.message }
      );
    }

    return error(
      500,
      'ScheduleEntryDeleteError',
      'Failed to delete time entry'
    );
  }
}

/**
 * GET handler with middleware
 */
export const GET = withErrorHandler(
  withRateLimit(
    getScheduleEntryHandler,
    { limit: 30, windowMs: 60 * 1000 }
  )
);

/**
 * PUT handler with middleware (admin only)
 */
export const PUT = withErrorHandler(
  withRateLimit(
    withAuth(updateScheduleEntryHandler, { requireAdmin: true }),
    { limit: 10, windowMs: 60 * 1000 }
  )
);

/**
 * DELETE handler with middleware (admin only)
 */
export const DELETE = withErrorHandler(
  withRateLimit(
    withAuth(deleteScheduleEntryHandler, { requireAdmin: true }),
    { limit: 10, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
