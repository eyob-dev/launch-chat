import {
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import worldCountries from "world-countries";

export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "ET". */
  iso2: string;
  /** ISO 3166-1 alpha-3 code, e.g. "ETH" (when available). */
  iso3?: string;
  /** Full English country name, e.g. "Ethiopia". */
  name: string;
  /** Official or alternative names useful for search. */
  altNames: string[];
  /** International calling code without the plus sign, e.g. "251". */
  callingCode: string;
  /** Calling code prefixed with a plus for display, e.g. "+251". */
  displayCode: string;
  /** Emoji flag, e.g. "🇪🇹". */
  flag: string;
}

// Build a lookup of ISO2 -> country metadata from world-countries.
const metaByIso2 = new Map<
  string,
  { name: string; altNames: string[]; iso3?: string; flag: string }
>();

for (const c of worldCountries as Array<{
  cca2?: string;
  cca3?: string;
  name?: { common?: string; official?: string };
  altSpellings?: string[];
  flag?: string;
}>) {
  if (!c.cca2) continue;
  const common = c.name?.common?.trim();
  const official = c.name?.official?.trim();
  const alts = (c.altSpellings ?? []).filter(Boolean) as string[];
  metaByIso2.set(c.cca2, {
    name: common || official || c.cca2,
    altNames: Array.from(new Set([official, ...alts].filter(Boolean))) as string[],
    iso3: c.cca3,
    flag: c.flag ?? "",
  });
}

/**
 * Convert an ISO 3166-1 alpha-2 code into a regional-indicator emoji flag.
 * Used as a graceful fallback when the dataset does not provide one.
 */
export function iso2ToFlag(iso2: string): string {
  if (!/^[A-Za-z]{2}$/.test(iso2)) return "🏳️";
  return String.fromCodePoint(
    ...iso2
      .toUpperCase()
      .split("")
      .map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
}

/**
 * Build the complete country list by combining libphonenumber-js (authoritative
 * calling codes) with world-countries (names, ISO codes, flags). This runs once
 * at module load and is fully offline — no remote API is required.
 */
function buildCountries(): Country[] {
  const seen = new Set<string>();
  const result: Country[] = [];

  for (const iso2 of getCountries()) {
    const code = iso2.toUpperCase();
    if (seen.has(code)) continue;

    let callingCode = "";
    try {
      callingCode = getCountryCallingCode(iso2);
    } catch {
      // Skip countries without a known calling code rather than crash.
      continue;
    }
    if (!callingCode) continue;

    seen.add(code);
    const meta = metaByIso2.get(code);
    const name = meta?.name ?? code;
    const altNames = meta?.altNames ?? [];
    const flag = meta?.flag && meta.flag.length > 0 ? meta.flag : iso2ToFlag(code);

    result.push({
      iso2: code,
      iso3: meta?.iso3,
      name,
      altNames,
      callingCode,
      displayCode: `+${callingCode}`,
      flag,
    });
  }

  // Alphabetical sort by display name (locale-aware, case-insensitive).
  result.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  return result;
}

export const COUNTRIES: Country[] = buildCountries();

/** Fast lookups. */
const byIso2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

/** Map of calling code -> all countries that share it (e.g. "+1" -> US, CA). */
export const countriesByCallingCode: Map<string, Country[]> = (() => {
  const map = new Map<string, Country[]>();
  for (const c of COUNTRIES) {
    const list = map.get(c.callingCode) ?? [];
    list.push(c);
    map.set(c.callingCode, list);
  }
  return map;
})();

export const DEFAULT_COUNTRY_ISO2 = "ET";

export function getCountry(iso2: string): Country | undefined {
  return byIso2.get(iso2.toUpperCase());
}

export function getDefaultCountry(): Country {
  return getCountry(DEFAULT_COUNTRY_ISO2) ?? COUNTRIES[0];
}
