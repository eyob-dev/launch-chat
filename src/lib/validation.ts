import {
  parsePhoneNumberFromString,
  type CountryCode as PhoneCountryCode,
} from "libphonenumber-js";
import { getCountry, type Country } from "@/data/countries";

export type InputMode = "username" | "phone";

export interface PhoneParseResult {
  /** True when the number is syntactically valid for its country/region. */
  valid: boolean;
  /** E.164 form, e.g. "+251911234567". Empty when invalid. */
  e164: string;
  /** Human-friendly international form, e.g. "+251 91 123 4567". */
  international: string;
  /** Local/national form for the detected country. */
  national: string;
  /** The country used for parsing (resolved from selection or +code). */
  country?: Country;
  /** A short, user-facing reason when invalid/incomplete. */
  message?: string;
}

/** Strip a single leading "@" and surrounding whitespace. */
export function stripLeadingAt(value: string): string {
  return value.trim().replace(/^@+/, "");
}

/**
 * Telegram usernames: 5-32 chars, letters/numbers/underscores.
 * Must start with a letter; underscores cannot be the final char.
 */
export function isValidTelegramUsername(username: string): boolean {
  const u = stripLeadingAt(username);
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(u) && !u.endsWith("_");
}

/**
 * Instagram usernames: 1-30 chars of letters, numbers, periods, underscores.
 * Periods/underscores cannot be the final char; no consecutive separators.
 */
export function isValidInstagramUsername(username: string): boolean {
  const u = stripLeadingAt(username);
  return /^(?!.*\.\.)(?!.*__)[A-Za-z0-9._]{1,30}$/.test(u) && !/[._]$/.test(u);
}

/** Build a Telegram deep link from a username (the reliable, documented way). */
export function buildTelegramUrl(username: string): string {
  return `https://t.me/${encodeURIComponent(stripLeadingAt(username))}`;
}

/**
 * Best-effort Telegram link from a phone number.
 *
 * IMPORTANT (verified against Telegram's FAQ): Telegram does NOT officially
 * support opening a user profile by phone number on the web. Phone-number
 * lookup is privacy-protected and only works inside the app from your synced
 * contacts, and only if the target user's privacy setting "Who can find me by
 * my phone number" permits it. The `t.me/+` prefix is intended for private
 * group/channel invite links.
 *
 * This link therefore often will NOT resolve to a person. We expose it as a
 * best-effort convenience and always pair it with an on-screen notice that a
 * username is the reliable way to reach someone on Telegram.
 *
 * @param e164 E.164 number, e.g. "+251911234567"
 * @returns URL of the form https://t.me/+251911234567
 */
export function buildTelegramPhoneUrl(e164: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  return `https://t.me/+${digits}`;
}

/**
 * Determine whether the raw input already contains an international prefix.
 * A leading "+" (optionally preceded by "00") is treated as international.
 */
export function looksInternational(raw: string): boolean {
  const trimmed = raw.trim();
  return trimmed.startsWith("+") || trimmed.startsWith("00");
}

/**
 * Parse and validate a phone number using libphonenumber-js.
 *
 * Rules implemented here:
 *  - If the input starts with "+", it is parsed as international and the
 *    selected country is ignored for the country code.
 *  - Otherwise it is parsed as a national number of the selected country.
 *  - The selected country's calling code is never appended twice because
 *    libphonenumber-js handles national vs. international disambiguation.
 */
export function parseContactNumber(
  raw: string,
  selectedIso2: string
): PhoneParseResult {
  const input = (raw ?? "").trim();

  if (!input) {
    return {
      valid: false,
      e164: "",
      international: "",
      national: "",
      message: "Enter a number",
    };
  }

  // Normalize a leading "00" international prefix into "+".
  const normalized = input.replace(/^00(?=\d)/, "+");
  const selected = getCountry(selectedIso2);
  const defaultCountry = (selected?.iso2 ?? "ET") as PhoneCountryCode;

  try {
    const phoneNumber = looksInternational(normalized)
      ? parsePhoneNumberFromString(normalized)
      : parsePhoneNumberFromString(normalized, defaultCountry);

    if (!phoneNumber) {
      return {
        valid: false,
        e164: "",
        international: "",
        national: "",
        country: selected,
        message: "Could not parse this number",
      };
    }

    const valid = phoneNumber.isValid();
    const detected = getCountry(phoneNumber.country ?? "");

    return {
      valid,
      e164: phoneNumber.number,
      international: phoneNumber.formatInternational(),
      national: phoneNumber.formatNational(),
      country: detected ?? selected,
      message: valid ? undefined : "Number looks incomplete or invalid",
    };
  } catch {
    return {
      valid: false,
      e164: "",
      international: "",
      national: "",
      country: selected,
      message: "Invalid characters in number",
    };
  }
}


/**
 * Build an Instagram profile URL. We safely encode the username so that
 * characters which are valid in IG (periods/underscores) are preserved while
 * anything unexpected is percent-encoded.
 */
export function buildInstagramUrl(username: string): string {
  const u = stripLeadingAt(username);
  return `https://www.instagram.com/${encodeURIComponent(u)}/`;
}


/** PSTN dialer link using E.164. */
export function buildTelUrl(e164: string): string {
  return `tel:${e164}`;
}

/**
 * WhatsApp wa.me link. The plus sign MUST be removed per the wa.me spec.
 */
export function buildWhatsAppUrl(e164: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

/**
 * Signal universal link. Format: https://signal.me/#p/<E164 without +>
 * Signal identifies users by phone number, so phone mode is required.
 */
export function buildSignalUrl(e164: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  return `https://signal.me/#p/${digits}`;
}

