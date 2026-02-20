import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Server-side dashboard guard
 * Checks if user is authenticated and redirects to login if not
 * Use this in server components and server actions
 *
 * @returns The session if authenticated, otherwise redirects to login
 *
 * @example
 * ```tsx
 * export default async function DashboardPage() {
 *   const session = await withDashboardGuard();
 *
 *   // User is authenticated, proceed with dashboard logic
 *   return <DashboardContent />;
 * }
 * ```
 */
export async function withDashboardGuard() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}

/**
 * Dashboard guard options
 */
export interface DashboardGuardOptions {
  /**
   * Custom redirect path when not authenticated
   * @default "/auth/login"
   */
  redirectTo?: string;
}

/**
 * Server-side dashboard guard with custom options
 *
 * @param options - Guard configuration options
 * @returns The session if authenticated, otherwise redirects
 *
 * @example
 * ```tsx
 * export default async function DashboardPage() {
 *   const session = await withDashboardGuard({ redirectTo: "/login" });
 *
 *   // User is authenticated, proceed with dashboard logic
 *   return <DashboardContent />;
 * }
 * ```
 */
export async function withDashboardGuardOptions(options: DashboardGuardOptions = {}) {
  const { redirectTo = "/auth/login" } = options;
  const session = await getSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}
