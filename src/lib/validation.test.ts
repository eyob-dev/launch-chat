import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildInstagramUrl,
  buildSignalUrl,
  buildTelUrl,
  buildTelegramPhoneUrl,
  buildTelegramUrl,
  buildWhatsAppUrl,
  isValidInstagramUsername,
  isValidTelegramUsername,
  looksInternational,
  parseContactNumber,
  stripLeadingAt,
} from "./validation";

// The country data layer imports libphonenumber-js + world-countries which
// resolve fine under tsx / node with the bundler aliases below.

test("stripLeadingAt removes @ and trims", () => {
  assert.equal(stripLeadingAt("  @johndoe  "), "johndoe");
  assert.equal(stripLeadingAt("@@twice"), "twice");
  assert.equal(stripLeadingAt("plain"), "plain");
});

test("Telegram username validation", () => {
  assert.equal(isValidTelegramUsername("@johndoe"), true);
  assert.equal(isValidTelegramUsername("abc"), false); // too short
  assert.equal(isValidTelegramUsername("1abcde"), false); // must start with letter
  assert.equal(isValidTelegramUsername("john_"), false); // trailing underscore
  assert.equal(isValidTelegramUsername("john.doe"), false); // dot not allowed
  assert.equal(isValidTelegramUsername("abcdefghij"), true);
});

test("Instagram username validation", () => {
  assert.equal(isValidInstagramUsername("@john.doe"), true);
  assert.equal(isValidInstagramUsername("john_doe"), true);
  assert.equal(isValidInstagramUsername("john..doe"), false); // double period
  assert.equal(isValidInstagramUsername("johndoe."), false); // trailing period
  assert.equal(isValidInstagramUsername("a"), true);
});

test("looksInternational detects + and 00 prefixes", () => {
  assert.equal(looksInternational("+251911234567"), true);
  assert.equal(looksInternational("0049163607445"), true);
  assert.equal(looksInternational("0911234567"), false);
});

test("parses a national Ethiopian number using selected country", () => {
  const r = parseContactNumber("0911234567", "ET");
  assert.equal(r.valid, true);
  assert.equal(r.e164, "+251911234567");
  assert.equal(r.country?.iso2, "ET");
});

test("parses an international number ignoring selected country", () => {
  // Selected ET but number is +1 (US); must not double the ET code.
  const r = parseContactNumber("+12025550123", "ET");
  assert.equal(r.valid, true);
  assert.equal(r.e164, "+12025550123");
  assert.equal(r.country?.iso2, "US");
});

test("normalizes 00 international prefix to +", () => {
  const r = parseContactNumber("004916012345678", "ET");
  assert.equal(r.valid, true);
  assert.equal(r.e164, "+4916012345678");
});

test("does not double the calling code when + is present", () => {
  const r = parseContactNumber("+251911234567", "ET");
  assert.equal(r.e164, "+251911234567");
  assert.ok(!r.e164.includes("251251"));
});

test("rejects an incomplete / invalid number", () => {
  const r = parseContactNumber("123", "ET");
  assert.equal(r.valid, false);
  assert.ok(r.message);
});

test("empty input is handled", () => {
  const r = parseContactNumber("", "ET");
  assert.equal(r.valid, false);
  assert.equal(r.message, "Enter a number");
});

test("link builders produce correct URLs", () => {
  assert.equal(buildTelegramUrl("@johndoe"), "https://t.me/johndoe");
  assert.equal(buildInstagramUrl("@john.doe"), "https://www.instagram.com/john.doe/");
  assert.equal(buildTelUrl("+251911234567"), "tel:+251911234567");
  // wa.me must strip the plus sign.
  assert.equal(buildWhatsAppUrl("+251911234567"), "https://wa.me/251911234567");
  // Signal uses digits without +.
  assert.equal(buildSignalUrl("+251911234567"), "https://signal.me/#p/251911234567");
  // Telegram-by-phone is a best-effort t.me/+ link; must strip non-digits.
  assert.equal(buildTelegramPhoneUrl("+251911234567"), "https://t.me/+251911234567");
});
