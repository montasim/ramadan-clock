/**
 * Upload Schedule Use Case
 * Application logic for uploading schedule entries
 */

import { UploadService } from '../services/upload.service';
import type { UploadResult, ParsedEntry } from '../services/upload.service';

/**
 * Upload Schedule Use Case
 * Encapsulates the logic for uploading schedule entries
 */
export class UploadScheduleUseCase {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Validate schedule file entries
   * @param entries - Parsed entries from file
   * @returns Validation result with errors and preview
   */
  async validate(entries: ParsedEntry[]) {
    return await this.uploadService.validateScheduleFile(entries);
  }

  /**
   * Upload schedule entries
   * @param entries - Parsed entries from file
   * @param fileName - Name of the uploaded file
   * @returns Upload result
   */
  async upload(entries: ParsedEntry[], fileName: string): Promise<UploadResult> {
    return await this.uploadService.uploadSchedule(entries, fileName);
  }
}
