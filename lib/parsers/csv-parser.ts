/**
 * CSV Parser
 * Handles CSV file parsing using PapaParse
 */

import Papa from 'papaparse';
import { FileParser } from './parser.interface';
import type { ParsedScheduleEntry } from './parser.interface';

/**
 * CSV Parser
 * Implements FileParser interface for CSV files
 */
export class CsvParser implements FileParser<ParsedScheduleEntry> {
  /**
   * Check if this parser can handle the given file
   */
  canParse(filename: string): boolean {
    return filename.toLowerCase().endsWith('.csv');
  }

  /**
   * Parse the CSV file and return data
   */
  async parse(file: File): Promise<ParsedScheduleEntry[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as ParsedScheduleEntry[]);
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        },
      });
    });
  }

  /**
   * Serialize data to CSV format
   */
  serialize(data: ParsedScheduleEntry[]): string {
    return Papa.unparse(data);
  }
}
