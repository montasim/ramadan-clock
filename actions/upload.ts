"use server";

import { prisma } from "@/lib/db";
import { timeEntryArraySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export interface UploadResult {
  success: boolean;
  message: string;
  rowCount?: number;
  errors?: Array<{ row: number; error: string }>;
}

export async function uploadSchedule(
  entries: Array<{
    date: string;
    sehri: string;
    iftar: string;
    location?: string | null;
  }>,
  fileName: string
): Promise<UploadResult> {
  const errors: Array<{ row: number; error: string }> = [];
  const validEntries: Array<{
    date: string;
    sehri: string;
    iftar: string;
    location?: string | null;
  }> = [];

  // Validate each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const result = timeEntryArraySchema.safeParse([entry]);

    if (!result.success) {
      errors.push({
        row: i + 1,
        error: result.error.issues.map((e) => e.message).join(", "),
      });
    } else {
      validEntries.push(entry);
    }
  }

  if (validEntries.length === 0) {
    return {
      success: false,
      message: "No valid entries found",
      errors,
    };
  }

  // Check for duplicates within the upload
  const seen = new Set<string>();
  const uniqueEntries: typeof validEntries = [];

  for (const entry of validEntries) {
    const key = `${entry.date}-${entry.location || ""}`;
    if (seen.has(key)) {
      errors.push({
        row: validEntries.indexOf(entry) + 1,
        error: `Duplicate entry for ${entry.date} in ${entry.location || "no location"}`,
      });
    } else {
      seen.add(key);
      uniqueEntries.push(entry);
    }
  }

  // Bulk upsert entries
  const operations = uniqueEntries.map((entry) =>
    prisma.timeEntry.upsert({
      where: {
        date_location: {
          date: entry.date,
          location: entry.location as string,
        },
      },
      update: {
        sehri: entry.sehri,
        iftar: entry.iftar,
      },
      create: {
        date: entry.date,
        sehri: entry.sehri,
        iftar: entry.iftar,
        location: entry.location as string,
      },
    })
  );

  try {
    await Promise.all(operations);

    // Log the upload
    await prisma.uploadLog.create({
      data: {
        fileName,
        rowCount: uniqueEntries.length,
        status: errors.length > 0 ? "partial" : "success",
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/calendar");

    return {
      success: true,
      message: `Successfully uploaded ${uniqueEntries.length} entries`,
      rowCount: uniqueEntries.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error uploading schedule:", error);

    await prisma.uploadLog.create({
      data: {
        fileName,
        rowCount: 0,
        status: "failed",
        errors: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      success: false,
      message: "Failed to upload entries",
      errors,
    };
  }
}

export async function validateScheduleFile(
  entries: Array<{
    date: string;
    sehri: string;
    iftar: string;
    location?: string | null;
  }>
): Promise<{ valid: boolean; errors: Array<{ row: number; error: string }>; preview: Array<typeof entries[0]> }> {
  const errors: Array<{ row: number; error: string }> = [];
  const validEntries: typeof entries = [];

  // Limit to 1000 rows
  if (entries.length > 1000) {
    return {
      valid: false,
      errors: [{ row: 0, error: "File exceeds maximum of 1000 rows" }],
      preview: [],
    };
  }

  // Validate each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const result = timeEntryArraySchema.safeParse([entry]);

    if (!result.success) {
      errors.push({
        row: i + 1,
        error: result.error.issues.map((e) => e.message).join(", "),
      });
    } else {
      validEntries.push(entry);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    preview: validEntries, // Return all entries for preview
  };
}
