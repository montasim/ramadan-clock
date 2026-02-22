"use client";

/**
 * Global Error Page
 *
 * This page is displayed when a fatal error occurs in the application.
 * It's rendered outside the normal layout hierarchy, so it must be self-contained
 * and cannot depend on providers or context.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/error-handling#global-error
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-left">
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={reset}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Try again
            </button>

            {/* Home Link */}
            <a
              href="/"
              className="mt-4 inline-block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
