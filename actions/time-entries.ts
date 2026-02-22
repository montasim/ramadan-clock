"use server";

import { prisma, type TimeEntry } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import moment from 'moment-timezone';
import { unstable_cache } from 'next/cache';
import { CACHE_CONFIG, CACHE_TAGS } from '@/lib/cache';
import { config } from "@/lib/config";
import { TimeFormatterService } from '@/features/schedule/services';
import { getCurrentDate, hasTimePassed } from '@/lib/utils/time.utils';
import { logger } from '@/lib/logger';

const timezone = config.timezone;

// Helper function to format time entries for display
// Returns entry with 12-hour format for display, but preserves original 24-hour format
function formatTimeEntry(entry: TimeEntry): TimeEntry & { sehri24: string; iftar24: string } {
  const formatter = new TimeFormatterService();
  const formatted = formatter.formatEntry(entry);
  return {
    ...entry,
    sehri: formatted.sehri,
    iftar: formatted.iftar,
    sehri24: formatted.sehri24,
    iftar24: formatted.iftar24,
  };
}

// Uncached version of getTodaySchedule for internal use
async function getTodayScheduleUncached(location?: string | null): Promise<TimeEntry | null> {
  try {
    const today = getCurrentDate();

    const where: Record<string, unknown> = {
      date: today,
    };

    if (location) {
      where.location = location;
    }

    const entry = await prisma.timeEntry.findFirst({
      where,
    });

    return entry ? formatTimeEntry(entry) : null;
  } catch (error) {
    logger.error("Error fetching today's schedule", { location }, error as Error);
    return null;
  }
}

// Cached version of getTodaySchedule
export const getTodaySchedule = unstable_cache(
  async (location?: string | null) => getTodayScheduleUncached(location),
  ['today-schedule'],
  {
    revalidate: CACHE_CONFIG.todaySchedule.duration,
    tags: [CACHE_TAGS.SCHEDULE],
  }
);


/**
 * Get today's schedule or next day's schedule if iftar has passed
 */
async function getTodayOrNextDayScheduleUncached(location?: string | null): Promise<TimeEntry | null> {
  try {
    const today = getCurrentDate();
    const tomorrow = moment().tz(timezone).add(1, 'day').format('YYYY-MM-DD');

    const where: Record<string, unknown> = { date: today };
    if (location) {
      where.location = location;
    }

    const todayEntry = await prisma.timeEntry.findFirst({ where });

    if (todayEntry && hasTimePassed(todayEntry.iftar)) {
      // Get next day's schedule
      const tomorrowWhere: Record<string, unknown> = { date: tomorrow };
      if (location) {
        tomorrowWhere.location = location;
      }
      const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });
      return tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null;
    }

    return todayEntry ? formatTimeEntry(todayEntry) : null;
  } catch (error) {
    logger.error("Error fetching today/next day schedule", { location }, error as Error);
    return null;
  }
}

// Cached version of getTodayOrNextDaySchedule
export const getTodayOrNextDaySchedule = unstable_cache(
  async (location?: string | null) => getTodayOrNextDayScheduleUncached(location),
  ['today-or-next-day-schedule'],
  {
    revalidate: CACHE_CONFIG.todaySchedule.duration,
    tags: [CACHE_TAGS.SCHEDULE],
  }
);

/**
 * Get schedule display data with time status information
 * Returns both today's and tomorrow's schedules along with time status flags
 */
async function getScheduleDisplayDataUncached(location?: string | null) {
  try {
    const today = getCurrentDate();
    const tomorrow = moment().tz(timezone).add(1, 'day').format('YYYY-MM-DD');

    // Get today's schedule
    const todayWhere: Record<string, unknown> = { date: today };
    if (location) {
      todayWhere.location = location;
    }
    const todayEntry = await prisma.timeEntry.findFirst({ where: todayWhere });

    // Get tomorrow's schedule
    const tomorrowWhere: Record<string, unknown> = { date: tomorrow };
    if (location) {
      tomorrowWhere.location = location;
    }
    const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });

    // Determine time status
    let sehriPassed = false;
    let iftarPassed = false;

    if (todayEntry) {
      sehriPassed = hasTimePassed(todayEntry.sehri);
      iftarPassed = hasTimePassed(todayEntry.iftar);
    }

    return {
      today: todayEntry ? formatTimeEntry(todayEntry) : null,
      tomorrow: tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null,
      sehriPassed,
      iftarPassed,
    };
  } catch (error) {
    logger.error("Error fetching schedule display data", { location }, error as Error);
    return {
      today: null,
      tomorrow: null,
      sehriPassed: false,
      iftarPassed: false,
    };
  }
}

// Cached version of getScheduleDisplayData
export const getScheduleDisplayData = unstable_cache(
  async (location?: string | null) => getScheduleDisplayDataUncached(location),
  ['schedule-display-data'],
  {
    revalidate: CACHE_CONFIG.todaySchedule.duration,
    tags: [CACHE_TAGS.SCHEDULE],
  }
);

