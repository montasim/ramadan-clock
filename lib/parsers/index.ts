/**
 * Parsers exports
 */

import { FileParser } from './parser.interface';
import { JsonParser } from './json-parser';
import { CsvParser } from './csv-parser';
import type { ParsedScheduleEntry } from './parser.interface';

/**
 * Parser Factory
 * Factory for creating appropriate parsers based on file type
 */
export class ParserFactory {
  private static parsers: FileParser<ParsedScheduleEntry>[] = [
    new JsonParser(),
    new CsvParser(),
  ];

  /**
   * Get the appropriate parser for a given filename
   * @param filename - Name of the file to parse
   * @returns Appropriate parser instance
   * @throws Error if no parser is found for the file type
   */
  static getParser(filename: string): FileParser<ParsedScheduleEntry> {
    const parser = this.parsers.find((p) => p.canParse(filename));

    if (!parser) {
      throw new Error(`No parser found for file: ${filename}`);
    }

    return parser;
  }

  /**
   * Get all available parsers
   * @returns Array of all registered parsers
   */
  static getAllParsers(): FileParser<ParsedScheduleEntry>[] {
    return [...this.parsers];
  }

  /**
   * Register a custom parser
   * @param parser - Parser to register
   */
  static registerParser(parser: FileParser<ParsedScheduleEntry>): void {
    this.parsers.push(parser);
  }
}

export { JsonParser, CsvParser };
export type { FileParser, ParsedScheduleEntry } from './parser.interface';
