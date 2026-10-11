"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { adsenseClientId, hasValidPublisherId } from "@/lib/ads";
import AdSense from "@/components/AdSense";

/**
 * Global error boundary.
 *
 * Unlike a normal `error.tsx`, this file REPLACES the root layout when the root
 * layout or a page throws during rendering. Because it bypasses the root
 * layout, it must:
 *   - render its own <html> and <body> tags, and
 *   - re-declare any <head> contents it needs (theme pre-paint script + the
 *     Google AdSense site-verification tags), otherwise this would be the one
 *     served page missing them.
 *
 * Error boundaries are required to be Client Components.
 *
 * Note: on Next.js 16 the reset callback prop is named `retry`.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the stored/preferred theme before paint to avoid a flash,
            mirroring the root layout. Reads localStorage, guarded by try/catch. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ucl-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        {hasValidPublisherId && (
          <AdSense pId={adsenseClientId.replace(/^ca-pub-/, "")} />
        )}
      </head>
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400">
              An unexpected error occurred while rendering this page. You can
              try again, or reload the page to continue.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Go to homepage
            </a>
          </div>
          {error?.digest && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Error reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
