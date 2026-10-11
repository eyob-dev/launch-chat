import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Shared layout for public content pages (About, Contact, Privacy, Terms).
 * Keeps the existing visual language (rounded cards, primary accents, the
 * light/dark theme) and provides consistent navigation and footer links.
 */
export function PageShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Contact Launcher
      </Link>

      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          {title}
        </h1>
        {updated && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Last updated: {updated}
          </p>
        )}
        {intro && (
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
            {intro}
          </p>
        )}
        <div className="prose prose-gray mt-6 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-li:marker:text-gray-400">
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-gray-200 pt-6 text-sm dark:border-gray-700">
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link href="/about" className="text-gray-600 hover:text-primary-600 hover:underline dark:text-gray-400 dark:hover:text-primary-400">
          About
        </Link>
        <Link href="/contact" className="text-gray-600 hover:text-primary-600 hover:underline dark:text-gray-400 dark:hover:text-primary-400">
          Contact
        </Link>
        <Link href="/privacy" className="text-gray-600 hover:text-primary-600 hover:underline dark:text-gray-400 dark:hover:text-primary-400">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-gray-600 hover:text-primary-600 hover:underline dark:text-gray-400 dark:hover:text-primary-400">
          Terms of Service
        </Link>
      </nav>
      <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Messaging links open the respective platform; Contact Launcher does not
        verify registration on any network and is not affiliated with any
        third-party service.
      </p>
    </footer>
  );
}
