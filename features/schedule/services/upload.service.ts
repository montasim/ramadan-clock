/**
 * Upload Service
 * Business logic for file upload operations
 */

import { TimeEntryRepository } from '../repositories/time-entry.repository';
import { UploadLogRepository } from '../repositories/upload-log.repository';
import { logger } from '@/lib/logger';
import { UPLOAD_CONFIG } from '@/lib/config/index';
import { timeEntryArraySchema } from '@/lib/validations';

/**
 * Parsed entry from file
 */
export interface ParsedEntry {
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  message: string;
  rowCount?: number;
  errors?: Array<{ row: number; error: string }>;
}

/**
 * Upload Service
 * Handles file upload validation and processing
 */
export class UploadService {
  constructor(
    private readonly timeEntryRepository: TimeEntryRepository,
    private readonly uploadLogRepository: UploadLogRepository
  ) {}

  /**
   * Validate schedule file entries
   * @param entries - Parsed entries from file
   * @returns Validation result with errors and preview
   */
  async validateScheduleFile(entries: ParsedEntry[]): Promise<{
    valid: boolean;
    errors: Array<{ row: number; error: string }>;
    preview: ParsedEntry[];
  }> {
    const errors: Array<{ row: number; error: string }> = [];
    const validEntries: ParsedEntry[] = [];

    // Check row limit
    if (entries.length > UPLOAD_CONFIG.maxRows) {
      return {
        valid: false,
        errors: [
          {
            row: 0,
            error: `File exceeds maximum of ${UPLOAD_CONFIG.maxRows} rows`,
          },
        ],
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
          error: result.error.issues.map((e) => e.message).join(', '),
        });
      } else {
        validEntries.push(entry);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      preview: validEntries,
    };
  }

  /**
   * Upload schedule entries
   * @param entries - Parsed entries from file
   * @param fileName - Name of the uploaded file
   * @returns Upload result
   */
  async uploadSchedule(entries: ParsedEntry[], fileName: string): Promise<UploadResult> {
    const errors: Array<{ row: number; error: string }> = [];
    const validEntries: ParsedEntry[] = [];

    // Validate each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const result = timeEntryArraySchema.safeParse([entry]);

      if (!result.success) {
        errors.push({
          row: i + 1,
          error: result.error.issues.map((e) => e.message).join(', '),
        });
      } else {
        validEntries.push(entry);
      }
    }

    if (validEntries.length === 0) {
      return {
        success: false,
        message: 'No valid entries found',
        errors,
      };
    }

    // Check for duplicates within the upload
    const seen = new Set<string>();
    const uniqueEntries: ParsedEntry[] = [];

    for (const entry of validEntries) {
      const key = `${entry.date}-${entry.location || ''}`;
      if (seen.has(key)) {
        errors.push({
          row: validEntries.indexOf(entry) + 1,
          error: `Duplicate entry for ${entry.date} in ${entry.location || 'no location'}`,
        });
      } else {
        seen.add(key);
        uniqueEntries.push(entry);
      }
    }

    // Bulk upsert entries
    try {
      await Promise.all(
        uniqueEntries.map((entry) =>
          this.timeEntryRepository.upsert({
            date: entry.date,
            sehri: entry.sehri,
            iftar: entry.iftar,
            location: entry.location as string,
          })
        )
      );

      // Log the upload
      await this.uploadLogRepository.create({
        fileName,
        rowCount: uniqueEntries.length,
        status: errors.length > 0 ? 'partial' : 'success',
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      });

      return {
        success: true,
        message: `Successfully uploaded ${uniqueEntries.length} entries`,
        rowCount: uniqueEntries.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      logger.error(
        'Error uploading schedule',
        { fileName, entryCount: uniqueEntries.length },
        error as Error
      );

      await this.uploadLogRepository.create({
        fileName,
        rowCount: 0,
        status: 'failed',
        errors: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        message: 'Failed to upload entries',
        errors,
      };
    }
  }
}
