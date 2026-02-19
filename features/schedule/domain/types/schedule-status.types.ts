/**
 * Schedule Status Types
 * Type definitions for schedule status calculations
 */

/**
 * Schedule status type
 */
export type ScheduleStatus = 'passed' | 'today' | 'tomorrow' | 'upcoming';

/**
 * Schedule status information
 */
export interface ScheduleStatusInfo {
  status: ScheduleStatus;
  statusText: string;
  rowClass: string;
}

// Import TimeEntry class and value objects
import { TimeEntry } from '../entities/time-entry.entity';

/**
 * Schedule display data
 * Contains today's and tomorrow's schedules along with time status flags
 */
export interface ScheduleDisplayData {
  today: TimeEntry | null;
  tomorrow: TimeEntry | null;
  sehriPassed: boolean;
  iftarPassed: boolean;
}
