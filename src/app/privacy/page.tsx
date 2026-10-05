import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Wisp has no account and no tracking. Here is every request the app makes.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        Wisp has no account, no analytics and no tracking. What you play, read and copy is handled on your Mac and is
        never sent to us.
      </p>

      <h2>This website</h2>
      <ul>
        <li>No cookies, no analytics, no advertising.</li>
        <li>Our hosting provider keeps standard server logs, such as IP address and pages requested, for security.</li>
      </ul>

      <h2>When you buy</h2>
      <p>
        Checkout is run by Lemon Squeezy, our merchant of record. They collect your name, email, payment details and
        country to process the order and taxes, under their own privacy policy. We receive your name, email and order
        details so we can deliver Wisp and help you. We don&apos;t see your card number.
      </p>

      <h2>Your GitHub username</h2>
      <p>
        You enter your GitHub username before checkout. We pass it to Lemon Squeezy with your order and use it once
        payment goes through, to invite that account to the private repository where Wisp is published. GitHub sends the
        invite email. If you get a refund, the access is removed.
      </p>

      <h2>What stays on your computer</h2>
      <ul>
        <li>Clipboard history, settings and cached prayer timetables are stored only on your Mac.</li>
        <li>Telegram message text is read from your Mac&apos;s notifications to show it in the notch. It isn&apos;t stored or sent anywhere.</li>
        <li>What&apos;s playing in your music apps and browser tabs is read on your Mac to show it in the notch.</li>
      </ul>

      <h2>Every request the app makes</h2>
      <ul>
        <li><b>Updates:</b> every few hours Wisp asks the private GitHub repository whether a new version is out, using the GitHub sign-in you approved in the app, and downloads it when you click the update button.</li>
        <li><b>Prayer times:</b> Wisp downloads the monthly timetable for your city from namozvaqti.uz. Only the city name is part of the request.</li>
        <li><b>Your location (optional):</b> if you choose &quot;current location&quot; for prayer times, macOS gives Wisp an approximate location, accurate to about a kilometre. Wisp calculates the times on your Mac and asks Apple&apos;s geocoder for the place name.</li>
        <li><b>YouTube:</b> when a YouTube video is playing, Wisp loads that video&apos;s thumbnail and preview from YouTube to show it as the cover.</li>
      </ul>

      <h2>Permissions</h2>
      <p>
        Automation, Full Disk Access, Accessibility and Location are all optional. Each unlocks one feature and you can
        turn any of them off in System Settings.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what we hold about you, or ask us to delete it, by emailing us. For payment data, you can also
        contact Lemon Squeezy directly.
      </p>
    </LegalPage>
  );
}
