/**
 * useTimeStatus Hook
 * Client-side hook to calculate time status (sehri/iftar passed)
 * This avoids caching issues by calculating time status on the client
 */

import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import { config } from '@/lib/config';

export interface TimeStatus {
  sehriPassed: boolean;
  iftarPassed: boolean;
}

export interface UseTimeStatusOptions {
  /** Sehri time in HH:mm format */
  sehri?: string | null;
  /** Iftar time in HH:mm format */
  iftar?: string | null;
  /** Update interval in milliseconds (default: 1000ms) */
  updateInterval?: number;
}

/**
 * Hook to calculate and track time status
 * Automatically updates every second to provide real-time status
 *
 * @param options - Configuration options
 * @returns Current time status
 *
 * @example
 * const { sehriPassed, iftarPassed } = useTimeStatus({
 *   sehri: '04:30',
 *   iftar: '18:15'
 * });
 */
export function useTimeStatus(options: UseTimeStatusOptions = {}): TimeStatus {
  const { sehri, iftar, updateInterval = 1000 } = options;
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({
    sehriPassed: false,
    iftarPassed: false,
  });

  const calculateTimeStatus = useCallback(() => {
    if (!sehri && !iftar) {
      return { sehriPassed: false, iftarPassed: false };
    }

    const now = moment().tz(config.timezone);
    const sehriPassed = sehri ? hasTimePassed(sehri, now) : false;
    const iftarPassed = iftar ? hasTimePassed(iftar, now) : false;

    return { sehriPassed, iftarPassed };
  }, [sehri, iftar]);

  useEffect(() => {
    // Initial calculation
    setTimeStatus(calculateTimeStatus());

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      setTimeStatus(calculateTimeStatus());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [calculateTimeStatus, updateInterval]);

  return timeStatus;
}

/**
 * Check if a specific time has passed
 * @param time - Time string in HH:mm format
 * @param referenceTime - Reference moment (defaults to current time)
 * @returns True if time has passed, false otherwise
 */
function hasTimePassed(time: string, referenceTime: moment.Moment): boolean {
  const targetTime = moment.tz(time, 'HH:mm', config.timezone);
  targetTime.set({
    year: referenceTime.year(),
    month: referenceTime.month(),
    date: referenceTime.date(),
  });
  return referenceTime.isSameOrAfter(targetTime);
}
