/**
 * Google AdSense configuration.
 *
 * IMPORTANT: No publisher ID or ad-slot ID is hard-coded anywhere. All values
 * come from `NEXT_PUBLIC_*` environment variables so that:
 *   - the client bundle never contains fabricated or secret identifiers,
 *   - the site builds and runs normally when AdSense is not configured.
 *
 * The publisher ID format is `ca-pub-XXXXXXXXXXXXXXXX` (16 digits).
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
const HOME_SLOT = process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT?.trim() ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

/** AdSense publisher IDs look like `ca-pub-1234567890123456`. */
const PUBLISHER_ID_RE = /^ca-pub-\d{16}$/;

/** Ad unit slot IDs are numeric strings (typically 10 digits). */
const SLOT_RE = /^\d{6,}$/;

export const adsenseClientId: string = CLIENT_ID;

export const isAdsenseConfigured: boolean =
  PUBLISHER_ID_RE.test(CLIENT_ID) && SLOT_RE.test(HOME_SLOT);

/** Home page ad slot, or null when not configured. */
export const homeAdSlot: string | null = isAdsenseConfigured ? HOME_SLOT : null;

/** Absolute production URL without a trailing slash, or "" when unset. */
export const siteUrl: string = SITE_URL.replace(/\/+$/, "");

/**
 * Whether a slot id is usable. Used by the <AdUnit> component to decide
 * whether to render anything.
 */
export function isValidSlot(slot?: string | null): boolean {
  return !!slot && SLOT_RE.test(slot);
}
