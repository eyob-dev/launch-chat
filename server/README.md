# Signaling Server

The Universal Contact Launcher uses WebRTC for peer-to-peer internet calling.
WebRTC needs a signaling channel to exchange session descriptions (offer/answer)
and ICE candidates. This folder contains a minimal reference server.

## Run locally

```bash
npm install ws
node server/signaling-server.mjs
```

It listens on `ws://localhost:8080` by default (override with `PORT`).

Point the frontend at it by setting in `.env.local`:

```
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8080
```

## How it works

- Peers connect to the same WebSocket URL and send a `join` message with a
  shared `room` code (the contact identifier you are calling).
- The server relays `offer`, `answer`, and `ice` messages to the other peers in
  that room, and nothing else. It never sees the media, which flows
  peer-to-peer.

## Deployment notes

- Vercel does not host WebSocket servers. Deploy this server to a platform that
  supports long-lived connections: Fly.io, Railway, Render, a VPS, etc.
- Use `wss://` (TLS) in production, and set `NEXT_PUBLIC_SIGNALING_URL`
  accordingly.
- For scale and multi-region routing, consider a managed real-time provider
  (Ably, Pusher, LiveKit, Daily) — the client only needs the four message types
  above, so it is straightforward to adapt `src/lib/signaling.ts`.

## TURN

For restrictive networks where a direct P2P connection fails, configure a TURN
server via the `.env.example` variables. Mint short-lived credentials from a
backend in production.
