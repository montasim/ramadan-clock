/**
 * API Validation Schemas
 * Zod schemas for validating API inputs
 */

import { z } from 'zod/v4';

/**
 * Hadith API query schema
 */
export const hadithQuerySchema = z.object({
  collection: z.enum(['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']).optional(),
  id: z.coerce.number().min(1).max(10000).optional(),
});

/**
 * PDF API query schema
 */
export const pdfQuerySchema = z.object({
  location: z.string().min(1).max(100).optional(),
  type: z.enum(['today', 'full']).default('today'),
  format: z.enum(['pdf', 'csv']).default('pdf'),
});

/**
 * Schedule API query schema
 */
export const scheduleQuerySchema = z.object({
  location: z.string().min(1).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Schedule ID parameter schema
 */
export const scheduleIdSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

/**
 * Time entry create schema
 */
export const timeEntryCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  sehri: z.string().regex(/^\d{2}:\d{2}$/, 'Sehri time must be in HH:mm format'),
  iftar: z.string().regex(/^\d{2}:\d{2}$/, 'Iftar time must be in HH:mm format'),
  location: z.string().min(1).max(100).optional().nullable(),
});

/**
 * Time entry update schema
 */
export const timeEntryUpdateSchema = timeEntryCreateSchema.partial();

/**
 * Batch time entry schema
 */
export const batchTimeEntrySchema = z.object({
  entries: z.array(timeEntryCreateSchema).min(1).max(5000),
});

/**
 * Location parameter schema
 */
export const locationParamsSchema = z.object({
  city: z.string().min(1).max(100),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before or equal to end date' }
);

/**
 * Export type for hadith query
 */
export type HadithQuery = z.infer<typeof hadithQuerySchema>;

/**
 * Export type for PDF query
 */
export type PdfQuery = z.infer<typeof pdfQuerySchema>;

/**
 * Export type for schedule query
 */
export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;

/**
 * Export type for time entry create
 */
export type TimeEntryCreate = z.infer<typeof timeEntryCreateSchema>;

/**
 * Export type for time entry update
 */
export type TimeEntryUpdate = z.infer<typeof timeEntryUpdateSchema>;

/**
 * Export type for batch time entry
 */
export type BatchTimeEntry = z.infer<typeof batchTimeEntrySchema>;
