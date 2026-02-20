/**
 * Health Check Endpoint for Prayer Times
 * Provides monitoring and status information for the prayer time system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimeAPIService } from '@/lib/api/prayer-time-api';
import { getPrayerTimeCron } from '@/lib/cron/prayer-time-cron';
import { getPrayerTimeErrorHandler } from '@/lib/errors/prayer-time-error-handler';
import { prisma } from '@/lib/db';

/**
 * GET /api/health/prayer-times
 * Health check for the prayer time system
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const errorHandler = getPrayerTimeErrorHandler();

    // Check database connectivity
    let dbHealthy = false;
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
      dbHealthy = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check API connectivity
    let apiHealthy = false;
    let apiLatency = 0;
    try {
      const apiStart = Date.now();
      const apiService = getPrayerTimeAPIService();
      // Try to fetch a small sample to test connectivity
      await apiService.fetchPrayerTimes('Test', 23.8103, 90.4125, 2, 2026);
      apiLatency = Date.now() - apiStart;
      apiHealthy = true;
    } catch (error) {
      console.error('API health check failed:', error);
    }

    // Get cron status
    const cron = getPrayerTimeCron();
    const cronStatus = await cron.getStatusSummary();

    // Get error stats
    const errorStats = await errorHandler.getErrorStats(7);

    // Calculate overall health
    const isHealthy = dbHealthy && apiHealthy && (cronStatus.isHealthy || !cronStatus.lastExecution);

    const totalLatency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        latency: totalLatency,
        checks: {
          database: {
            healthy: dbHealthy,
            latency: dbLatency,
          },
          api: {
            healthy: apiHealthy,
            latency: apiLatency,
          },
          cron: {
            healthy: cronStatus.isHealthy,
            lastExecution: cronStatus.lastExecution?.executedAt || null,
            nextScheduled: cronStatus.nextScheduledUpdate,
          },
        },
        errorStats: {
          total: errorStats.total,
          unresolved: errorStats.unresolved,
          byType: errorStats.byType,
        },
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          status: 'error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
