/**
 * Repositories exports
 */

export { TimeEntryRepository, type ITimeEntryRepository } from './time-entry.repository';
export { UploadLogRepository } from './upload-log.repository';
export type { UploadLogDTO, CreateUploadLogDTO } from './upload-log.repository';

// Segregated interfaces for better adherence to Interface Segregation Principle
export type { ITimeEntryReader } from './time-entry-reader.interface';
export type { ITimeEntryWriter } from './time-entry-writer.interface';
