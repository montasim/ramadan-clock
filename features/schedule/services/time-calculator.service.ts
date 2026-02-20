/**
 * Time Calculator Service
 * Business logic for calculating schedule status and time-related operations
 */

import moment from 'moment';
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
    const entryDate = moment(entry.date);
    const today = moment();

    // Past dates are always passed
    if (entryDate.isBefore(today, 'day')) {
      return {
        status: 'passed',
        statusText: 'Passed',
        rowClass: 'bg-red-500/10 border-red-500/30',
      };
    }

    // Today: check if iftar time has passed
    if (entryDate.isSame(today, 'day')) {
      const iftarTime = moment(entry.iftar, 'HH:mm');
      iftarTime.set({
        year: today.year(),
        month: today.month(),
        date: today.date(),
      });
      
      if (today.isSameOrAfter(iftarTime)) {
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
    const tomorrow = moment().add(1, 'day');
    if (entryDate.isSame(tomorrow, 'day')) {
      const sehriTime = moment(entry.sehri, 'HH:mm');
      sehriTime.set({
        year: today.year(),
        month: today.month(),
        date: today.date(),
      });
      
      if (today.isSameOrAfter(sehriTime)) {
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
      const now = moment();
      const sehriTime = moment(todayEntry.sehri, 'HH:mm');
      const iftarTime = moment(todayEntry.iftar, 'HH:mm');
      
      sehriTime.set({
        year: now.year(),
        month: now.month(),
        date: now.date(),
      });
      iftarTime.set({
        year: now.year(),
        month: now.month(),
        date: now.date(),
      });
      
      sehriPassed = now.isSameOrAfter(sehriTime);
      iftarPassed = now.isSameOrAfter(iftarTime);
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
    const now = moment();
    const targetTime = moment(timeStr, 'HH:mm');
    targetTime.set({
      year: now.year(),
      month: now.month(),
      date: now.date(),
    });
    const diff = targetTime.diff(now);
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return diff <= thresholdMs && diff > 0;
  }
}
