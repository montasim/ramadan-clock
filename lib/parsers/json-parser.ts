/**
 * JSON Parser
 * Handles JSON file parsing
 */

import { FileParser } from './parser.interface';
import type { ParsedScheduleEntry } from './parser.interface';

/**
 * JSON Parser
 * Implements FileParser interface for JSON files
 */
export class JsonParser implements FileParser<ParsedScheduleEntry> {
  /**
   * Check if this parser can handle the given file
   */
  canParse(filename: string): boolean {
    return filename.toLowerCase().endsWith('.json');
  }

  /**
   * Parse the JSON file and return data
   */
  async parse(file: File): Promise<ParsedScheduleEntry[]> {
    const text = await file.text();
    const json = JSON.parse(text);

    if (!Array.isArray(json)) {
      throw new Error('JSON must be an array of schedule entries');
    }

    return json;
  }

  /**
   * Serialize data to JSON format
   */
  serialize(data: ParsedScheduleEntry[]): string {
    return JSON.stringify(data, null, 2);
  }
}
