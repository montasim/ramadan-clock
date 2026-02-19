"use server";

import { prisma } from "@/lib/db";
import { TimeEntry } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

    return entry;
  } catch (error) {
    console.error("Error fetching today's schedule:", error);
    return null;
  }
}

export async function getFullSchedule(location?: string | null): Promise<TimeEntry[]> {
  try {
    const where = location ? { location } : {};

    const entries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return entries;
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
