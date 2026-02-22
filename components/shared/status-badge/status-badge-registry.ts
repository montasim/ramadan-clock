/**
 * Status Badge Registry
 * Registry for status badge strategies
 * Allows dynamic registration and retrieval of badge strategies
 */

import type { IStatusBadgeStrategy } from './status-badge-strategy';
import {
  PassedBadgeStrategy,
  TodayBadgeStrategy,
  TomorrowBadgeStrategy,
  UpcomingBadgeStrategy,
} from './status-badge-strategy';

/**
 * Status Badge Registry
 * Manages all available badge strategies
 */
export class StatusBadgeRegistry {
  private static instance: StatusBadgeRegistry;
  private strategies: Map<string, IStatusBadgeStrategy>;

  private constructor() {
    this.strategies = new Map();
    // Register default strategies
    this.registerDefaultStrategies();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StatusBadgeRegistry {
    if (!StatusBadgeRegistry.instance) {
      StatusBadgeRegistry.instance = new StatusBadgeRegistry();
    }
    return StatusBadgeRegistry.instance;
  }

  /**
   * Register default badge strategies
   */
  private registerDefaultStrategies(): void {
    this.register(new PassedBadgeStrategy());
    this.register(new TodayBadgeStrategy());
    this.register(new TomorrowBadgeStrategy());
    this.register(new UpcomingBadgeStrategy());
  }

  /**
   * Register a new badge strategy
   * @param strategy - Badge strategy to register
   */
  register(strategy: IStatusBadgeStrategy): void {
    this.strategies.set(strategy.status, strategy);
  }

  /**
   * Unregister a badge strategy
   * @param status - Status type to unregister
   */
  unregister(status: string): void {
    this.strategies.delete(status);
  }

  /**
   * Get badge strategy by status
   * @param status - Status type
   * @returns Badge strategy or null if not found
   */
  getStrategy(status: string): IStatusBadgeStrategy | null {
    return this.strategies.get(status) || null;
  }

  /**
   * Check if a strategy exists for a status
   * @param status - Status type
   * @returns True if strategy exists, false otherwise
   */
  hasStrategy(status: string): boolean {
    return this.strategies.has(status);
  }

  /**
   * Get all registered statuses
   * @returns Array of all status types
   */
  getAllStatuses(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Clear all strategies
   */
  clear(): void {
    this.strategies.clear();
  }
}

/**
 * Get status badge registry instance
 */
export function getStatusBadgeRegistry(): StatusBadgeRegistry {
  return StatusBadgeRegistry.getInstance();
}
