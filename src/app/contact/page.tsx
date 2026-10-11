import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to get in touch with the team behind Contact Launcher.",
  alternates: { canonical: "/contact" },
};

const UPDATED = "2026-10-10";

export default function ContactPage() {
  return (
    <PageShell
      title="Contact Us"
      updated={UPDATED}
      intro="Questions, feedback, bug reports, or privacy requests are welcome."
    >
      <p>
        The fastest way to reach us is by email. Replace the placeholder below
        with the address you want to publish before going live, or set the{" "}
        <code>NEXT_PUBLIC_CONTACT_EMAIL</code> environment variable and update
        this page to read it.
      </p>

      <div className="not-prose my-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-200">
        <strong>Owner action needed:</strong> This page currently contains a
        placeholder contact address. Update it with a real, monitored email
        before requesting AdSense review.
      </div>

      <h2>Email</h2>
      <p>
        <a href="mailto:elmasbusinessgroup@gmail.com">elmasbusinessgroup@gmail.com</a>
      </p>

      <h2>What to include</h2>
      <ul>
        <li>For bugs: your device, browser, and the steps you took.</li>
        <li>For privacy requests: the details described in our Privacy Policy.</li>
        <li>
          Please do <strong>not</strong> send anyone&rsquo;s personal phone
          number unless necessary and you have permission to share it.
        </li>
      </ul>
    </PageShell>
  );
}
