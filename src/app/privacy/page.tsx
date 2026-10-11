import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Contact Launcher handles data, cookies, and Google AdSense advertising cookies.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2026-10-10";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      updated={UPDATED}
      intro="This policy explains what Contact Launcher does and does not do with your information."
    >
      <h2>Summary</h2>
      <ul>
        <li>
          We do <strong>not</strong> require an account, and we do{" "}
          <strong>not</strong> store the phone numbers or usernames you enter.
          They stay in your browser as you use the tool.
        </li>
        <li>
          We do <strong>not</strong> sell or rent your personal information.
        </li>
        <li>
          This site shows ads through <strong>Google AdSense</strong>, which uses
          cookies and similar technologies as described below.
        </li>
      </ul>

      <h2>Information you enter</h2>
      <p>
        When you type a country code, phone number, or username, that input is
        processed in your browser to validate and format it and to build a deep
        link to the platform you choose. We do not transmit this input to us for
        storage, and it is not used to build a profile about you.
      </p>

      <h2>Internet calling</h2>
      <p>
        When you use the Internet Call feature, a connection is established
        between you and the other participant using WebRTC. Audio and video are
        sent peer-to-peer. A signaling service is used only to help the two
        devices connect; it processes the minimum technical data needed to set up
        the call (such as a room identifier and connection candidates) and is not
        intended to record the content of your calls. Depending on configuration,
        connection details may pass through a TURN server when a direct
        connection is not possible.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        We store your light/dark theme preference in your browser&rsquo;s local
        storage. This is not used for tracking or advertising.
      </p>

      <h2>Google AdSense and third-party advertising</h2>
      <p>
        We use Google AdSense to display ads. Google and its partners use
        cookies to serve ads based on your prior visits to this and other
        websites. Google&rsquo;s use of advertising cookies enables it and its
        partners to serve ads to you based on your visit to this site and/or
        other sites on the internet.
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based
          on a user&rsquo;s prior visits to this website or other websites.
        </li>
        <li>
          Google&rsquo;s use of advertising cookies enables it and its partners
          to serve ads to you based on your visit to this site and/or other
          sites on the internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Google Ads Settings
          </a>
          . You can also opt out of a third-party vendor&rsquo;s use of cookies
          for personalized advertising at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            aboutads.info/choices
          </a>{" "}
          or{" "}
          <a
            href="https://optout.networkadvertising.org/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            optout.networkadvertising.org
          </a>
          .
        </li>
      </ul>
      <p>
        For more information about how Google uses data from sites that use its
        services, see{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Google&rsquo;s &ldquo;Technologies&rdquo; page for partner sites
        </a>
        .
      </p>

      <h2>Consent (EEA, UK, and Switzerland)</h2>
      <p>
        If you are located in the European Economic Area, the United Kingdom, or
        Switzerland, you may be shown a consent message before personalized ads
        are served, and you can choose to accept or reject non-essential cookies
        and personalized advertising. Your choice is respected. You can change
        your mind at any time from the consent option where available, or via the
        Google opt-outs linked above.
      </p>
      <p>
        <strong>Note:</strong> Depending on the regions you target and your
        advertising setup, Google may require a Google-certified Consent
        Management Platform (CMP). See the project README for the remaining
        configuration steps.
      </p>

      <h2>Data retention and deletion</h2>
      <p>
        Because we do not create accounts or store the contacts you enter, there
        is generally no personal data for us to retain or delete on your behalf.
        Advertising cookies are controlled by Google and your browser settings.
        If you contact us by email, we keep that correspondence only as long as
        needed to respond and for legitimate record-keeping.
      </p>

      <h2>Your choices and contacting us</h2>
      <p>
        You can clear cookies and site data at any time through your browser
        settings, and opt out of personalized ads using the links above. For any
        privacy question or request, contact us via our{" "}
        <a href="/contact">Contact page</a>.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        Contact Launcher is not directed to children under 13, and we do not
        knowingly collect personal information from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will revise
        the &ldquo;Last updated&rdquo; date at the top of this page.
      </p>
    </PageShell>
  );
}
