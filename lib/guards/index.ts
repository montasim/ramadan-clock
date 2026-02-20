/**
 * Dashboard guards for protecting admin pages
 *
 * This module provides authentication guards for protecting dashboard pages.
 * Use server-side guards for server components and client-side guards for client components.
 */

// Client-side guards (safe to import in both server and client components)
export {
  DashboardGuard,
  DashboardGuardWithOptions,
  withDashboardGuard as withClientDashboardGuard,
} from "./client-dashboard-guard";

// Server-side guards (only import in server components)
// Import these directly from "./dashboard-guard" to avoid bundling in client components
export type { DashboardGuardOptions } from "./client-dashboard-guard";
