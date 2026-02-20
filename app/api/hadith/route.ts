/**
 * Hadith API Endpoint
 * GET /api/hadith - Get a random hadith
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withErrorHandler,
  withRateLimit,
  withValidation,
  success,
  error,
} from '@/lib/api';
import { hadithQuerySchema } from '@/lib/validations/api-schemas';
import { fetchExternalJsonCached } from '@/lib/api';
import { logger } from '@/lib/logger';
import { CACHE_HEADERS } from '@/lib/cache';

/**
 * Hadith response interface
 */
interface HadithResponse {
  text: string;
  source: string;
}

/**
 * Get a random hadith from the collection
 * 
 * @param request - Next.js request object
 * @returns NextResponse with hadith data
 * 
 * @example
 * // GET /api/hadith
 * // Response: { success: true, data: { text: "...", source: "..." } }
 * 
 * @throws {ValidationError} When query parameters are invalid
 * @throws {RateLimitError} When rate limit is exceeded
 * 
 * Rate limit: 10 requests per minute
 * Cache: 1 hour
 */
async function getHadithHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { collection, id } = hadithQuerySchema.parse(queryParams);

    // Build URL
    const collections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'];
    const selectedCollection = collection || collections[Math.floor(Math.random() * collections.length)];
    const selectedId = id || Math.floor(Math.random() * 1000) + 1;

    const url = `https://hadithapi.pages.dev/api/${selectedCollection}/${selectedId}`;

    // Fetch with caching (1 hour)
    const data = await fetchExternalJsonCached(url, {}, 3600000);

    // Transform response
    const hadith: HadithResponse = {
      text: data.hadith_english,
      source: `${data.bookName} - ${data.refno}`,
    };

    logger.info('Hadith fetched successfully', {
      collection: selectedCollection,
      id: selectedId,
    });

    const response = success(hadith);
    
    // Add cache headers - hadith data is static, cache for 1 hour
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return response;
  } catch (err) {
    logger.error('Failed to fetch hadith', {}, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'HadithFetchError',
        'Failed to fetch hadith from external API',
        { message: err.message }
      );
    }

    return error(
      500,
      'HadithFetchError',
      'Failed to fetch hadith from external API'
    );
  }
}

/**
 * GET handler with middleware
 */
export const GET = withErrorHandler(
  withRateLimit(
    withValidation(getHadithHandler, hadithQuerySchema),
    { limit: 10, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
