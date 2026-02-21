/**
 * Status Badge Component
 * Renders status badges using the strategy pattern
 */

import React from 'react';
import { getStatusBadgeRegistry } from './status-badge/status-badge-registry';
import type { IStatusBadgeStrategy } from './status-badge/status-badge-strategy';

/**
 * Status Badge Component Props
 */
export interface StatusBadgeProps {
  /** Status type to render */
  status: string;
}

/**
 * Status Badge Component
 * Renders a badge for the given status using the registered strategy
 */
export function StatusBadge({ status }: StatusBadgeProps): React.ReactNode {
  const registry = getStatusBadgeRegistry();
  const strategy = registry.getStrategy(status);

  if (!strategy) {
    // Fallback to simple badge if no strategy found
    return (
      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        {status}
      </span>
    );
  }

  return strategy.render();
}

/**
 * Default export
 */
export default StatusBadge;
