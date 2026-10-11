import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteUrl, adsenseClientId, isAdsenseConfigured } from "@/lib/ads";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const baseUrl = siteUrl || undefined;

export const metadata: Metadata = {
  metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  title: {
    default: "Contact Launcher — Connect with anyone, anywhere",
    template: "%s — Contact Launcher",
  },
  description:
    "A fast, mobile-first contact launcher. Enter a country code and a phone number or username, then open Telegram, Instagram, WhatsApp, Signal, WeChat, the phone dialer, or start a peer-to-peer internet call.",
  applicationName: "Contact Launcher",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Contact Launcher",
    title: "Contact Launcher — Connect with anyone, anywhere",
    description:
      "Open messaging apps or start a peer-to-peer internet call from a single, simple contact launcher.",
    url: baseUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Contact Launcher — Connect with anyone, anywhere",
    description:
      "Open messaging apps or start a peer-to-peer internet call from a single, simple contact launcher.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ucl-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        {/* Google AdSense loader. Loaded once, on every page, only when a valid
            publisher ID is configured. This is also the tag Google uses to
            verify site ownership. next/script guarantees a single load and
            persists it across client-side navigation. */}
        {isAdsenseConfigured && adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
      </head>
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
