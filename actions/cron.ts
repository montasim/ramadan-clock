/**
 * Server Actions for Cron Job Management
 */

"use server";

import { getPrayerTimeCron } from '@/lib/cron/prayer-time-cron';

/**
 * Get cron status summary
 */
export async function getCronStatus() {
  try {
    const cron = getPrayerTimeCron();
    const status = await cron.getStatusSummary();
    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error('Error fetching cron status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger cron job manually
 * Requires authentication via session
 */
export async function triggerCronJob(year?: number, month?: number) {
  try {
    const cron = getPrayerTimeCron();
    let result;

    if (year && month) {
      result = await cron.executeForSpecificMonth(year, month);
    } else {
      result = await cron.executeMonthlyUpdate();
    }

    return {
      success: result.success,
      data: result,
    };
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
