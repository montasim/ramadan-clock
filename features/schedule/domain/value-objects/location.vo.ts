/**
 * Location Value Object
 * Encapsulates location validation and logic
 */

/**
 * Location Value Object
 * Represents a location (city/district) with validation
 */
export class LocationVO {
  private readonly _value: string | null;

  /**
   * Create a LocationVO instance
   * @param value - Location string (can be null for "all locations")
   */
  constructor(value: string | null) {
    this._value = value === null || value.trim() === '' ? null : value.trim();
  }

  /**
   * Get the location value
   */
  get value(): string | null {
    return this._value;
  }

  /**
   * Get display name for the location
   * @returns "All Locations" if value is null, otherwise the location name
   */
  get displayName(): string {
    return this._value || 'All Locations';
  }

  /**
   * Check if location is empty (null or empty string)
   */
  isEmpty(): boolean {
    return this._value === null;
  }

  /**
   * Check if this location equals another LocationVO
   */
  equals(other: LocationVO): boolean {
    return this._value === other._value;
  }

  /**
   * Check if location matches a specific value
   * @param value - Value to compare against
   * @returns True if matches, false otherwise
   */
  matches(value: string | null | undefined): boolean {
    if (value === null || value === undefined || value.trim() === '') {
      return this._value === null;
    }
    return this._value === value.trim();
  }

  /**
   * Create LocationVO from a value
   * @param value - Location value (string, null, or undefined)
   * @returns New LocationVO instance
   */
  static create(value: string | null | undefined): LocationVO {
    return new LocationVO(value || null);
  }

  /**
   * Create LocationVO for "all locations"
   */
  static all(): LocationVO {
    return new LocationVO(null);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value || '';
  }

  /**
   * Convert to JSON
   */
  toJSON(): string | null {
    return this._value;
  }
}
