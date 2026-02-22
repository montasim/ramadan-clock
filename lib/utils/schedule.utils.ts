import moment from 'moment-timezone';
import { TimeEntry } from "@prisma/client";
import { config } from "@/lib/config";

// Configured timezone for the application (from config)
const APP_TIMEZONE = config.timezone;

// Cache the user timezone to ensure consistency across multiple calls
let cachedUserTimezone: string | null = null;

// Get user's local timezone from browser, fallback to app timezone
const getUserTimezone = () => {
  if (cachedUserTimezone) {
    return cachedUserTimezone;
  }
  try {
    cachedUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || APP_TIMEZONE;
  } catch {
    cachedUserTimezone = APP_TIMEZONE;
  }
  return cachedUserTimezone;
};

export type ScheduleStatus = "passed" | "today" | "tomorrow" | "upcoming";

export interface ScheduleStatusResult {
  status: ScheduleStatus;
  statusText: string;
  rowClass: string;
}

export interface RamadanDates {
  startDate?: string; // YYYY-MM-DD format
  endDate?: string;   // YYYY-MM-DD format
}

/**
 * Parse a time string (HH:MM or h:mm A) into hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  // Try 24-hour format first (HH:mm), then 12-hour format (h:mm A)
  let m = moment(timeStr, 'HH:mm', true);
  if (!m.isValid()) {
    m = moment(timeStr, 'h:mm A', true);
  }
  return { hours: m.hours(), minutes: m.minutes() };
}

/**
 * Check if current time is past a given time
 */
export function isTimePast(hours: number, minutes: number): boolean {
  const userTimezone = getUserTimezone();
  const now = moment().tz(userTimezone);
  const targetTime = moment().tz(userTimezone).set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  return now.isSameOrAfter(targetTime);
}

/**
 * Determine the status of a schedule entry based on date and time
 */
export function getScheduleStatus(entry: TimeEntry, allEntries: TimeEntry[] = [], ramadanDates?: RamadanDates): ScheduleStatusResult {
  const userTimezone = getUserTimezone();
  const today = moment().tz(userTimezone);
  // Create entryDate with explicit timezone to ensure consistent comparisons
  const entryDate = moment.tz(entry.date, userTimezone);
  
  const sehriTime = parseTime(entry.sehri);
  const iftarTime = parseTime(entry.iftar);
  
  let status: ScheduleStatus;
  let statusText: string;
  let rowClass: string;
  
  // Check if Ramadan dates are configured
  const ramadanStartDate = ramadanDates?.startDate 
    ? moment.tz(ramadanDates.startDate, userTimezone) 
    : null;
  
  if (ramadanStartDate && entryDate.isBefore(ramadanStartDate, 'day')) {
    // Date is before Ramadan - mark as passed
    status = "passed";
    statusText = "Passed";
    rowClass = "bg-red-500/15 border-l-4 border-l-red-500/60 border-b border-red-500/40";
  } else if (entryDate.isBefore(today, 'day')) {
    // Past dates (but during or after Ramadan) - mark as passed
    status = "passed";
    statusText = "Passed";
    rowClass = "bg-red-500/15 border-l-4 border-l-red-500/60 border-b border-red-500/40";
  } else if (entryDate.isSame(today, 'day')) {
    // Today: check if both sehri and iftar times have passed
    const sehriPassed = isTimePast(sehriTime.hours, sehriTime.minutes);
    const iftarPassed = isTimePast(iftarTime.hours, iftarTime.minutes);
    if (sehriPassed && iftarPassed) {
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
    const tomorrow = moment().tz(userTimezone).add(1, 'day');
    const isTomorrow = entryDate.isSame(tomorrow, 'day');
    
    if (isTomorrow) {
      // Tomorrow is always marked as tomorrow, regardless of today's times
      status = "tomorrow";
      statusText = "Tomorrow";
      rowClass = "hover:bg-primary/4 border-border/40";
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
export function getScheduleRowClass(entry: TimeEntry, allEntries: TimeEntry[] = [], ramadanDates?: RamadanDates): string {
  const { rowClass } = getScheduleStatus(entry, allEntries, ramadanDates);
  // For location page, use simplified styling without border-l
  return rowClass.replace('border-l-4 border-l-red-500/60 ', '');
}
