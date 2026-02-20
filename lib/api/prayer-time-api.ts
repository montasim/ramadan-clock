/**
 * Prayer Time API Service
 * Handles integration with Aladhan API for fetching prayer times
 */

import { LOCATION_COORDINATES, type District } from '@/lib/config/locations.config';

/**
 * Aladhan API response types
 */
export interface AladhanDate {
  readable: string;
  timestamp: string;
}

export interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface AladhanDayData {
  date: AladhanDate;
  timings: AladhanTimings;
}

export interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: AladhanDayData[];
}

/**
 * Prayer time data returned by the service
 */
export interface PrayerTimeData {
  date: string; // YYYY-MM-DD
  sehri: string; // HH:mm
  iftar: string; // HH:mm
  location: string;
}

/**
 * Configuration options for the API service
 */
export interface PrayerTimeAPIConfig {
  baseUrl: string;
  method: number; // Calculation method (2=ISNA, 3=MWL, etc.)
  school: number; // Madhab (0=Shafi, 1=Hanafi)
  sehriAdjustment: number; // Minutes to add/subtract from Sehri
  iftarAdjustment: number; // Minutes to add/subtract from Iftar
  timeout: number; // Request timeout in milliseconds
  maxRetries: number; // Maximum number of retries
  retryDelay: number; // Delay between retries in milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PrayerTimeAPIConfig = {
  baseUrl: process.env.PRAYER_TIME_API_URL || 'https://api.aladhan.com/v1',
  method: parseInt(process.env.PRAYER_TIME_API_METHOD || '2', 10),
  school: parseInt(process.env.PRAYER_TIME_API_SCHOOL || '0', 10),
  sehriAdjustment: parseInt(process.env.PRAYER_TIME_SEHRI_ADJUSTMENT_MINUTES || '0', 10),
  iftarAdjustment: parseInt(process.env.PRAYER_TIME_IFTAR_ADJUSTMENT_MINUTES || '0', 10),
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Prayer Time API Service
 */
export class PrayerTimeAPIService {
  private config: PrayerTimeAPIConfig;
  private cache: Map<string, { data: PrayerTimeData[]; timestamp: number }>;
  private cacheTimeout: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: Partial<PrayerTimeAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Fetch prayer times for a specific location and month
   */
  async fetchPrayerTimes(
    location: string,
    latitude: number,
    longitude: number,
    month: number,
    year: number
  ): Promise<PrayerTimeData[]> {
    const cacheKey = `${location}-${year}-${month}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Fetch from API with retry logic
    const data = await this.fetchWithRetry(
      `${this.config.baseUrl}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${this.config.method}&school=${this.config.school}`
    );

    // Process and cache the data
    const processedData = this.processAPIResponse(data, location);
    this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });

    return processedData;
  }

  /**
   * Fetch prayer times for all Bangladesh districts in parallel
   */
  async fetchAllLocations(
    month: number,
    year: number,
    districts: District[] = Object.keys(LOCATION_COORDINATES) as District[]
  ): Promise<Map<string, PrayerTimeData[]>> {
    const results = new Map<string, PrayerTimeData[]>();
    
    // Fetch all locations in parallel using Promise.all
    const fetchPromises = districts.map(async (district) => {
      try {
        const coords = LOCATION_COORDINATES[district];
        const prayerTimes = await this.fetchPrayerTimes(district, coords.lat, coords.lng, month, year);
        return { district, prayerTimes, success: true };
      } catch (error) {
        console.error(`Failed to fetch prayer times for ${district}:`, error);
        return { district, prayerTimes: [], success: false };
      }
    });

    // Wait for all fetches to complete
    const fetchResults = await Promise.all(fetchPromises);
    
    // Collect results
    for (const result of fetchResults) {
      if (result.success && result.prayerTimes.length > 0) {
        results.set(result.district, result.prayerTimes);
      }
    }
    
    return results;
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(url: string): Promise<AladhanCalendarResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data: AladhanCalendarResponse = await response.json();

        if (data.code !== 200) {
          throw new Error(`API returned error: ${data.status}`);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If not the last attempt, wait before retrying
        if (attempt < this.config.maxRetries - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to fetch data after maximum retries');
  }

  /**
   * Process API response and convert to PrayerTimeData format
   */
  private processAPIResponse(
    response: AladhanCalendarResponse,
    location: string
  ): PrayerTimeData[] {
    return response.data.map((day) => {
      const rawSehri = day.timings.Fajr;
      const rawIftar = day.timings.Maghrib;
      
      const sehriTime = this.adjustTime(rawSehri, this.config.sehriAdjustment);
      const iftarTime = this.adjustTime(rawIftar, this.config.iftarAdjustment);

      // Debug logging
      console.log(`[API] Processing ${location} ${day.date.readable}:`, {
        rawSehri,
        rawIftar,
        adjustedSehri: sehriTime,
        adjustedIftar: iftarTime,
      });

      // Convert Unix timestamp to YYYY-MM-DD format
      const dateObj = new Date(parseInt(day.date.timestamp) * 1000);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayNum = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;

      return {
        date: dateStr,
        sehri: sehriTime,  // Use adjusted time
        iftar: iftarTime,  // Use adjusted time
        location,
      };
    });
  }

  /**
   * Adjust time by adding/subtracting minutes
   */
  private adjustTime(time: string, adjustmentMinutes: number): string {
    if (adjustmentMinutes === 0) return time;

    // Strip timezone offset if present (e.g., "05:30 (+06)" -> "05:30")
    // Also handle other formats like "05:30 (GMT+6)"
    let cleanTime = time;
    
    // Try to split by space first (for "HH:mm (GMT+6)" format)
    if (cleanTime.includes(' (')) {
      cleanTime = cleanTime.split(' (')[0];
    }
    
    // If still has parentheses, try to remove everything after them
    const parenIndex = cleanTime.indexOf('(');
    if (parenIndex > 0) {
      cleanTime = cleanTime.substring(0, parenIndex).trim();
    }

    const [hours, minutes] = cleanTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + adjustmentMinutes;
    
    // Handle day overflow
    let adjustedHours = Math.floor(totalMinutes / 60) % 24;
    const adjustedMinutes = totalMinutes % 60;
    
    // Handle negative values
    if (adjustedHours < 0) {
      adjustedHours += 24;
    }

    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
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
   * Update configuration
   */
  updateConfig(config: Partial<PrayerTimeAPIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PrayerTimeAPIConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance of the API service
 */
let apiServiceInstance: PrayerTimeAPIService | null = null;

export function getPrayerTimeAPIService(): PrayerTimeAPIService {
  if (!apiServiceInstance) {
    apiServiceInstance = new PrayerTimeAPIService();
  }
  return apiServiceInstance;
}
