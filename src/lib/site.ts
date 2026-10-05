// Everything you need to edit before launch lives here.
export const site = {
  name: "Wisp",
  // Set NEXT_PUBLIC_SITE_URL in your hosting env (e.g. https://wisp.app). Used for canonical, OG, sitemap.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  title: "Wisp — Dynamic Island for your Mac's notch",
  tagline: "Your notch, finally useful.",
  description:
    "Wisp turns the notch on your MacBook into a live island for music, Telegram messages, timers, clipboard history and quick controls. Native Swift, macOS 14+, pay once.",
  keywords: [
    "Dynamic Island for Mac",
    "MacBook notch app",
    "notch widget",
    "macOS notch",
    "now playing menu bar",
    "Spotify notch",
    "Telegram notifications Mac",
    "clipboard history Mac",
    "macOS volume HUD",
  ],

  // Launch pricing: launchPrice until launchEndsAt (one fixed date for everyone), then regularPrice.
  launchPrice: 5,
  regularPrice: 10.9,
  launchEndsAt: "2026-10-15T23:59:59+05:00", // Tashkent time
  currency: "USD",
  // Lemon Squeezy checkout links ("Share" on each product).
  checkout: {
    mac: "https://wispapp.lemonsqueezy.com/checkout/buy/242c6429-d2b0-486a-8438-c48e5bb31813",
    windows: "https://wispapp.lemonsqueezy.com/checkout/buy/1f3debbd-3a21-4a4e-8404-b1dcdfb407f6",
  },

  version: "1.0.8",

 minMacOS: "14.0",

  // Shown on the Refund and Terms pages. TODO: confirm both before launch.
  refundDays: 14,
  legalUpdated: "2026-10-05",

  // TODO: your X handle (without @)
  xHandle: "",
  email: "yusupovjavoxir11@gmail.com",
} as const;

export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
export const launchEnds = new Date(site.launchEndsAt);
export const isLaunch = (now: number = Date.now()) => now < launchEnds.getTime();
/** Time of this render (build/revalidation on the server). */
export const renderTime = () => Date.now();
