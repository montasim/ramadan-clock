/**
 * Cache Debug API Endpoint
 * GET /api/cache/debug - Get cache statistics (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withErrorHandler,
  withAuth,
  success,
  error,
} from '@/lib/api';
import { CacheMonitor } from '@/lib/cache';
import { getGlobalApiClient } from '@/lib/api';

/**
 * Get cache debug information
 * 
 * @param request - Next.js request object
 * @returns NextResponse with cache statistics
 * 
 * @example
 * // GET /api/cache/debug
 * // Response: { success: true, data: { applicationCache: {...}, externalApiCache: {...} } }
 * 
 * @throws {UnauthorizedError} When user is not authenticated
 * @throws {ForbiddenError} When user is not admin
 */
async function getCacheDebugHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get application cache statistics
    const applicationCache = CacheMonitor.getStats();
    const overallStats = CacheMonitor.getOverallStats();
    
    // Get external API cache statistics
    const externalApiClient = getGlobalApiClient();
    const externalApiCache = externalApiClient.getCacheStats();
    
    return success({
      applicationCache: {
        ...applicationCache,
        overall: overallStats,
        trackedKeysCount: CacheMonitor.getTrackedKeysCount(),
      },
      externalApiCache,
    });
  } catch (err) {
    return error(
      500,
      'CacheDebugError',
      'Failed to get cache debug information',
      { message: err instanceof Error ? err.message : 'Unknown error' }
    );
  }
}

/**
 * GET handler with admin authentication
 */
export const GET = withErrorHandler(
  withAuth(getCacheDebugHandler, { requireAdmin: true })
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
