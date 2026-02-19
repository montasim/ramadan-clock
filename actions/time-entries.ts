"use server";

import { prisma, type TimeEntry } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { formatTime12Hour } from "@/lib/utils";

// Extended type for formatted entries with both 12-hour and 24-hour formats
type FormattedTimeEntry = TimeEntry & {
  sehri24: string;
  iftar24: string;
};

// Helper function to format time entries for display
// Returns entry with 12-hour format for display, but preserves original 24-hour format
function formatTimeEntry(entry: TimeEntry): FormattedTimeEntry {
  return {
    ...entry,
    sehri: formatTime12Hour(entry.sehri),
    iftar: formatTime12Hour(entry.iftar),
    // Preserve original 24-hour format for editing
    sehri24: entry.sehri,
    iftar24: entry.iftar,
  };
}

export async function getTodaySchedule(location?: string | null): Promise<TimeEntry | null> {
  try {
    const today = new Date().toISOString().split("T")[0];

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
    console.error("Error fetching today's schedule:", error);
    return null;
  }
}

/**
 * Check if iftar time has passed for today
 */
function hasIftarPassed(todaySchedule: TimeEntry): boolean {
  const now = new Date();
  const [iftarHours, iftarMinutes] = todaySchedule.iftar.split(':').map(Number);
  const iftarTime = new Date();
  iftarTime.setHours(iftarHours, iftarMinutes, 0, 0);
  return now >= iftarTime;
}

/**
 * Check if sehri time has passed for today
 */
function hasSehriPassed(todaySchedule: TimeEntry): boolean {
  const now = new Date();
  const [sehriHours, sehriMinutes] = todaySchedule.sehri.split(':').map(Number);
  const sehriTime = new Date();
  sehriTime.setHours(sehriHours, sehriMinutes, 0, 0);
  return now >= sehriTime;
}

/**
 * Get today's schedule or next day's schedule if iftar has passed
 */
export async function getTodayOrNextDaySchedule(location?: string | null): Promise<TimeEntry | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const where: Record<string, unknown> = { date: today };
    if (location) {
      where.location = location;
    }

    const todayEntry = await prisma.timeEntry.findFirst({ where });

    if (todayEntry && hasIftarPassed(todayEntry)) {
      // Get next day's schedule
      const tomorrowWhere: Record<string, unknown> = { date: tomorrowStr };
      if (location) {
        tomorrowWhere.location = location;
      }
      const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });
      return tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null;
    }

    return todayEntry ? formatTimeEntry(todayEntry) : null;
  } catch (error) {
    console.error("Error fetching today/next day schedule:", error);
    return null;
  }
}

/**
 * Get schedule display data with time status information
 * Returns both today's and tomorrow's schedules along with time status flags
 */
export async function getScheduleDisplayData(location?: string | null) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Get today's schedule
    const todayWhere: Record<string, unknown> = { date: today };
    if (location) {
      todayWhere.location = location;
    }
    const todayEntry = await prisma.timeEntry.findFirst({ where: todayWhere });

    // Get tomorrow's schedule
    const tomorrowWhere: Record<string, unknown> = { date: tomorrowStr };
    if (location) {
      tomorrowWhere.location = location;
    }
    const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });

    // Determine time status
    let sehriPassed = false;
    let iftarPassed = false;

    if (todayEntry) {
      sehriPassed = hasSehriPassed(todayEntry);
      iftarPassed = hasIftarPassed(todayEntry);
    }

    return {
      today: todayEntry ? formatTimeEntry(todayEntry) : null,
      tomorrow: tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null,
      sehriPassed,
      iftarPassed,
    };
  } catch (error) {
    console.error("Error fetching schedule display data:", error);
    return {
      today: null,
      tomorrow: null,
      sehriPassed: false,
      iftarPassed: false,
    };
  }
}

export async function getFullSchedule(location?: string | null): Promise<FormattedTimeEntry[]> {
  try {
    const where = location ? { location } : {};

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return entries.map(formatTimeEntry);
  } catch (error) {
    console.error("Error fetching full schedule:", error);
    return [];
  }
}

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
    console.error("Error fetching schedule by date range:", error);
    return [];
  }
}

export async function getLocations(): Promise<string[]> {
  try {
    const result = await prisma.timeEntry.groupBy({
      by: ["location"],
      where: {
        location: { not: null },
      },
    });

    return result.map((r) => r.location!).filter(Boolean);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function getTimeEntryById(id: string): Promise<TimeEntry | null> {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    return entry;
  } catch (error) {
    console.error("Error fetching time entry:", error);
    return null;
  }
}

export async function deleteTimeEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.timeEntry.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return { success: false, error: "Failed to delete entry" };
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

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating time entry:", error);
    return { success: false, error: "Failed to update entry" };
  }
}

export async function getStats() {
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
    console.error("Error fetching stats:", error);
    return {
      totalEntries: 0,
      totalLocations: 0,
      recentUploads: [],
    };
  }
}
