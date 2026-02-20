/**
 * Health Check API Endpoint
 * GET /api/health - System health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { success, error } from '@/lib/api';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Health check response
 */
interface HealthCheckResponse {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * Get system health status
 * 
 * @param request - Next.js request object
 * @returns NextResponse with health status
 * 
 * @example
 * // GET /api/health
 * // Response: { status: 'ok', timestamp: '...', version: '1.0.0', checks: {...} }
 */
async function getHealthHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const checks: HealthCheckResponse['checks'] = {
    database: { status: 'ok' },
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };

  let overallStatus: 'ok' | 'error' | 'degraded' = 'ok';

  try {
    // Check database connectivity
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database.latency = Date.now() - dbStart;
      checks.database.status = 'ok';
    } catch (dbError) {
      logger.error('Database health check failed', {}, dbError as Error);
      checks.database.status = 'error';
      overallStatus = 'degraded';
    }

    // Check memory usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memoryUsage = process.memoryUsage();
      checks.memory.used = Math.round(memoryUsage.heapUsed / 1024 / 1024); // MB
      checks.memory.total = Math.round(memoryUsage.heapTotal / 1024 / 1024); // MB
      checks.memory.percentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

      // Warn if memory usage is high
      if (checks.memory.percentage > 90) {
        overallStatus = 'degraded';
      }
    }

    const responseTime = Date.now() - startTime;
    const version = process.env.npm_package_version || '1.0.0';

    const healthData: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version,
      checks,
    };

    const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    logger.info('Health check completed', {
      status: overallStatus,
      responseTime,
      checks,
    });

    return success(healthData, statusCode);
  } catch (err) {
    logger.error('Health check failed', {}, err as Error);

    return error(
      503,
      'HealthCheckError',
      'Health check failed',
      { error: err instanceof Error ? err.message : 'Unknown error' }
    );
  }
}

/**
 * GET handler
 */
export const GET = getHealthHandler;

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
