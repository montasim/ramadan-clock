"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Client-side dashboard guard component
 * Wraps children components and ensures user is authenticated
 * Redirects to login if not authenticated
 *
 * @example
 * ```tsx
 * export default function UploadPage() {
 *   return (
 *     <DashboardGuard>
 *       <UploadContent />
 *     </DashboardGuard>
 *   );
 * }
 * ```
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      setIsChecking(false);
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading" || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will be redirected)
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
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
 * Client-side dashboard guard component with custom options
 *
 * @example
 * ```tsx
 * export default function UploadPage() {
 *   return (
 *     <DashboardGuardWithOptions redirectTo="/login">
 *       <UploadContent />
 *     </DashboardGuardWithOptions>
 *   );
 * }
 * ```
 */
export function DashboardGuardWithOptions({
  children,
  redirectTo = "/auth/login",
}: DashboardGuardOptions & { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    } else if (status === "authenticated") {
      setIsChecking(false);
    }
  }, [status, router, redirectTo]);

  // Show loading state while checking authentication
  if (status === "loading" || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will be redirected)
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap a component with dashboard guard
 *
 * @example
 * ```tsx
 * const ProtectedUploadPage = withDashboardGuard(UploadPage);
 * export default ProtectedUploadPage;
 * ```
 */
export function withDashboardGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: DashboardGuardOptions
) {
  return function GuardedComponent(props: P) {
    return (
      <DashboardGuardWithOptions {...options}>
        <Component {...props} />
      </DashboardGuardWithOptions>
    );
  };
}
