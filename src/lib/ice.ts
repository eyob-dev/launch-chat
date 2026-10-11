/**
 * ICE / TURN / STUN configuration for WebRTC.
 *
 * STUN servers discover the public IP address of the device. TURN servers
 * relay media when a direct peer-to-peer connection cannot be established
 * (symmetric NATs, strict corporate firewalls, mobile carrier networks).
 *
 * Configuration is read from environment variables so secrets are not baked
 * into the client bundle source. In production you should mint short-lived
 * TURN credentials from a backend using time-limited HMAC tokens.
 */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

function splitUrls(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildIceServers(): IceServer[] {
  const servers: IceServer[] = [];

  const stunUrls = splitUrls(
    process.env.NEXT_PUBLIC_STUN_URLS ?? "stun:stun.l.google.com:19302"
  );
  if (stunUrls.length) servers.push({ urls: stunUrls });

  const turnUrls = splitUrls(process.env.NEXT_PUBLIC_TURN_URLS);
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
  if (turnUrls.length) {
    servers.push({
      urls: turnUrls,
      ...(turnUser ? { username: turnUser } : {}),
      ...(turnCred ? { credential: turnCred } : {}),
    });
  }

  return servers;
}
