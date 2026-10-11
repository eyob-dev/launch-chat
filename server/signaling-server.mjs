/**
 * Reference WebSocket signaling server for the Universal Contact Launcher.
 *
 * It is intentionally tiny and dependency-free (uses the `ws` package). It
 * relays signaling messages between peers that share the same room code.
 *
 * Run locally:
 *   npm install ws
 *   node server/signaling-server.mjs
 *
 * Deploy anywhere that supports long-lived WebSockets (Fly.io, Railway,
 * Render, a VPS, etc.). Vercel does not host WebSocket servers, so run this
 * separately and point NEXT_PUBLIC_SIGNALING_URL at it.
 */
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

/** room -> Set<WebSocket> */
const rooms = new Map();

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

wss.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    const { type, room } = msg;
    if (!room) return;

    if (type === "join") {
      currentRoom = room;
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(ws);
      return;
    }

    if (type === "leave") {
      const set = rooms.get(currentRoom);
      if (set) {
        set.delete(ws);
        if (set.size === 0) rooms.delete(currentRoom);
      }
      currentRoom = null;
      return;
    }

    // Relay offer / answer / ice to all OTHER peers in the room.
    if (type === "offer" || type === "answer" || type === "ice") {
      const set = rooms.get(room);
      if (!set) return;
      for (const peer of set) {
        if (peer !== ws) send(peer, msg);
      }
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      const set = rooms.get(currentRoom);
      if (set) {
        set.delete(ws);
        if (set.size === 0) rooms.delete(currentRoom);
      }
    }
  });
});

console.log(`Signaling server listening on ws://localhost:${PORT}`);