async function getFullScheduleUncached(location?: string | null): Promise<(TimeEntry & { sehri24: string; iftar24: string })[]> {
  try {
    const where = location ? { location } : {};

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return entries.map(formatTimeEntry);
  } catch (error) {
    logger.error("Error fetching full schedule", { location }, error as Error);
    return [];
  }
}

// Cached version of getFullSchedule
export const getFullSchedule = unstable_cache(
  async (location?: string | null) => getFullScheduleUncached(location),
  ['full-schedule'],
  {
    revalidate: CACHE_CONFIG.schedule.duration,
    tags: [CACHE_TAGS.SCHEDULE],
  }
);

export async function getScheduleByDateRange(
  startDate: string,
  endDate: string,
  location?: string | null
): Promise<TimeEntry[]> {
  try {
    const where: Record<string, unknown> = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (location) {
      where.location = location;
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return entries;
  } catch (error) {
    logger.error("Error fetching schedule by date range", { startDate, endDate, location }, error as Error);
    return [];
  }
}

async function getLocationsUncached(): Promise<string[]> {
  try {
    const result = await prisma.timeEntry.groupBy({
      by: ["location"],
      where: {
        location: { not: null },
      },
    });

    return result
      .map((r) => r.location!)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    logger.error("Error fetching locations", {}, error as Error);
    return [];
  }
}

// Cached version of getLocations
export const getLocations = unstable_cache(
  async () => getLocationsUncached(),
  ['locations'],
  {
    revalidate: CACHE_CONFIG.locations.duration,
    tags: [CACHE_TAGS.LOCATIONS],
  }
);

export async function getTimeEntryById(id: string): Promise<TimeEntry | null> {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    return entry;
  } catch (error) {
    logger.error("Error fetching time entry", { id }, error as Error);
    return null;
  }
}

export async function deleteTimeEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.timeEntry.delete({
      where: { id },
    });

    // Invalidate caches
    revalidateTag(CACHE_TAGS.SCHEDULE, CACHE_TAGS.SCHEDULE);
    revalidateTag(CACHE_TAGS.STATS, CACHE_TAGS.STATS);
    revalidateTag(CACHE_TAGS.LOCATIONS, CACHE_TAGS.LOCATIONS);
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    logger.error("Error deleting time entry", { id }, error as Error);
    return { success: false, error: "Failed to delete entry" };
  }
}

/**
 * Bulk delete time entries (admin only)
 * Deletes multiple entries in a single database operation for better performance
 * @param ids - Array of time entry IDs to delete
 * @returns Success status and optional error message
 */
export async function bulkDeleteTimeEntries(ids: string[]): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
  try {
    if (ids.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Delete all entries in a single operation
    const result = await prisma.timeEntry.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // Invalidate caches
    revalidateTag(CACHE_TAGS.SCHEDULE, CACHE_TAGS.SCHEDULE);
    revalidateTag(CACHE_TAGS.STATS, CACHE_TAGS.STATS);
    revalidateTag(CACHE_TAGS.LOCATIONS, CACHE_TAGS.LOCATIONS);
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin/dashboard");

    return { success: true, deletedCount: result.count };
  } catch (error) {
    logger.error("Error bulk deleting time entries", { count: ids.length }, error as Error);
    return { success: false, error: "Failed to delete entries" };
  }
}

export async function updateTimeEntry(
  id: string,
  data: { date?: string; sehri?: string; iftar?: string; location?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.timeEntry.update({
      where: { id },
      data,
    });

    // Invalidate caches
    revalidateTag(CACHE_TAGS.SCHEDULE, CACHE_TAGS.SCHEDULE);
    revalidateTag(CACHE_TAGS.STATS, CACHE_TAGS.STATS);
    revalidateTag(CACHE_TAGS.LOCATIONS, CACHE_TAGS.LOCATIONS);
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    logger.error("Error updating time entry", { id, data }, error as Error);
    return { success: false, error: "Failed to update entry" };
  }
}

async function getStatsUncached() {
  try {
    const [totalEntries, locations, recentUploads] = await Promise.all([
      prisma.timeEntry.count(),
      prisma.timeEntry.groupBy({
        by: ["location"],
        where: {
          location: { not: null },
        },
      }),
      prisma.uploadLog.findMany({
        take: 5,
        orderBy: { uploadedAt: "desc" },
      }),
    ]);

    return {
      totalEntries,
      totalLocations: locations.length,
      recentUploads,
    };
  } catch (error) {
    logger.error("Error fetching stats", {}, error as Error);
    return {
      totalEntries: 0,
      totalLocations: 0,
      recentUploads: [],
    };
  }
}

// Cached version of getStats
export const getStats = unstable_cache(
  async () => getStatsUncached(),
  ['stats'],
  {
    revalidate: CACHE_CONFIG.stats.duration,
    tags: [CACHE_TAGS.STATS],
  }
);
