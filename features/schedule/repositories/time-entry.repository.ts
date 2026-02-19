/**
 * Time Entry Repository
 * Data access layer for time entries using Repository Pattern
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type { TimeEntryDTO } from '../domain/entities/time-entry.entity';

/**
 * Time Entry Repository Interface
 * Defines the contract for time entry data operations
 */
export interface ITimeEntryRepository {
  findByDate(date: string, location?: string | null): Promise<TimeEntryDTO | null>;
  findByDateRange(startDate: string, endDate: string, location?: string | null): Promise<TimeEntryDTO[]>;
  findAll(location?: string | null): Promise<TimeEntryDTO[]>;
  findById(id: string): Promise<TimeEntryDTO | null>;
  create(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;
  update(id: string, data: Partial<Omit<TimeEntryDTO, 'id'>>): Promise<TimeEntryDTO>;
  delete(id: string): Promise<void>;
  upsert(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO>;
  getLocations(): Promise<string[]>;
  count(): Promise<number>;
}

/**
 * Time Entry Repository Implementation
 * Implements the repository interface using Prisma ORM
 */
export class TimeEntryRepository implements ITimeEntryRepository {
  /**
   * Find a time entry by date and optional location
   */
  async findByDate(date: string, location?: string | null): Promise<TimeEntryDTO | null> {
    try {
      const where: Record<string, unknown> = { date };
      if (location) {
        where.location = location;
      }

      const entry = await prisma.timeEntry.findFirst({ where });
      return entry;
    } catch (error) {
      logger.error('Failed to find time entry by date', { date, location }, error as Error);
      throw new DatabaseError('Failed to find time entry', error as Error);
    }
  }

  /**
   * Find time entries within a date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    location?: string | null
  ): Promise<TimeEntryDTO[]> {
    try {
      const where: Record<string, unknown> = {
        date: { gte: startDate, lte: endDate },
      };
      if (location) {
        where.location = location;
      }

      return await prisma.timeEntry.findMany({
        where,
        orderBy: { date: 'asc' },
      });
    } catch (error) {
      logger.error(
        'Failed to find time entries by date range',
        { startDate, endDate, location },
        error as Error
      );
      throw new DatabaseError('Failed to find time entries', error as Error);
    }
  }

  /**
   * Find all time entries, optionally filtered by location
   */
  async findAll(location?: string | null): Promise<TimeEntryDTO[]> {
    try {
      const where = location ? { location } : {};

      return await prisma.timeEntry.findMany({
        where,
        orderBy: { date: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to find all time entries', { location }, error as Error);
      throw new DatabaseError('Failed to find time entries', error as Error);
    }
  }

  /**
   * Find a time entry by ID
   */
  async findById(id: string): Promise<TimeEntryDTO | null> {
    try {
      return await prisma.timeEntry.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find time entry by id', { id }, error as Error);
      throw new DatabaseError('Failed to find time entry', error as Error);
    }
  }

  /**
   * Create a new time entry
   */
  async create(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO> {
    try {
      return await prisma.timeEntry.create({
        data,
      });
    } catch (error) {
      logger.error('Failed to create time entry', { data }, error as Error);
      throw new DatabaseError('Failed to create time entry', error as Error);
    }
  }

  /**
   * Update an existing time entry
   */
  async update(id: string, data: Partial<Omit<TimeEntryDTO, 'id'>>): Promise<TimeEntryDTO> {
    try {
      const updated = await prisma.timeEntry.update({
        where: { id },
        data,
      });

      return updated;
    } catch (error) {
      logger.error('Failed to update time entry', { id, data }, error as Error);
      throw new DatabaseError('Failed to update time entry', error as Error);
    }
  }

  /**
   * Delete a time entry by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.timeEntry.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to delete time entry', { id }, error as Error);
      throw new DatabaseError('Failed to delete time entry', error as Error);
    }
  }

  /**
   * Upsert a time entry (create or update)
   */
  async upsert(data: Omit<TimeEntryDTO, 'id'>): Promise<TimeEntryDTO> {
    try {
      return await prisma.timeEntry.upsert({
        where: {
          date_location: {
            date: data.date,
            location: data.location as string,
          },
        },
        update: {
          sehri: data.sehri,
          iftar: data.iftar,
        },
        create: data,
      });
    } catch (error) {
      logger.error('Failed to upsert time entry', { data }, error as Error);
      throw new DatabaseError('Failed to upsert time entry', error as Error);
    }
  }

  /**
   * Get all unique locations from time entries
   */
  async getLocations(): Promise<string[]> {
    try {
      const result = await prisma.timeEntry.groupBy({
        by: ['location'],
        where: {
          location: { not: null },
        },
      });

      return result.map((r) => r.location!).filter(Boolean);
    } catch (error) {
      logger.error('Failed to get locations', {}, error as Error);
      throw new DatabaseError('Failed to get locations', error as Error);
    }
  }

  /**
   * Count all time entries
   */
  async count(): Promise<number> {
    try {
      return await prisma.timeEntry.count();
    } catch (error) {
      logger.error('Failed to count time entries', {}, error as Error);
      throw new DatabaseError('Failed to count time entries', error as Error);
    }
  }
}
