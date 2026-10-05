import { site } from "./site";

// Used both for the FAQ section and the FAQPage structured data.
export const faq: { q: string; a: string }[] = [
  {
    q: "Does it work on a Mac without a notch?",
    a: "Yes. Put Wisp at the top of the screen or on the left or right edge, on any display, including external monitors.",
  },
  {
    q: "How do I get Wisp after paying?",
    a: `Right after payment GitHub emails you an invitation, sent to the address you paid with. Accept it (sign in, or create a free GitHub account) and download the latest release from the private Wisp repository. Updates come from the same place. The invitation is valid for 7 days: if it expires or doesn't arrive, email ${site.email} with your order number and we'll send a new one.`,
  },
  {
    q: "Do I need a GitHub account?",
    a: "Yes, a free one. Wisp is delivered and updated through a private GitHub repository. If you don't have an account, the invitation email lets you create one in a minute.",
  },
  {
    q: "Is there a Windows version?",
    a: "Yes, for Windows 10 and 11. It has now playing, Telegram unread alerts, the file shelf, timer, prayer times, clipboard history, quick controls and a volume indicator, at the top or on either edge of any display. Windows doesn't let apps read notification text, so Telegram shows the unread count instead of the message. The live YouTube cover and Liquid Glass are Mac-only for now.",
  },
  {
    q: "Which macOS versions are supported?",
    a: "macOS 14 Sonoma and later, on Apple Silicon and Intel Macs.",
  },
  {
    q: "Will it slow my Mac down?",
    a: "No. Wisp is a native Swift app that sits idle in the menu bar and only wakes up when something changes.",
  },
  {
    q: "Does it work with WhatsApp or Slack?",
    a: "Not yet. Telegram is supported today. Tell us on X which app you'd like next.",
  },
  {
    q: "How do updates work?",
    a: "Wisp checks for new versions every few hours. When one is out, a green button appears in the notch. Click it and Wisp installs the update and reopens.",
  },
  {
    q: "Is any of my data sent anywhere?",
    a: "No. What you play, read and copy is handled on your Mac and never sent to us. Wisp only goes online to check for updates, fetch prayer times, and load the preview of a YouTube video you're playing. The Privacy page lists every request.",
  },
  {
    q: "Can I get a refund?",
    a: `Yes. Email us within ${site.refundDays} days of buying and you'll get your money back. No reason needed.`,
  },
];
