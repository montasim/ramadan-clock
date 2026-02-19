/**
 * Time Calculator Service
 * Business logic for calculating schedule status and time-related operations
 */

import { TimeEntry } from '../domain/entities/time-entry.entity';
import type { ScheduleStatusInfo } from '../domain/types/schedule-status.types';

/**
 * Time Calculator Service
 * Handles time-based calculations and status determinations
 */
export class TimeCalculatorService {
  /**
   * Calculate schedule status for a time entry
   * Determines if an entry is passed, today, tomorrow, or upcoming
   * @param entry - Time entry to calculate status for
   * @returns Status information with status type, text, and CSS class
   */
  calculateScheduleStatus(entry: TimeEntry): ScheduleStatusInfo {
    const entryDate = entry.date.toDate();
    const today = new Date();

    // Past dates are always passed
    if (entry.isPast()) {
      return {
        status: 'passed',
        statusText: 'Passed',
        rowClass: 'bg-red-500/10 border-red-500/30',
      };
    }

    // Today: check if iftar time has passed
    if (entry.isToday()) {
      if (entry.isIftarPassed()) {
        return {
          status: 'passed',
          statusText: 'Passed',
          rowClass: 'bg-red-500/10 border-red-500/30',
        };
      }
      return {
        status: 'today',
        statusText: 'Today',
        rowClass: 'bg-blue-500/6 border-blue-500/20',
      };
    }

    // Tomorrow: check if sehri time has passed
    if (entry.isTomorrow()) {
      if (entry.isSehriPassed()) {
        return {
          status: 'today',
          statusText: 'Today',
          rowClass: 'bg-blue-500/6 border-blue-500/20',
        };
      }
      return {
        status: 'tomorrow',
        statusText: 'Tomorrow',
        rowClass: 'hover:bg-primary/4 border-border/40',
      };
    }

    // Future dates beyond tomorrow
    return {
      status: 'upcoming',
      statusText: 'Upcoming',
      rowClass: 'hover:bg-primary/4 border-border/40',
    };
  }

  /**
   * Get schedule display data
   * Combines today's and tomorrow's schedules with time status flags
   * @param todayEntry - Today's time entry
   * @param tomorrowEntry - Tomorrow's time entry
   * @returns Schedule display data with status flags
   */
  getScheduleDisplayData(
    todayEntry: TimeEntry | null,
    tomorrowEntry: TimeEntry | null
  ): {
    today: TimeEntry | null;
    tomorrow: TimeEntry | null;
    sehriPassed: boolean;
    iftarPassed: boolean;
  } {
    let sehriPassed = false;
    let iftarPassed = false;

    if (todayEntry) {
      sehriPassed = todayEntry.isSehriPassed();
      iftarPassed = todayEntry.isIftarPassed();
    }

    return {
      today: todayEntry,
      tomorrow: tomorrowEntry,
      sehriPassed,
      iftarPassed,
    };
  }

  /**
   * Get display schedule based on iftar status
   * Returns today's schedule if iftar hasn't passed, otherwise tomorrow's
   * @param todayEntry - Today's time entry
   * @param tomorrowEntry - Tomorrow's time entry
   * @param iftarPassed - Whether iftar time has passed
   * @returns Appropriate time entry for display
   */
  getDisplaySchedule(
    todayEntry: TimeEntry | null,
    tomorrowEntry: TimeEntry | null,
    iftarPassed: boolean
  ): TimeEntry | null {
    return iftarPassed ? tomorrowEntry : todayEntry;
  }

  /**
   * Check if countdown should be shown for a given time
   * @param timeStr - Time string in HH:mm format
   * @param thresholdMinutes - Threshold in minutes (default: 60)
   * @returns True if countdown should be shown, false otherwise
   */
  shouldShowCountdown(timeStr: string, thresholdMinutes: number = 60): boolean {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    const diff = targetTime.getTime() - now.getTime();
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return diff <= thresholdMs && diff > 0;
  }
}
