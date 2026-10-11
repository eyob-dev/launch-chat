"use client";

import { useEffect, useRef } from "react";
import { isValidSlot } from "@/lib/ads";

export type AdBannerTypes = {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
};

const PUBLISHER_ID = "ca-pub-4981357540723345";

const AdBanner = ({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
}: AdBannerTypes) => {
  const pushed = useRef(false);
  const configured = isValidSlot(dataAdSlot);

  useEffect(() => {
    if (!configured || pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocker or unavailable AdSense loader: fail silently.
    }
  }, [configured]);

  if (!configured) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    />
  );
};

export default AdBanner;
