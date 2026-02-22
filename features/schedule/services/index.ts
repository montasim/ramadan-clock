/**
 * Services exports
 */

export { TimeCalculatorService } from './time-calculator.service';
export { ScheduleService } from './schedule.service';
export { UploadService } from './upload.service';
export { TimeFormatterService, getTimeFormatterService } from './time-formatter.service';
export type { ParsedEntry, UploadResult } from './upload.service';
export type { FormattedTimeEntry } from './time-formatter.service';

// Segregated interfaces for better adherence to Interface Segregation Principle
export type { IScheduleQueryService } from './schedule-query.interface';
export type { IScheduleDisplayService } from './schedule-display.interface';
export type { IScheduleAdminService } from './schedule-admin.interface';
