/**
 * Status Badge Strategy
 * Strategy pattern for rendering different status badges
 * Allows adding new badge types without modifying existing code
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SCHEDULE_STATUS, STATUS_BADGE } from '@/lib/constants';

/**
 * Status badge strategy interface
 */
export interface IStatusBadgeStrategy {
  /** Status type */
  readonly status: string;
  /** Render the badge component */
  render(): React.ReactNode;
}

/**
 * Passed status badge strategy
 */
export class PassedBadgeStrategy implements IStatusBadgeStrategy {
  readonly status = SCHEDULE_STATUS.PASSED;

  render(): React.ReactNode {
    return React.createElement(
      Badge,
      { variant: 'secondary', className: STATUS_BADGE.PASSED.className },
      'Passed'
    );
  }
}

/**
 * Today status badge strategy
 */
export class TodayBadgeStrategy implements IStatusBadgeStrategy {
  readonly status = SCHEDULE_STATUS.TODAY;

  render(): React.ReactNode {
    return React.createElement(
      Badge,
      { className: STATUS_BADGE.TODAY.className },
      'Today'
    );
  }
}

/**
 * Tomorrow status badge strategy
 */
export class TomorrowBadgeStrategy implements IStatusBadgeStrategy {
  readonly status = SCHEDULE_STATUS.TOMORROW;

  render(): React.ReactNode {
    return React.createElement(
      Badge,
      { variant: 'outline', className: STATUS_BADGE.TOMORROW.className },
      'Tomorrow'
    );
  }
}

/**
 * Upcoming status badge strategy
 */
export class UpcomingBadgeStrategy implements IStatusBadgeStrategy {
  readonly status = SCHEDULE_STATUS.UPCOMING;

  render(): React.ReactNode {
    return React.createElement(
      Badge,
      { variant: 'outline', className: STATUS_BADGE.UPCOMING.className },
      'Upcoming'
    );
  }
}

/**
 * Custom status badge strategy
 * Allows users to create custom badge strategies
 */
export class CustomBadgeStrategy implements IStatusBadgeStrategy {
  constructor(
    readonly status: string,
    private readonly renderFn: () => React.ReactNode
  ) {}

  render(): React.ReactNode {
    return this.renderFn();
  }
}
