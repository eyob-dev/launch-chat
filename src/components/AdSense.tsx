import Script from "next/script";

export type AdsenseTypes = {
  /** The 16 digit publisher ID portion after `ca-pub-`. */
  pId: string;
};

const PUBLISHER_ID_RE = /^\d{16}$/;

const AdSense = ({ pId }: AdsenseTypes) => {
  if (!PUBLISHER_ID_RE.test(pId)) return null;

  return (
    <>
      <meta name="google-adsense-account" content={`ca-pub-${pId}`} />
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
};

export default AdSense;
