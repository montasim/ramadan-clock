import moment from 'moment';
import { TimeEntry } from "@prisma/client";

export type ScheduleStatus = "passed" | "today" | "tomorrow" | "upcoming";

export interface ScheduleStatusResult {
  status: ScheduleStatus;
  statusText: string;
  rowClass: string;
}

/**
 * Parse a time string (HH:MM) into hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const m = moment(timeStr, 'HH:mm');
  return { hours: m.hours(), minutes: m.minutes() };
}

/**
 * Check if current time is past a given time
 */
export function isTimePast(hours: number, minutes: number): boolean {
  const now = moment();
  const targetTime = moment().set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  return now.isSameOrAfter(targetTime);
}

/**
 * Determine the status of a schedule entry based on date and time
 */
export function getScheduleStatus(entry: TimeEntry): ScheduleStatusResult {
  const today = moment();
  const entryDate = moment(entry.date);
  
  const sehriTime = parseTime(entry.sehri);
  const iftarTime = parseTime(entry.iftar);
  
  let status: ScheduleStatus;
  let statusText: string;
  let rowClass: string;
  
  if (entryDate.isBefore(today, 'day')) {
    // Past dates are always passed
    status = "passed";
    statusText = "Passed";
    rowClass = "bg-red-500/15 border-l-4 border-l-red-500/60 border-b border-red-500/40";
  } else if (entryDate.isSame(today, 'day')) {
    // Today: check if iftar time has passed
    if (isTimePast(iftarTime.hours, iftarTime.minutes)) {
      status = "passed";
      statusText = "Passed";
      rowClass = "bg-red-500/15 border-l-4 border-l-red-500/60 border-b border-red-500/40";
    } else {
      status = "today";
      statusText = "Today";
      rowClass = "bg-blue-500/6 border-blue-500/20";
    }
  } else {
    // Future dates: check if it's tomorrow
    const tomorrow = moment().add(1, 'day');
    const isTomorrow = entryDate.isSame(tomorrow, 'day');
    
    if (isTomorrow) {
      // Tomorrow: check if sehri time has passed
      if (isTimePast(sehriTime.hours, sehriTime.minutes)) {
        status = "today";
        statusText = "Today";
        rowClass = "bg-blue-500/6 border-blue-500/20";
      } else {
        status = "tomorrow";
        statusText = "Tomorrow";
        rowClass = "hover:bg-primary/4 border-border/40";
      }
    } else {
      status = "upcoming";
      statusText = "Upcoming";
      rowClass = "hover:bg-primary/4 border-border/40";
    }
  }
  
  return { status, statusText, rowClass };
}

/**
 * Get the row class for a schedule entry (simplified version for location page)
 */
export function getScheduleRowClass(entry: TimeEntry): string {
  const { rowClass } = getScheduleStatus(entry);
  // For location page, use simplified styling without border-l
  return rowClass.replace('border-l-4 border-l-red-500/60 ', '');
}
