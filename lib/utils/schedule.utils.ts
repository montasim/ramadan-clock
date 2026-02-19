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
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Check if current time is past a given time
 */
export function isTimePast(hours: number, minutes: number): boolean {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  return currentHours > hours || (currentHours === hours && currentMinutes >= minutes);
}

/**
 * Determine the status of a schedule entry based on date and time
 */
export function getScheduleStatus(entry: TimeEntry): ScheduleStatusResult {
  // Use local date instead of UTC to handle timezone correctly
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = entry.date === today;
  const entryDate = new Date(entry.date);
  const todayDate = new Date(today);
  
  const sehriTime = parseTime(entry.sehri);
  const iftarTime = parseTime(entry.iftar);
  
  let status: ScheduleStatus;
  let statusText: string;
  let rowClass: string;
  
  if (entryDate < todayDate) {
    // Past dates are always passed
    status = "passed";
    statusText = "Passed";
    rowClass = "bg-red-500/15 border-l-4 border-l-red-500/60 border-b border-red-500/40";
  } else if (isToday) {
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
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const isTomorrow = entryDate.getTime() === tomorrowDate.getTime();
    
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
