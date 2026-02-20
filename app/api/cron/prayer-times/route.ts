/**
 * API Route for Prayer Time Cron Job
 * Allows manual triggering and status checking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimeCron } from '@/lib/cron/prayer-time-cron';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/cron/prayer-times
 * Get the status of the last cron execution
 */
export async function GET(request: NextRequest) {
  try {
    const cron = getPrayerTimeCron();
    const status = await cron.getStatusSummary();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching cron status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/prayer-times
 * Manually trigger the prayer time update
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'CRON_SECRET_KEY not configured',
        },
        { status: 500 }
      );
    }

    // Check for authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Missing or invalid authorization header',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Invalid token',
        },
        { status: 401 }
      );
    }

    // Parse request body for optional parameters
    const body = await request.json().catch(() => ({}));
    const { year, month } = body;

    const cron = getPrayerTimeCron();
    let result;

    if (year && month) {
      // Execute for specific month
      result = await cron.executeForSpecificMonth(year, month);
    } else {
      // Execute for current month
      result = await cron.executeMonthlyUpdate();
    }

    if (result.success) {
      // Invalidate cache after successful update
      revalidatePath('/');
      revalidatePath('/calendar');
      revalidatePath('/admin/dashboard');

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          data: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
