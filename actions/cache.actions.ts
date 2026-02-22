/**
 * Cache Management Server Actions
 * Actions for manual cache management and debugging
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { logger } from '@/lib/logger';
import { UnauthorizedError, AppError } from '@/lib/errors';
import { CACHE_TAGS } from '@/lib/cache/cache-config';

/**
 * Action result type
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Require admin session
 * @throws {UnauthorizedError} If not authenticated
 */
async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }

  // Since this is an admin-only application, any authenticated user is an admin
  return session;
}

/**
 * Clear all cache (admin only)
 * This should only be used for debugging or emergency purposes
 * @returns Success status
 */
export async function clearAllCache(): Promise<ActionResult> {
  try {
    await requireAdminSession();

    // Invalidate all cache tags
    revalidateTag(CACHE_TAGS.SCHEDULE, 'max');
    revalidateTag(CACHE_TAGS.STATS, 'max');
    revalidateTag(CACHE_TAGS.LOCATIONS, 'max');
    revalidateTag(CACHE_TAGS.PDF, 'max');
    revalidateTag(CACHE_TAGS.HADITH, 'max');

    // Revalidate all paths
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/import');

    logger.info('All cache cleared by admin');

    return {
      success: true,
      data: { message: 'All cache cleared successfully' },
    };
  } catch (error) {
    logger.error('Failed to clear cache', {}, error as Error);

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to clear cache',
      },
    };
  }
}

/**
 * Clear schedule cache (admin only)
 * @returns Success status
 */
export async function clearScheduleCache(): Promise<ActionResult> {
  try {
    await requireAdminSession();

    revalidateTag(CACHE_TAGS.SCHEDULE, 'max');
    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/admin/dashboard');

    logger.info('Schedule cache cleared by admin');

    return {
      success: true,
      data: { message: 'Schedule cache cleared successfully' },
    };
  } catch (error) {
    logger.error('Failed to clear schedule cache', {}, error as Error);

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to clear schedule cache',
      },
    };
  }
}
