import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Contact Launcher is, what it does, which integrations it supports, and its limitations.",
  alternates: { canonical: "/about" },
};

const UPDATED = "2026-10-10";

export default function AboutPage() {
  return (
    <PageShell
      title="About Contact Launcher"
      updated={UPDATED}
      intro="Contact Launcher is a simple, mobile-first web tool that helps you reach someone using the platform you already use — or by calling them directly."
    >
      <h2>What it does</h2>
      <p>
        You pick a country, enter a phone number or a username/account ID, and
        then choose how you want to reach the contact. Contact Launcher formats
        the details correctly and opens the right place for you:
      </p>
      <ul>
        <li>
          <strong>Telegram, Instagram</strong> — open a profile or chat from a
          username.
        </li>
        <li>
          <strong>WhatsApp, Signal</strong> — open a chat from a phone number.
        </li>
        <li>
          <strong>WeChat</strong> — copy your contact ID so you can paste it
          into WeChat&rsquo;s &ldquo;Add by ID&rdquo; screen (WeChat does not
          offer a public profile web link).
        </li>
        <li>
          <strong>Call</strong> — open your phone&rsquo;s dialer with the number
          pre-filled.
        </li>
        <li>
          <strong>Internet Call</strong> — start a peer-to-peer voice (and
          optionally video) call directly between two people using this app.
        </li>
      </ul>

      <h2>How it works</h2>
      <p>
        Phone numbers are validated and formatted using the widely used
        libphonenumber library, which keeps country codes and number formats
        accurate for every supported country. Messaging buttons simply build the
        correct deep link and open it in a new tab — your number or username is
        placed into the link so the platform can open the right chat or profile.
      </p>
      <p>
        The Internet Call feature uses WebRTC for a direct, peer-to-peer audio
        and video connection. A small signaling service is used only to help the
        two devices find each other and exchange connection details; the actual
        audio and video travel directly between the two participants.
      </p>

      <h2>Important limitations</h2>
      <ul>
        <li>
          Contact Launcher <strong>cannot verify</strong> whether a person is
          registered on any platform. Opening a link does not guarantee the
          account exists or will respond.
        </li>
        <li>
          We are <strong>not affiliated with, endorsed by, or partnered with</strong>{" "}
          Telegram, Instagram, WhatsApp, Signal, WeChat, or any other platform.
          All names and trademarks belong to their respective owners.
        </li>
        <li>
          Internet calling requires both people to be using this app and a
          working signaling server; restrictive networks may require a TURN
          server to connect.
        </li>
      </ul>

      <h2>Our goal</h2>
      <p>
        To provide one fast, accessible place to reach someone however they
        prefer — without an account, without storing your contacts, and without
        getting in your way.
      </p>
    </PageShell>
  );
}
