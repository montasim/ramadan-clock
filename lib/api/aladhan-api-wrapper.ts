/**
 * Aladhan API Wrapper Service
 * Fetches prayer times from Aladhan API for Bangladesh districts
 */

import { ExternalApiClient, fetchExternalJson } from '@/lib/api/external-api-client';
import { BANGLADESH_DISTRICTS, LOCATION_COORDINATES, getLocationCoordinates } from '@/lib/config/locations.config';
import { logger } from '@/lib/logger';
import { ALADHAN_CONFIG } from '@/lib/config/app.config';
import { TokenBucketRateLimiter, getGlobalTokenBucketLimiter, type TokenBucketConfig } from '@/lib/api/token-bucket-rate-limiter';

/**
 * Rate limit configuration for Aladhan API wrapper
 */
export interface RateLimitConfig {
  batchSize: number;
  interRequestDelay: number;
  interDistrictDelay: number;
  tokenBucket: TokenBucketConfig;
  maxConcurrentDistricts?: number; // Maximum number of districts to process in parallel
}

/**
 * Aladhan API response structure for single day
 */
interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      timestamp: string;
    };
    meta: {
      timezone: string;
    };
  };
}

/**
 * Aladhan API response structure for Hijri calendar
 */
interface HijriCalendarResponse {
  code: number;
  status: string;
  data: Array<{
    timings: {
      Fajr: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;  // DD-MM-YYYY
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
      hijri: {
        date: string;  // DD-MM-YYYY
        format: string;
        day: string;
        weekday: {
          ar: string;
          en: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  }>;
}

/**
 * Prayer times entry from Aladhan API
 */
export interface AladhanPrayerTimes {
  date: string;      // YYYY-MM-DD
  sehri: string;     // HH:mm (Fajr time)
  iftar: string;     // HH:mm (Maghrib time)
  location: string;   // District name
}

/**
 * Date range fetch options
 */
export interface DateRangeOptions {
  mode: 'dateRange';
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  districts?: string[];  // Optional: specific districts
}

/**
 * Multi-month fetch options
 */
export interface MultiMonthOptions {
  mode: 'multiMonth';
  year: number;
  months: number[];  // Array of month numbers (1-12)
  districts?: string[];  // Optional: specific districts
}

/**
 * Hijri month fetch options
 */
export interface HijriMonthOptions {
  mode: 'hijriMonth';
  hijriMonth: number;  // Hijri month number (1-12)
  hijriYear: number;  // Hijri year (e.g., 1446)
  districts?: string[];  // Optional: specific districts
}

/**
 * Fetch options union type
 */
export type FetchOptions = DateRangeOptions | MultiMonthOptions | HijriMonthOptions;

/**
 * Fetch progress callback
 */
export interface FetchProgress {
  current: number;
  total: number;
  percentage: number;
  currentDistrict: string;
  status: 'fetching' | 'completed' | 'failed';
}

export type ProgressCallback = (progress: FetchProgress) => void;

/**
 * Aladhan API Wrapper Service
 */
export class AladhanApiWrapper {
  private apiClient: ExternalApiClient;
  private cache: Map<string, AladhanPrayerTimes[]> = new Map();
  private rateLimiter: TokenBucketRateLimiter;
  private rateLimitConfig: RateLimitConfig;

  constructor(rateLimitConfig?: RateLimitConfig) {
    this.apiClient = new ExternalApiClient();
    
    // Use provided config or default from ALADHAN_CONFIG
    this.rateLimitConfig = rateLimitConfig || {
      batchSize: ALADHAN_CONFIG.batchSize,
      interRequestDelay: ALADHAN_CONFIG.interRequestDelay,
      interDistrictDelay: ALADHAN_CONFIG.interDistrictDelay,
      tokenBucket: ALADHAN_CONFIG.tokenBucket,
      maxConcurrentDistricts: 5, // Default: process 5 districts in parallel
    };

    // Initialize token bucket rate limiter
    this.rateLimiter = getGlobalTokenBucketLimiter(this.rateLimitConfig.tokenBucket);
    
    logger.info('AladhanApiWrapper initialized with rate limiting', {
      batchSize: this.rateLimitConfig.batchSize,
      interRequestDelay: this.rateLimitConfig.interRequestDelay,
      interDistrictDelay: this.rateLimitConfig.interDistrictDelay,
      maxConcurrentDistricts: this.rateLimitConfig.maxConcurrentDistricts,
      tokenBucket: this.rateLimitConfig.tokenBucket,
    });
  }

  /**
   * Fetch prayer times based on options
   */
  async fetchPrayerTimes(options: FetchOptions, onProgress?: ProgressCallback): Promise<AladhanPrayerTimes[]> {
    try {
      if (options.mode === 'dateRange') {
        return await this.fetchPrayerTimesByDateRange(options, onProgress);
      } else if (options.mode === 'multiMonth') {
        return await this.fetchPrayerTimesByMultiMonth(options, onProgress);
      } else if (options.mode === 'hijriMonth') {
        return await this.fetchPrayerTimesByHijriMonth(options, onProgress);
      } else {
        throw new Error(`Invalid mode: ${(options as any).mode}`);
      }
    } catch (error) {
      logger.error('Failed to fetch prayer times', { options }, error as Error);
      throw error;
    }
  }

  /**
   * Fetch prayer times for a date range
   */
  async fetchPrayerTimesByDateRange(options: DateRangeOptions, onProgress?: ProgressCallback): Promise<AladhanPrayerTimes[]> {
    const { startDate, endDate, districts = BANGLADESH_DISTRICTS } = options;
    const dates = this.generateDateRange(startDate, endDate);
    const allEntries: AladhanPrayerTimes[] = [];
    const maxConcurrent = this.rateLimitConfig.maxConcurrentDistricts || 5;

    logger.info(`Fetching prayer times for date range`, { startDate, endDate, districtCount: districts.length, dayCount: dates.length, maxConcurrent });

    // Process districts in parallel with controlled concurrency
    for (let i = 0; i < districts.length; i += maxConcurrent) {
      const batch = districts.slice(i, i + maxConcurrent);
      
      // Process this batch of districts in parallel
      const batchResults = await Promise.all(
        batch.map(async (district) => {
          const districtEntries = await this.fetchDistrictPrayerTimes(district, dates);
          
          // Add delay between districts within the batch (except for first in batch)
          const batchIndex = batch.indexOf(district);
          if (batchIndex > 0) {
            await this.sleep(this.rateLimitConfig.interDistrictDelay);
          }
          
          return { district, entries: districtEntries };
        })
      );

      // Add all entries from this batch
      for (const { district, entries } of batchResults) {
        allEntries.push(...entries);
      }

      // Report progress
      onProgress?.({
        current: allEntries.length,
        total: districts.length * dates.length,
        percentage: Math.round((allEntries.length / (districts.length * dates.length)) * 100),
        currentDistrict: batch[batch.length - 1],
        status: 'fetching',
      });

      // Add delay between batches (except for first batch)
      if (i > 0) {
        await this.sleep(this.rateLimitConfig.interDistrictDelay);
      }

      // Log rate limiter stats periodically
      if (i % (maxConcurrent * 2) === 0) {
        const stats = this.rateLimiter.getStats();
        logger.debug('Rate limiter stats', {
          batchIndex: i / maxConcurrent,
          stats,
        });
      }
    }

    logger.info(`Successfully fetched prayer times`, { totalEntries: allEntries.length });
    return allEntries;
  }

  /**
   * Fetch prayer times for multiple months
   */
  async fetchPrayerTimesByMultiMonth(options: MultiMonthOptions, onProgress?: ProgressCallback): Promise<AladhanPrayerTimes[]> {
    const { year, months, districts = BANGLADESH_DISTRICTS } = options;
    const dates = this.generateDatesForMonths(year, months);
    const allEntries: AladhanPrayerTimes[] = [];
    const maxConcurrent = this.rateLimitConfig.maxConcurrentDistricts || 5;

    logger.info(`Fetching prayer times for multi-month`, { year, months, districtCount: districts.length, dayCount: dates.length, maxConcurrent });

    // Process districts in parallel with controlled concurrency
    for (let i = 0; i < districts.length; i += maxConcurrent) {
      const batch = districts.slice(i, i + maxConcurrent);
      
      // Process this batch of districts in parallel
      const batchResults = await Promise.all(
        batch.map(async (district) => {
          const districtEntries = await this.fetchDistrictPrayerTimes(district, dates);
          
          // Add delay between districts within the batch (except for first in batch)
          const batchIndex = batch.indexOf(district);
          if (batchIndex > 0) {
            await this.sleep(this.rateLimitConfig.interDistrictDelay);
          }
          
          return { district, entries: districtEntries };
        })
      );

      // Add all entries from this batch
      for (const { district, entries } of batchResults) {
        allEntries.push(...entries);
      }

      // Report progress
      onProgress?.({
        current: allEntries.length,
        total: districts.length * dates.length,
        percentage: Math.round((allEntries.length / (districts.length * dates.length)) * 100),
        currentDistrict: batch[batch.length - 1],
        status: 'fetching',
      });

      // Add delay between batches (except for first batch)
      if (i > 0) {
        await this.sleep(this.rateLimitConfig.interDistrictDelay);
      }

      // Log rate limiter stats periodically
      if (i % (maxConcurrent * 2) === 0) {
        const stats = this.rateLimiter.getStats();
        logger.debug('Rate limiter stats', {
          batchIndex: i / maxConcurrent,
          stats,
        });
      }
    }

    logger.info(`Successfully fetched prayer times`, { totalEntries: allEntries.length });
    return allEntries;
  }

  /**
   * Fetch prayer times for a Hijri month
   */
  async fetchPrayerTimesByHijriMonth(
    options: HijriMonthOptions,
    onProgress?: ProgressCallback
  ): Promise<AladhanPrayerTimes[]> {
    const { hijriMonth, hijriYear, districts = BANGLADESH_DISTRICTS } = options;
    const allEntries: AladhanPrayerTimes[] = [];
    const maxConcurrent = this.rateLimitConfig.maxConcurrentDistricts || 5;

    logger.info(`Fetching prayer times for Hijri month`, {
      hijriMonth,
      hijriYear,
      districtCount: districts.length,
      maxConcurrent
    });

    // Process districts in parallel with controlled concurrency
    for (let i = 0; i < districts.length; i += maxConcurrent) {
      const batch = districts.slice(i, i + maxConcurrent);

      // Process this batch of districts in parallel
      const batchResults = await Promise.all(
        batch.map(async (district) => {
          const districtEntries = await this.fetchDistrictHijriCalendarPrayerTimes(
            district,
            hijriYear,
            hijriMonth
          );

          // Add delay between districts within the batch
          const batchIndex = batch.indexOf(district);
          if (batchIndex > 0) {
            await this.sleep(this.rateLimitConfig.interDistrictDelay);
          }

          return { district, entries: districtEntries };
        })
      );

      // Add all entries from this batch
      for (const { district, entries } of batchResults) {
        allEntries.push(...entries);
      }

      // Report progress
      onProgress?.({
        current: allEntries.length,
        total: districts.length * 30, // Approximate total (30 days)
        percentage: Math.round((allEntries.length / (districts.length * 30)) * 100),
        currentDistrict: batch[batch.length - 1],
        status: 'fetching',
      });

      // Add delay between batches
      if (i > 0) {
        await this.sleep(this.rateLimitConfig.interDistrictDelay);
      }

      // Log rate limiter stats periodically
      if (i % (maxConcurrent * 2) === 0) {
        const stats = this.rateLimiter.getStats();
        logger.debug('Rate limiter stats', {
          batchIndex: i / maxConcurrent,
          stats,
        });
      }
    }

    logger.info(`Successfully fetched prayer times for Hijri month`, {
      totalEntries: allEntries.length
    });
    return allEntries;
  }

  /**
   * Fetch prayer times for a specific district and dates
   */
  async fetchDistrictPrayerTimes(district: string, dates: string[]): Promise<AladhanPrayerTimes[]> {
    const entries: AladhanPrayerTimes[] = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      
      // Check cache first
      const cacheKey = `${district}-${date}`;
      if (this.cache.has(cacheKey)) {
        entries.push(...this.cache.get(cacheKey)!);
        continue;
      }

      // Acquire token from rate limiter before making request
      await this.rateLimiter.acquireToken();

      // Add delay between requests (except for first request)
      if (i > 0) {
        await this.sleep(this.rateLimitConfig.interRequestDelay);
      }

      try {
        const response = await fetchExternalJson<AladhanResponse>(
          `${ALADHAN_CONFIG.baseUrl}/timingsByCity?city=${encodeURIComponent(district)}&country=${ALADHAN_CONFIG.country}&method=${ALADHAN_CONFIG.method}&date=${date}&timezone=${encodeURIComponent(ALADHAN_CONFIG.timezone)}`,
          {
            timeout: 10000,
            retries: ALADHAN_CONFIG.maxRetries || 5,
          }
        );

        if (response.code !== 200 || response.status !== 'OK') {
          throw new Error(`Aladhan API error: ${response.code} - ${response.status}`);
        }

        const { sehri, iftar } = this.extractSehriIftar(response);
        
        const entry: AladhanPrayerTimes = {
          date,
          sehri,
          iftar,
          location: district,
        };

        entries.push(entry);

        // Cache the entry
        this.cache.set(cacheKey, [entry]);
      } catch (error) {
        logger.warn(`Failed to fetch prayer times for ${district} on ${date}`, { error: (error as Error).message });
        // Continue with next date even if one fails
      }
    }

    return entries;
  }

  /**
   * Fetch prayer times for a district using hijriCalendarByCity endpoint
   */
  async fetchDistrictHijriCalendarPrayerTimes(
    district: string,
    hijriYear: number,
    hijriMonth: number
  ): Promise<AladhanPrayerTimes[]> {
    const cacheKey = `${district}-hijri-${hijriYear}-${hijriMonth}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Acquire token from rate limiter before making request
    await this.rateLimiter.acquireToken();

    try {
      const response = await fetchExternalJson<HijriCalendarResponse>(
        `${ALADHAN_CONFIG.baseUrl}/hijriCalendarByCity/${hijriYear}/${hijriMonth}?city=${encodeURIComponent(district)}&country=${ALADHAN_CONFIG.country}&method=${ALADHAN_CONFIG.method}&timezone=${encodeURIComponent(ALADHAN_CONFIG.timezone)}`,
        {
          timeout: 10000,
          retries: ALADHAN_CONFIG.maxRetries || 5,
        }
      );

      if (response.code !== 200 || response.status !== 'OK') {
        throw new Error(`Aladhan API error: ${response.code} - ${response.status}`);
      }

      // Extract prayer times for each day in the Hijri month
      const monthEntries = response.data.map((dayData) => {
        const { sehri, iftar } = this.extractSehriIftar({
          code: 200,
          status: 'OK',
          data: dayData,
        });

        const gregorianDate = dayData.date.gregorian.date.split('-').reverse().join('-'); // Convert DD-MM-YYYY to YYYY-MM-DD

        return {
          date: gregorianDate,
          sehri,
          iftar,
          location: district,
        };
      });

      // Cache the month data
      this.cache.set(cacheKey, monthEntries);

      return monthEntries;
    } catch (error) {
      logger.warn(`Failed to fetch Hijri calendar for ${district} in ${hijriYear}-${hijriMonth}`, {
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Extract Sehri (Fajr) and Iftar (Maghrib) times from Aladhan response
   */
  private extractSehriIftar(data: AladhanResponse | HijriCalendarResponse): { sehri: string; iftar: string } {
    // Handle both single day response and calendar response
    const timings = 'timings' in data.data ? data.data.timings : data.data[0].timings;

    // Aladhan returns times in 12-hour format (e.g., "04:30")
    // We need to convert to 24-hour format (e.g., "04:30")
    const sehri = this.formatTimeTo24Hour(timings.Fajr);
    const iftar = this.formatTimeTo24Hour(timings.Maghrib);

    return { sehri, iftar };
  }

  /**
   * Format time to 24-hour format (HH:mm)
   * Aladhan API returns times in various formats, ensure consistent 24-hour format
   */
  private formatTimeTo24Hour(time: string): string {
    // Remove any AM/PM suffixes and spaces
    let formatted = time.trim().replace(/\s*(AM|PM)/i, '');
    
    // If already in HH:mm format, return as is
    if (/^\d{1,2}:\d{2}$/.test(formatted)) {
      return formatted;
    }

    // If in H:mm format (single digit hour), pad with leading zero
    if (/^\d:\d{2}$/.test(formatted)) {
      return `0${formatted}`;
    }

    // If in 12-hour format without AM/PM, assume 24-hour
    return formatted;
  }

  /**
   * Generate date range array
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(this.formatDate(date));
    }

    return dates;
  }

  /**
   * Generate dates for specific months
   */
  private generateDatesForMonths(year: number, months: number[]): string[] {
    const dates: string[] = [];

    for (const month of months) {
      const daysInMonth = this.getDaysInMonth(year, month);
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        dates.push(this.formatDate(date));
      }
    }

    // Sort dates chronologically
    dates.sort((a, b) => a.localeCompare(b));

    return dates;
  }

  /**
   * Get number of days in a month (handles leap years)
   */
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Format date to YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Aladhan API cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get rate limiter statistics
   */
  getRateLimiterStats() {
    return this.rateLimiter.getStats();
  }

  /**
   * Update rate limit configuration
   */
  updateRateLimitConfig(config: Partial<RateLimitConfig>): void {
    if (config.batchSize !== undefined) {
      this.rateLimitConfig.batchSize = config.batchSize;
    }
    if (config.interRequestDelay !== undefined) {
      this.rateLimitConfig.interRequestDelay = config.interRequestDelay;
    }
    if (config.interDistrictDelay !== undefined) {
      this.rateLimitConfig.interDistrictDelay = config.interDistrictDelay;
    }
    if (config.tokenBucket !== undefined) {
      this.rateLimitConfig.tokenBucket = config.tokenBucket;
      this.rateLimiter.updateConfig(config.tokenBucket);
    }

    logger.info('AladhanApiWrapper rate limit config updated', {
      newConfig: this.rateLimitConfig,
    });
  }
}

// Singleton instance
let globalAladhanWrapper: AladhanApiWrapper | null = null;

/**
 * Get or create the global Aladhan API wrapper instance
 * 
 * @param rateLimitConfig Optional rate limit configuration (only used on first call)
 */
export function getGlobalAladhanWrapper(rateLimitConfig?: RateLimitConfig): AladhanApiWrapper {
  if (!globalAladhanWrapper) {
    globalAladhanWrapper = new AladhanApiWrapper(rateLimitConfig);
  }
  return globalAladhanWrapper;
}

/**
 * Reset the global Aladhan API wrapper (useful for testing)
 */
export function resetGlobalAladhanWrapper(): void {
  globalAladhanWrapper = null;
}
