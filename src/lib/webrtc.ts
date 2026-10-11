import { buildIceServers } from "@/lib/ice";
import { SignalingClient } from "@/lib/signaling";

export type CallState =
  | "idle"
  | "connecting"
  | "ringing"
  | "active"
  | "ended"
  | "failed";

export interface CallOptions {
  room: string;
  /** If true, this peer initiates by creating the offer. */
  initiator: boolean;
  withVideo: boolean;
  signalingUrl: string;
  localStream?: MediaStream;
}

/**
 * A small helper around RTCPeerConnection that:
 *  - connects to the signaling server,
 *  - joins a shared room,
 *  - exchanges offer/answer/ICE,
 *  - exposes local/remote streams for rendering.
 *
 * It is intentionally framework-agnostic; the React component drives it.
 */
export class WebRTCCall {
  pc: RTCPeerConnection;
  signaling: SignalingClient;
  private unsubs: Array<() => void> = [];
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private remoteDescriptionSet = false;
  private localStream: MediaStream | null = null;

  state: CallState = "idle";
  onState?: (s: CallState) => void;
  onRemoteStream?: (s: MediaStream) => void;
  onLocalStream?: (s: MediaStream) => void;

  constructor(private opts: CallOptions) {
    this.signaling = new SignalingClient(opts.signalingUrl);
    this.pc = new RTCPeerConnection({ iceServers: buildIceServers() });
    this.setup();
  }

  private setState(s: CallState) {
    this.state = s;
    this.onState?.(s);
  }

  private setup() {
    this.pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        this.signaling.send({
          type: "ice",
          room: this.opts.room,
          candidate: ev.candidate.toJSON(),
        });
      }
    };

    this.pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (stream) this.onRemoteStream?.(stream);
    };

    this.pc.onconnectionstatechange = () => {
      switch (this.pc.connectionState) {
        case "connected":
          this.setState("active");
          break;
        case "disconnected":
        case "failed":
          this.setState("failed");
          break;
        case "closed":
          this.setState("ended");
          break;
      }
    };

    // Signaling events.
    this.unsubs.push(
      this.signaling.on("offer", async (m) => {
        if (m.type !== "offer") return;
        await this.pc.setRemoteDescription(new RTCSessionDescription(m.sdp));
        this.remoteDescriptionSet = true;
        await this.flushCandidates();
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        this.signaling.send({ type: "answer", room: this.opts.room, sdp: answer });
        this.setState("ringing");
      })
    );

    this.unsubs.push(
      this.signaling.on("answer", async (m) => {
        if (m.type !== "answer") return;
        if (this.pc.signalingState !== "stable") {
          await this.pc.setRemoteDescription(new RTCSessionDescription(m.sdp));
          this.remoteDescriptionSet = true;
          await this.flushCandidates();
        }
      })
    );

    this.unsubs.push(
      this.signaling.on("ice", async (m) => {
        if (m.type !== "ice") return;
        if (this.remoteDescriptionSet) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(m.candidate));
          } catch {
            // ignore
          }
        } else {
          this.pendingCandidates.push(m.candidate);
        }
      })
    );
  }

  private async flushCandidates() {
    for (const c of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        // ignore
      }
    }
    this.pendingCandidates = [];
  }

  async start(): Promise<void> {
    this.setState("connecting");
    this.signaling.connect();

    // Acquire local media if not already provided.
    if (!this.localStream) {
      this.localStream =
        this.opts.localStream ??
        (await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: this.opts.withVideo,
        }));
    }
    this.onLocalStream?.(this.localStream);

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream!);
    });

    // Wait until the signaling socket is open before joining.
    await this.waitForOpen();

    this.signaling.send({ type: "join", room: this.opts.room });

    if (this.opts.initiator) {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.signaling.send({ type: "offer", room: this.opts.room, sdp: offer });
      this.setState("ringing");
    }
  }

  private waitForOpen(): Promise<void> {
    return new Promise((resolve) => {
      if (this.signaling.status === "open") return resolve();
      const off = this.signaling.onStatus((s) => {
        if (s === "open") {
          off();
          resolve();
        } else if (s === "error") {
          off();
          this.setState("failed");
          resolve();
        }
      });
    });
  }

  setMuted(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  setVideoEnabled(enabled: boolean): void {
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enabled));
  }

  hangup(): void {
    try {
      this.signaling.send({ type: "leave", room: this.opts.room });
    } catch {
      // ignore
    }
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.pc.getSenders().forEach((s) => s.track?.stop());
    this.pc.close();
    this.signaling.close();
    this.setState("ended");
  }
}
