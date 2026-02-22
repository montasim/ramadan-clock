/**
 * Export Utilities
 * Functions for exporting prayer times data to JSON and CSV formats
 */

import Papa from 'papaparse';

/**
 * Prayer times entry for export
 */
export interface ExportEntry {
  date: string;
  sehri: string;
  iftar: string;
  location: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  data: ExportEntry[];
  format: 'json' | 'csv';
  filename?: string;
  filterDistrict?: string;
}

/**
 * Export prayer times to JSON format
 */
export function exportToJSON(data: ExportEntry[], filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename || 'prayer-times.json', 'application/json');
}

/**
 * Export prayer times to CSV format
 */
export function exportToCSV(data: ExportEntry[], filename?: string): void {
  const csv = Papa.unparse(data);
  downloadFile(csv, filename || 'prayer-times.csv', 'text/csv');
}

/**
 * Export prayer times based on options
 */
export function exportPrayerTimes(options: ExportOptions): void {
  let exportData = options.data;

  // Filter by district if specified
  if (options.filterDistrict) {
    exportData = options.data.filter(entry => entry.location === options.filterDistrict);
  }

  // Export based on format
  if (options.format === 'json') {
    exportToJSON(exportData, options.filename);
  } else if (options.format === 'csv') {
    exportToCSV(exportData, options.filename);
  }
}

/**
 * Download file in browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') {
    // Server-side: This function won't work on server
    // It should only be called from client-side code
    throw new Error('downloadFile can only be called from client-side code');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateFilename(format: 'json' | 'csv', dateRange?: { start: string; end: string }): string {
  const dateStr = dateRange
    ? `${dateRange.start}_to_${dateRange.end}`
    : new Date().toISOString().split('T')[0];

  return `prayer-times_${dateStr}.${format}`;
}

/**
 * Convert AladhanPrayerTimes to ExportEntry
 */
export function convertToExportEntry(entry: { date: string; sehri: string; iftar: string; location: string }): ExportEntry {
  return {
    date: entry.date,
    sehri: entry.sehri,
    iftar: entry.iftar,
    location: entry.location,
  };
}

/**
 * Calculate statistics for export data
 */
export function calculateExportStats(data: ExportEntry[]): {
  totalEntries: number;
  uniqueDistricts: string[];
  dateRange: { start: string; end: string } | null;
  totalDays: number;
} {
  if (data.length === 0) {
    return {
      totalEntries: 0,
      uniqueDistricts: [],
      dateRange: null,
      totalDays: 0,
    };
  }

  const uniqueDistricts = [...new Set(data.map(e => e.location))];
  const dates = [...new Set(data.map(e => e.date))].sort();
  
  return {
    totalEntries: data.length,
    uniqueDistricts,
    dateRange: {
      start: dates[0],
      end: dates[dates.length - 1],
    },
    totalDays: dates.length,
  };
}
