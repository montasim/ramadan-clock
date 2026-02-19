/**
 * Upload Log Repository
 * Data access layer for upload logs using Repository Pattern
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError } from '@/lib/errors';

/**
 * Upload Log Data Transfer Object
 */
export interface UploadLogDTO {
  id: string;
  fileName: string;
  rowCount: number;
  status: 'success' | 'partial' | 'failed';
  errors: string | null;
  uploadedAt: Date;
}

/**
 * Create Upload Log Data Transfer Object
 */
export interface CreateUploadLogDTO {
  fileName: string;
  rowCount: number;
  status: 'success' | 'partial' | 'failed';
  errors: string | null;
}

/**
 * Upload Log Repository
 * Handles data operations for upload logs
 */
export class UploadLogRepository {
  /**
   * Create a new upload log entry
   */
  async create(data: CreateUploadLogDTO): Promise<UploadLogDTO> {
    try {
      return (await prisma.uploadLog.create({
        data,
      })) as UploadLogDTO;
    } catch (error) {
      logger.error('Failed to create upload log', { data }, error as Error);
      throw new DatabaseError('Failed to create upload log', error as Error);
    }
  }

  /**
   * Find recent upload logs
   * @param limit - Maximum number of logs to return (default: 5)
   */
  async findRecent(limit: number = 5): Promise<UploadLogDTO[]> {
    try {
      return (await prisma.uploadLog.findMany({
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      })) as UploadLogDTO[];
    } catch (error) {
      logger.error('Failed to find recent upload logs', { limit }, error as Error);
      throw new DatabaseError('Failed to find upload logs', error as Error);
    }
  }

  /**
   * Count all upload logs
   */
  async count(): Promise<number> {
    try {
      return await prisma.uploadLog.count();
    } catch (error) {
      logger.error('Failed to count upload logs', {}, error as Error);
      throw new DatabaseError('Failed to count upload logs', error as Error);
    }
  }
}
