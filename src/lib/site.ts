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

  // Launch: half price for everyone until `launchEndsAt`, via the Lemon Squeezy discount `discountCode`
  // (which expires at the same moment). After that the site shows the regular price.
  regularPrice: 9.99,
  launchPrice: 4.99, // what Lemon Squeezy charges with the code: $9.99 − 50% = $4.99
  discountCode: "LAUNCH",
  launchEndsAt: "2026-10-15T23:59:00+05:00", // Tashkent (= 18:59 UTC, the discount's expiry)
  currency: "USD",
  // Lemon Squeezy checkout links ("Share" on each product).
  checkout: {
    mac: "https://wispapp.lemonsqueezy.com/checkout/buy/521b3d64-4c6d-4493-98be-ec1ed83fe641",
    windows: "https://wispapp.lemonsqueezy.com/checkout/buy/d204020c-e052-4a56-85a6-af7324fc4375",
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
/** Time of this render (build/revalidation on the server). */
export const renderTime = () => Date.now();

/** Checkout link, with the launch code attached until the launch ends. */
export const checkoutUrl = (product: "mac" | "windows", launch: boolean) =>
  launch ? `${site.checkout[product]}?checkout[discount_code]=${site.discountCode}` : site.checkout[product];
