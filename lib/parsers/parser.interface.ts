/**
 * File Parser Interface
 * Abstraction for file parsing operations (Open/Closed Principle)
 */

/**
 * File Parser Interface
 * Defines the contract for file parsers
 */
export interface FileParser<T> {
  /**
   * Check if this parser can handle the given file
   * @param filename - Name of the file to check
   * @returns True if this parser can handle the file, false otherwise
   */
  canParse(filename: string): boolean;

  /**
   * Parse the file and return data
   * @param file - File to parse
   * @returns Promise resolving to parsed data array
   */
  parse(file: File): Promise<T[]>;

  /**
   * Serialize data to file format
   * @param data - Data to serialize
   * @returns Serialized data as string
   */
  serialize(data: T[]): string;
}

/**
 * Parsed schedule entry structure
 */
export interface ParsedScheduleEntry {
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}
