import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Contact Launcher.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      updated="October 10, 2026"
      intro="By using Contact Launcher you agree to these terms. Please read them carefully."
    >
      <h2>What Contact Launcher is</h2>
      <p>
        Contact Launcher is a simple tool that helps you open the right app or
        web link for a contact based on the country calling code and a phone
        number, username, or account ID you provide. It can also start
        peer-to-peer internet voice and optional video calls directly in the
        browser using WebRTC.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to use Contact Launcher to:</p>
      <ul>
        <li>harass, stalk, spam, threaten, or abuse any person;</li>
        <li>send unsolicited or bulk messages;</li>
        <li>violate any law or the terms of any third-party service;</li>
        <li>attempt to scrape, overload, or disrupt the service.</li>
      </ul>
      <p>
        You are solely responsible for the numbers, usernames, and identifiers
        you enter and for how you use the links and calls you start.
      </p>

      <h2>Contact discovery limitations</h2>
      <p>
        Contact Launcher <strong>does not</strong> own a directory of users and
        does not verify whether a given phone number, username, or account ID is
        registered on any platform. Opening a link simply hands you off to that
        platform; whether the contact exists and can be reached is determined
        entirely by that third-party service.
      </p>

      <h2>Internet calling limitations</h2>
      <p>
        Peer-to-peer calls depend on your device, browser, network, and a
        compatible signaling server. Call quality and connectivity can vary, and
        calls may fail where networks block direct peer-to-peer connections.
        Internet calling is not a replacement for emergency services.
      </p>
      <p>
        <strong>Emergency notice:</strong> Do not rely on Contact Launcher for
        emergency calls. Always contact your local emergency number directly.
      </p>

      <h2>Third-party services</h2>
      <p>
        Contact Launcher links to services such as Telegram, Instagram, WhatsApp,
        Signal, and WeChat. These services are operated by third parties and are
        not affiliated with Contact Launcher. Your use of them is governed by
        their own terms and privacy policies. Google AdSense may also display
        advertising; see our{" "}
        <a href="/privacy">Privacy Policy</a> for how ads and cookies work.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
        without warranties of any kind, whether express or implied. We do not
        guarantee that the service will be uninterrupted, error-free, or that any
        link or call will succeed.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Contact Launcher and its operator
        will not be liable for any indirect, incidental, or consequential damages
        arising from your use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the service
        after changes means you accept the revised terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us through our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </PageShell>
  );
}
