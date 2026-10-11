"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff, X } from "lucide-react";
import { WebRTCCall, type CallState } from "@/lib/webrtc";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Room code = the contact identifier (E.164 digits or a chosen handle). */
  room: string;
  initiator: boolean;
  withVideo: boolean;
  contactLabel: string;
}

const SIGNALING_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL ?? "ws://localhost:8080";

export function CallModal({
  open,
  onClose,
  room,
  initiator,
  withVideo,
  contactLabel,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callRef = useRef<WebRTCCall | null>(null);

  const [state, setState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(withVideo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let call: WebRTCCall | null = null;

    async function start() {
      try {
        call = new WebRTCCall({
          room,
          initiator,
          withVideo,
          signalingUrl: SIGNALING_URL,
        });
        callRef.current = call;
        call.onState = (s) => setState(s);
        call.onLocalStream = (s) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
            void localVideoRef.current.play().catch(() => {});
          }
        };
        call.onRemoteStream = (s) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = s;
            void remoteVideoRef.current.play().catch(() => {});
          }
        };
        await call.start();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to start the call";
        setError(
          msg.includes("Permission") || msg.includes("denied")
            ? "Camera/microphone permission was denied."
            : msg
        );
        setState("failed");
      }
    }

    void start();

    return () => {
      call?.hangup();
      callRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room, initiator]);

  const handleHangup = () => {
    callRef.current?.hangup();
    onClose();
  };

  const toggleMute = () => {
    const next = !muted;
    callRef.current?.setMuted(next);
    setMuted(next);
  };

  const toggleVideo = () => {
    const next = !videoOn;
    callRef.current?.setVideoEnabled(next);
    setVideoOn(next);
  };

  if (!open) return null;

  const statusText: Record<CallState, string> = {
    idle: "Starting…",
    connecting: "Connecting…",
    ringing: "Ringing…",
    active: "Connected",
    ended: "Call ended",
    failed: "Connection failed",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Internet call with ${contactLabel}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-gray-900 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{contactLabel}</h2>
            <p className="text-sm text-gray-300" data-testid="call-status">
              {statusText[state]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleHangup}
            aria-label="Close call"
            className="rounded-full p-2 text-gray-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={remoteVideoRef}
            playsInline
            autoPlay
            className={`h-full w-full object-cover ${videoOn || !withVideo ? "" : "opacity-0"}`}
          />
          {!withVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-3xl font-bold">
                {contactLabel.slice(0, 1).toUpperCase()}
              </div>
              <p className="text-gray-300">Voice call</p>
            </div>
          )}
          {withVideo && (
            <video
              ref={localVideoRef}
              playsInline
              autoPlay
              muted
              className="absolute bottom-3 right-3 h-24 w-20 rounded-lg border border-white/20 object-cover shadow-lg"
            />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center">
              <div>
                <p className="mb-2 font-semibold text-red-400">Call error</p>
                <p className="text-sm text-gray-200">{error}</p>
                <p className="mt-3 text-xs text-gray-400">
                  Make sure the signaling server is running and accessible.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 px-5 py-5">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute microphone" : "Mute microphone"}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${muted ? "bg-white text-gray-900" : "bg-white/15 hover:bg-white/25"}`}
          >
            {muted ? (
              <MicOff className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Mic className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={handleHangup}
            aria-label="Hang up"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <PhoneOff className="h-7 w-7" aria-hidden="true" />
          </button>

          {withVideo && (
            <button
              type="button"
              onClick={toggleVideo}
              aria-label={videoOn ? "Turn off camera" : "Turn on camera"}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${videoOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-gray-900"}`}
            >
              {videoOn ? (
                <Video className="h-6 w-6" aria-hidden="true" />
              ) : (
                <VideoOff className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
