/**
 * Minimal WebSocket signaling client.
 *
 * Protocol (JSON messages):
 *   { type: "join", room: string }
 *   { type: "offer", room: string, sdp: RTCSessionDescriptionInit }
 *   { type: "answer", room: string, sdp: RTCSessionDescriptionInit }
 *   { type: "ice", room: string, candidate: RTCIceCandidateInit }
 *   { type: "leave", room: string }
 *
 * The server relays messages to other peers in the same room. See
 * server/README.md for the reference Node.js signaling server.
 */

export type SignalMessage =
  | { type: "join"; room: string }
  | { type: "leave"; room: string }
  | { type: "offer"; room: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; room: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; room: string; candidate: RTCIceCandidateInit };

export type SignalStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

export class SignalingClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<(msg: SignalMessage) => void>>();
  private statusListeners = new Set<(s: SignalStatus) => void>();
  private _status: SignalStatus = "idle";
  private queue: SignalMessage[] = [];

  constructor(private url: string) {}

  get status(): SignalStatus {
    return this._status;
  }

  private setStatus(s: SignalStatus) {
    this._status = s;
    this.statusListeners.forEach((cb) => cb(s));
  }

  onStatus(cb: (s: SignalStatus) => void): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  on(type: SignalMessage["type"], cb: (msg: SignalMessage) => void): () => void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(cb);
    this.listeners.set(type, set);
    return () => set.delete(cb);
  }

  private emit(msg: SignalMessage) {
    this.listeners.get(msg.type)?.forEach((cb) => cb(msg));
  }

  connect(): void {
    if (this.ws && (this._status === "open" || this._status === "connecting")) {
      return;
    }
    this.setStatus("connecting");
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      this.setStatus("open");
      // Flush any queued messages.
      this.queue.forEach((m) => this.send(m));
      this.queue = [];
    };
    ws.onclose = () => this.setStatus("closed");
    ws.onerror = () => this.setStatus("error");
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as SignalMessage;
        this.emit(msg);
      } catch {
        // ignore malformed frames
      }
    };
  }

  send(msg: SignalMessage): void {
    if (this.ws && this._status === "open") {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.queue.push(msg);
    }
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
    this.setStatus("closed");
  }
}
