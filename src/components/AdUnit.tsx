"use client";

import { useEffect, useRef } from "react";
import { adsenseClientId, isValidSlot } from "@/lib/ads";

interface AdUnitProps {
  /**
   * A valid AdSense ad unit slot id (numeric string). When omitted or invalid,
   * nothing is rendered — we never show fake ads.
   */
  slot: string | null | undefined;
  /** Accessible label / context for screen readers. */
  label?: string;
  /** Reserved height in px to reduce layout shift while the ad loads. */
  minHeight?: number;
  className?: string;
}

export function AdUnit({
  slot,
  label = "Advertisement",
  minHeight = 100,
  className = "",
}: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const configured = isValidSlot(slot) && /^ca-pub-\d{16}$/.test(adsenseClientId);

  useEffect(() => {
    // Do nothing when misconfigured — the app must render normally.
    if (!configured) return;

    // The official loader script is injected once globally in the root layout
    // (next/script). Here we only register this specific <ins> ad unit exactly
    // once via the global adsbygoogle queue. If an ad blocker removed the
    // script, window.adsbygoogle is undefined and we skip silently — no fake ad,
    // no repeated attempts, no console errors from us.
    const push = () => {
      if (pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // Ad blocked or script unavailable: fail silently.
      }
    };

    // The loader may still be fetching; push now and retry once shortly after.
    push();
    const t = setTimeout(push, 300);
    return () => clearTimeout(t);
  }, [configured, slot]);

  if (!configured) return null;

  return (
    <div
      className={`w-full ${className}`}
      data-testid="ad-unit"
      aria-label={label}
      role="complementary"
    >
      <div className="mb-1 text-center text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </div>
      <div
        className="mx-auto flex max-w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100/60 dark:bg-gray-800/40"
        style={{ minHeight }}
      >
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={adsenseClientId}
          data-ad-slot={slot as string}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

