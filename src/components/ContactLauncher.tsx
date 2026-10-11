"use client";

import { useMemo, useState } from "react";
import {
  AtSign,
  Copy,
  Eraser,
  Hash,
  Instagram,
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Video,
} from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { CallModal } from "@/components/CallModal";
import { AdUnit } from "@/components/AdUnit";
import { SiteFooter } from "@/components/PageShell";
import { DEFAULT_COUNTRY_ISO2 } from "@/data/countries";
import { homeAdSlot } from "@/lib/ads";
import {
  buildInstagramUrl,
  buildSignalUrl,
  buildTelUrl,
  buildTelegramPhoneUrl,
  buildTelegramUrl,
  buildWhatsAppUrl,
  isValidInstagramUsername,
  isValidTelegramUsername,
  parseContactNumber,
  stripLeadingAt,
  type InputMode,
} from "@/lib/validation";

interface Action {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Brand / accent styling classes. */
  className: string;
  /** Whether the current input is valid for this platform (drives styling). */
  ready: boolean;
  onClick: () => void;
  hint?: string;
}

export function ContactLauncher() {
  const [country, setCountry] = useState(DEFAULT_COUNTRY_ISO2);
  const [mode, setMode] = useState<InputMode>("phone");
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [withVideo, setWithVideo] = useState(false);

  const phone = useMemo(() => parseContactNumber(input, country), [input, country]);
  const username = stripLeadingAt(input);

  const tgValid = isValidTelegramUsername(input);
  const igValid = isValidInstagramUsername(input);

  // The identity used as the WebRTC room code.
  const roomCode = mode === "phone" ? phone.e164.replace(/\D/g, "") : username;

  /** Show a transient, screen-reader-announced message. */
  function showNotice(msg: string) {
    setNotice(msg);
    window.clearTimeout((showNotice as unknown as { _t?: number })._t);
    (showNotice as unknown as { _t?: number })._t = window.setTimeout(
      () => setNotice(null),
      3200
    );
  }

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyContact() {
    const value = mode === "phone" ? phone.e164 || input : username || input;
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  const phoneReady = phone.valid && phone.e164.length > 0;
  const anyInput = input.trim().length > 0;

  // Telegram readiness depends on the active input mode.
  const telegramReady =
    mode === "phone" ? phoneReady : tgValid;

  const platformActions: Action[] = [
    {
      key: "telegram",
      label: "Telegram",
      icon: <Send className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400 text-white",
      ready: telegramReady,
      hint:
        mode === "phone"
          ? "Best-effort: opens t.me/+phone (only works if that person allows phone discovery)"
          : "Opens t.me/USERNAME (reliable — usernames are the official way)",
      onClick: () => {
        if (!anyInput) return showNotice("Enter a username or phone number first.");

        // Phone-number mode: Telegram has no reliable public profile-by-phone
        // link. We attempt it but tell the user the truth about the limitation.
        if (mode === "phone") {
          if (!phoneReady)
            return showNotice(
              phone.message
                ? `Telegram needs a valid phone number — ${phone.message}.`
                : "Enter a valid phone number."
            );
          openUrl(buildTelegramPhoneUrl(phone.e164));
          showNotice(
            "Opened Telegram by phone. Note: Telegram only shows this person if their privacy setting allows being found by phone number. A username is more reliable — switch to “Username / ID”."
          );
          return;
        }

        // Username mode: the reliable, documented path.
        if (!tgValid)
          return showNotice(
            "Invalid Telegram username. Use 5–32 letters, numbers or underscores, starting with a letter."
          );
        openUrl(buildTelegramUrl(username));
      },
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: <Instagram className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:brightness-110 focus-visible:ring-pink-400 text-white",
      ready: igValid,
      hint: "Opens instagram.com/USERNAME (needs a username)",
      onClick: () => {
        if (!anyInput) return showNotice("Enter an Instagram username first.");
        if (!igValid)
          return showNotice(
            "Invalid Instagram username. Use 1–30 letters, numbers, periods or underscores."
          );
        openUrl(buildInstagramUrl(username));
      },
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-green-500 hover:bg-green-600 focus-visible:ring-green-400 text-white",
      ready: phoneReady,
      hint: "Opens wa.me chat (needs a valid phone number)",
      onClick: () => {
        if (!phoneReady)
          return showNotice(
            phone.message
              ? `WhatsApp needs a valid phone number — ${phone.message}.`
              : "Enter a valid phone number for WhatsApp."
          );
        openUrl(buildWhatsAppUrl(phone.e164));
      },
    },
    {
      key: "signal",
      label: "Signal",
      icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400 text-white",
      ready: phoneReady,
      hint: "Opens signal.me (needs a valid phone number)",
      onClick: () => {
        if (!phoneReady)
          return showNotice(
            phone.message
              ? `Signal needs a valid phone number — ${phone.message}.`
              : "Enter a valid phone number for Signal."
          );
        openUrl(buildSignalUrl(phone.e164));
      },
    },
    {
      key: "wechat",
      label: "WeChat",
      icon: <Hash className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400 text-white",
      ready: username.length > 0,
      hint: "Copies the ID and opens WeChat web (WeChat has no public profile URL)",
      onClick: async () => {
        if (username.length === 0)
          return showNotice("Enter a WeChat ID first.");
        const ok = await copyContact();
        showNotice(
          ok
            ? `Copied “${username}” — paste it in WeChat → Add by ID.`
            : "Could not copy automatically. Copy the ID manually."
        );
        openUrl("https://web.wechat.com/");
      },
    },
    {
      key: "call",
      label: "Call",
      icon: <Phone className="h-6 w-6" aria-hidden="true" />,
      className:
        "bg-gray-800 hover:bg-gray-900 focus-visible:ring-gray-500 text-white dark:bg-gray-700 dark:hover:bg-gray-600",
      ready: phoneReady,
      hint: "Opens the phone dialer",
      onClick: () => {
        if (!phoneReady)
          return showNotice(
            phone.message
              ? `Cannot dial — ${phone.message}.`
              : "Enter a valid phone number to call."
          );
        openUrl(buildTelUrl(phone.e164));
      },
    },
  ];

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16">
      {/* Header */}
      <header className="pt-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
          <PhoneCall className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Contact Launcher
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          Connect with anyone, anywhere.
        </p>
      </header>

      {/* Controls card */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Country selector */}
        <div className="mb-4">
          <CountrySelector value={country} onChange={setCountry} />
        </div>

        {/* Mode selector */}
        <div className="mb-4">
          <div
            role="radiogroup"
            aria-label="Input type"
            className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-900"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === "phone"}
              onClick={() => setMode("phone")}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${mode === "phone" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Phone number
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "username"}
              onClick={() => setMode("username")}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${mode === "username" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
            >
              <AtSign className="h-4 w-4" aria-hidden="true" />
              Username / ID
            </button>
          </div>
        </div>

        {/* Contact input + actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="contact" className="sr-only">
              {mode === "phone" ? "Phone number" : "Username or account ID"}
            </label>
            <input
              id="contact"
              type={mode === "phone" ? "tel" : "text"}
              inputMode={mode === "phone" ? "tel" : "text"}
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "phone" ? "91 123 4567 or +251911234567" : "username or ID"
              }
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-4 pr-24 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
              <button
                type="button"
                onClick={async () => {
                  if (!anyInput) return showNotice("Nothing to copy yet.");
                  const ok = await copyContact();
                  const value = mode === "phone" ? phone.e164 || input : username;
                  showNotice(
                    ok ? `Copied “${value}”` : "Could not copy. Select the text and copy manually."
                  );
                }}
                aria-label="Copy contact"
                title="Copy contact"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setInput("")}
                aria-label="Clear input"
                title="Clear"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-gray-700"
              >
                <Eraser className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback: transient action notices + live validation */}
        <div
          className="mt-3 min-h-[2.5rem] text-sm"
          aria-live="polite"
          data-testid="feedback"
        >
          {notice && (
            <span
              className={`font-medium ${
                /invalid|cannot|could not|needs|first|check/i.test(notice)
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {notice}
            </span>
          )}
          {!notice && mode === "phone" && input.trim().length > 0 && (
            phone.valid ? (
              <span className="font-medium text-green-600 dark:text-green-400">
                Valid: {phone.international}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                {phone.message}
              </span>
            )
          )}
          {!notice && mode === "username" && input.trim().length > 0 && (
            tgValid || igValid ? (
              <span className="font-medium text-green-600 dark:text-green-400">
                Using @{username}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                Check the username format (5+ chars, letters/numbers/underscore)
              </span>
            )
          )}
        </div>
      </section>

      {/* Platform buttons: 2-col mobile, 3-col tablet+ */}
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {platformActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              title={action.hint}
              data-testid={`btn-${action.key}`}
              className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${action.className} ${
                action.ready ? "" : "opacity-50 saturate-50"
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Internet Call — full width, visually distinct */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={withVideo}
              onChange={(e) => setWithVideo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus-visible:ring-primary-500"
            />
            <Video className="h-4 w-4" aria-hidden="true" />
            Include video
          </label>
        </div>
        <button
          type="button"
          onClick={() => setCallOpen(true)}
          disabled={roomCode.length === 0}
          data-testid="btn-internet-call"
          className="flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <span className="flex items-center gap-2">
            <PhoneCall className="h-6 w-6" aria-hidden="true" />
            Internet Call
          </span>
          <span className="text-xs font-normal opacity-90">
            {withVideo ? "Peer-to-peer voice & video" : "Peer-to-peer voice"}
          </span>
        </button>
      </section>

      <CallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        room={roomCode}
        initiator
        withVideo={withVideo}
        contactLabel={
          mode === "phone" ? phone.e164 || input : `@${username || input}`
        }
      />

      {/* Clearly separated, responsive advertisement. Rendered only when
          AdSense is configured; never near the call controls. */}
      <section className="mt-10" aria-label="Advertisement">
        <AdUnit
          slot={homeAdSlot}
          label="Advertisement"
          minHeight={100}
        />
      </section>

      <SiteFooter />
    </div>
  );
}

