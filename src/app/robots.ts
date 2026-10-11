import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/ads";

/**
 * Dynamic robots.txt.
 *
 * We intentionally do NOT block Google's advertising or review crawlers. Only
 * the WebSocket signaling endpoint (an internal API used by the calling
 * feature) is disallowed; everything else is open for crawling so the site can
 * be reviewed by Google AdSense and indexed for search.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl || undefined;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The signaling WebSocket is a real-time API, not a crawlable page.
        disallow: ["/api/"],
      },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
    host: base,
  };
}
