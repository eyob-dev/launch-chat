/**
 * Ambient type declarations for the Google AdSense global.
 *
 * The official adsbygoogle.js loader exposes a global `adsbygoogle` array.
 * Ad units are registered by pushing an empty object onto it. We declare the
 * minimal surface we use so TypeScript accepts the integration without pulling
 * in an unmaintained @types package.
 */
interface AdsByGoogleArray extends Array<unknown> {
  // Google's loader reads this queue; an empty push object registers a unit.
}

interface Window {
  adsbygoogle?: AdsByGoogleArray;
}
