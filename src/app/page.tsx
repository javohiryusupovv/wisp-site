import Image from "next/image";
import Link from "next/link";
import { Clock, FloatBar, Reveal } from "@/components/Client";
import { LaunchPill, Price, PriceBlock } from "@/components/Launch";
import { ClipboardTab, ControlsTab, LiveTimer, ShelfTab, Notch, NotchProvider, NotchSwitch, OpenTab, PrayerShowcase, TelegramBubble, VideoCover } from "@/components/Notch";
import { SunMax, TelegramLogo, YouTubeLogo } from "@/components/sf";
import { MonitorDemo } from "@/components/Monitor";
import { MacDownloadLink, NotchHint, PlatformCTA, PlatformNote } from "@/components/Platform";
import { AppleIcon, BoltIcon, CheckIcon, Eq } from "@/components/icons";
import { faq } from "@/lib/faq";
import { isLaunch, launchEnds, money, renderTime, site } from "@/lib/site";

// Re-render hourly so the HTML (and structured data) picks up the price change after launch week.
export const revalidate = 3600;

// Colours as in MediaSource.swift
const sources = [
  { name: "Spotify", color: "#1FD661" },
  { name: "Apple Music", color: "#FA2E4D" },
  { name: "YouTube", color: "#FF0033" },
  { name: "YouTube Music", color: "#FF1414" },
  { name: "Yandex Music", color: "#FFFF00" },
  { name: "any browser tab or app that plays", color: "#fff" },
];

const prayerFacts = [
  { t: "Official times in Uzbekistan", d: "Near any of 15 cities, Wisp uses the Muslim Board of Uzbekistan's monthly table from namozvaqti.uz and saves it on your Mac." },
  { t: "Anywhere else, from your location", d: "Elsewhere it calculates the times for where you are: Fajr 15.5°, Isha 15°, Hanafi Asr. Or pick a city yourself." },
  { t: "Works offline", d: "No internet? The same calculation runs on your Mac, usually within 0–2 minutes of the official table." },
  { t: "Reminders at 30 and 20 minutes", d: "A green bubble drops out of the notch with a soft sound, over whatever you're working in. Click it to jump to the Prayer tab." },
  { t: "Countdown and Hijri date", d: "The Prayer tab shows all six times, the time left until the next one, and today's Hijri date." },
  { t: "Yours to switch off", d: "Turn reminders off or change the location in Settings." },
];

const screenModes = [
  { t: "Automatic", d: "Plug in a monitor and Wisp moves there. Unplug it and Wisp is back on your MacBook." },
  { t: "Built-in or main display", d: "Keep Wisp on the MacBook screen, or on the display with the menu bar." },
  { t: "Follows your mouse", d: "Wisp shows up on whichever screen your pointer is on." },
  { t: "A specific monitor", d: "Pin it to one display. Size and position are adjustable in Settings." },
];

const specs = [
  { k: "Price", v: `${money(site.launchPrice)} until ${launchEnds.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "Asia/Tashkent" })}, then ${money(site.regularPrice)}. Pay once, every 1.x update included.` },
  { k: "Requirements", v: "macOS 14 Sonoma or later" },
  { k: "Windows", v: "Windows 10 (2004 or later) and 11, x64. Now playing, timer, prayer times, clipboard history, volume, brightness and battery. Telegram, file shelf and Liquid Glass are Mac-only for now." },
  { k: "Processor", v: "Apple Silicon and Intel (universal app)" },
  { k: "Download", v: "Mac: 3.7 MB disk image, signed. Windows: 63 MB zip with a single Wisp.exe" },
  { k: "Displays", v: "MacBook notch and any external monitor. At the top, or on the left or right edge." },
  { k: "Music", v: "Spotify, Apple Music, YouTube, YouTube Music and Yandex Music in Safari, Chrome-based and Firefox-based browsers, plus any app that reports what's playing" },
  { k: "Messages", v: "Telegram: sender and text in the notch, unread count" },
  { k: "Prayer times", v: "Official Uzbekistan table near 15 cities, calculated from your location anywhere else. Reminders 30 and 20 minutes before." },
  { k: "Tools", v: "File shelf, timer, clipboard history (60 items, text and images), quick controls, volume and brightness indicator, charging indicator" },
  { k: "Updates", v: "In the app, one click. Each download's signature is checked before install." },
  { k: "Permissions", v: "Automation, Full Disk Access, Accessibility. All optional, each unlocks one feature." },
  { k: "Account", v: "None. Everything runs on your Mac." },
  { k: "Built with", v: "Swift and SwiftUI" },
];

const permissions = [
  { name: "Automation", why: "Reads what's playing in Spotify, Music and browser tabs" },
  { name: "Full Disk Access", why: "Reads Telegram message text from your Mac's notifications" },
  { name: "Accessibility", why: "Catches the volume and brightness keys to show them in the notch" },
];

const included = [
  "Music from apps and browser tabs",
  "Telegram messages in the notch",
  "Prayer times with reminders",
  "File shelf, timer, clipboard history, quick controls",
  "Volume, brightness and charging indicators",
  "Works on any display, with or without a notch",
  "In-app updates",
];

function JsonLd({ now }: { now: number }) {
  const launch = isLaunch(now);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: site.name,
        description: site.description,
        url: site.url,
        image: `${site.url}/opengraph-image.png`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: `macOS ${site.minMacOS} or later`,
        softwareVersion: site.version,
        offers: {
          "@type": "Offer",
          price: launch ? site.launchPrice : site.regularPrice,
          priceCurrency: site.currency,
          url: `${site.url}/#pricing`,
          availability: "https://schema.org/InStock",
          ...(launch && { priceValidUntil: launchEnds.toISOString().slice(0, 10) }),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function Home() {
  const now = renderTime();
  const buy = site.checkoutUrl;

  return (
    <NotchProvider serverNow={now}>
      <JsonLd now={now} />
      <Reveal />

      {/* macOS-style menu bar; the live notch hangs in the middle of it */}
      <header className="menubar">
        <div className="side">
          <a className="brand" href="#top">
            <Image src="/brand/wisp-mark.png" alt="" width={22} height={22} priority unoptimized />
            Wisp
          </a>
          <a className="item hide-sm" href="#features">Features</a>
          <a className="item hide-sm" href="#prayer">Prayer times</a>
          <a className="item hide-sm" href="#privacy">Privacy</a>
          <a className="item hide-sm" href="#faq">FAQ</a>
        </div>
        <div className="side">
          <Clock />
          <a className="buy-mini" href="#pricing">Get Wisp</a>
        </div>
      </header>

      {/* floating site navbar, detached from the top edge */}
      <FloatBar serverNow={now} />

      <Notch />

      <main id="top">
        {/* ───────────── Hero ───────────── */}
        <section className="hero">
          <div className="wrap">
            <LaunchPill serverNow={now} />
            <h1>Your <span className="cut">notch</span>, finally useful.</h1>
            <p className="lede">
              Wisp turns the black cutout on your MacBook into a live island for what&apos;s playing, who&apos;s
              messaging, and what&apos;s ticking. It stays out of the way until you need it.
            </p>
            <div className="ctas">
              <PlatformCTA
                mac={
                  <a className="btn btn-primary" href={buy}>
                    <AppleIcon />
                    Get Wisp for Mac <Price serverNow={now} />
                  </a>
                }
              />
              <a className="btn btn-ghost" href="#features">See what it does</a>
            </div>
            <MacDownloadLink />
            <p className="meta">macOS 14+ · Apple Silicon &amp; Intel · Works on Macs without a notch · Also on Windows</p>
            <PlatformNote />
            <NotchHint />
            <NotchSwitch />
          </div>
        </section>

        {/* ───────────── Music ───────────── */}
        <section className="block" id="features" aria-labelledby="music-h">
          <div className="wrap">
            <p className="eyebrow rv">Now playing</p>
            <h2 id="music-h" className="rv">Whatever&apos;s playing, wherever it&apos;s playing.</h2>
            <p className="sub rv">
              Native apps and browser tabs show up the same way. You get artwork, progress and controls, and each app
              keeps its own colour. With YouTube, the cover is the video itself.
            </p>
            <ul className="sources rv" aria-label="Supported players">
              {sources.map((s) => (
                <li key={s.name} className="src"><Eq color={s.color} bars={3} />{s.name}</li>
              ))}
            </ul>

            {/* ───────────── Bento ───────────── */}
            <div className="bento">
              <article className="card wide rv">
                <div className="stage stack" aria-hidden="true">
                  <div className="mini" style={{ width: 230 }}><div className="ears"><TelegramLogo size={18} /><span className="tg-count">1</span></div></div>
                  <div className="bubble static" style={{ ["--tint" as string]: "#29ABED", width: "min(370px, 92%)" }}><TelegramBubble /></div>
                </div>
                <div><h3>Telegram, without the banner</h3><p>A new message drops out from behind the notch as a Liquid Glass bubble with the sender and the text. Click it to open Telegram. You can turn off Telegram&apos;s own banner and sound.</p></div>
              </article>

              <article className="card wide rv">
                <div className="stage" aria-hidden="true">
                  <div className="mini" style={{ width: "min(320px, 88%)", height: 58, borderRadius: "0 0 18px 18px" }}>
                    <div className="hud" style={{ paddingTop: 30 }}><SunMax size={14} /><span className="bar"><b style={{ width: "74%" }} /></span><span className="n">74</span></div>
                  </div>
                </div>
                <div><h3>Volume and brightness, in the notch</h3><p>The big grey square in the middle of the screen is gone. Press the volume or brightness keys and the level shows up in the notch instead.</p></div>
              </article>

              <article className="card rv">
                <div className="stage" aria-hidden="true">
                  <div className="card-panel"><LiveTimer /></div>
                </div>
                <div><h3>Timer</h3><p>Presets from 1 minute to an hour. It counts down in the notch and rings when it&apos;s done.</p><OpenTab tab="timer">Open the timer</OpenTab></div>
              </article>

              <article className="card rv">
                <div className="stage" aria-hidden="true">
                  <div className="card-panel"><ClipboardTab /></div>
                </div>
                <div><h3>Clipboard history</h3><p>The last 60 things you copied, text and images, with the app they came from. Click one to copy it again.</p><OpenTab tab="clipboard">Open clipboard</OpenTab></div>
              </article>

              <article className="card rv">
                <div className="stage" aria-hidden="true">
                  <div className="card-panel"><ControlsTab /></div>
                </div>
                <div><h3>Quick controls</h3><p>Volume and brightness sliders, dark mode, keep awake, mic mute, screenshot and lock.</p><OpenTab tab="controls">Open controls</OpenTab></div>
              </article>

              <article className="card wide rv">
                <div className="stage" aria-hidden="true">
                  <div className="card-panel"><ShelfTab /></div>
                </div>
                <div><h3>File shelf</h3><p>Drag a file onto the notch to park it there, then drag it out into any app later. The file itself stays where it is.</p><OpenTab tab="shelf">Open the shelf</OpenTab></div>
              </article>

              <article className="card wide rv">
                <div className="stage" style={{ alignItems: "flex-start" }} aria-hidden="true">
                  <div className="mini" style={{ width: 260 }}><div className="ears"><span className="mini-art"><VideoCover small /><span className="yt"><YouTubeLogo height={8} /></span></span><span className="update-pill">↓ 1.0.4</span></div></div>
                </div>
                <div><h3>Updates in one click</h3><p>When a new version is out, a green button appears in the notch. Click it and Wisp downloads the update, checks its signature, installs it and reopens.</p></div>
              </article>

              <article className="card rv">
                <div className="stage" style={{ alignItems: "flex-start" }} aria-hidden="true">
                  <div className="mini" style={{ width: 220 }}><div className="ears"><span className="bolt-dot"><BoltIcon style={{ width: 11, height: 11, fill: "#000" }} /></span><span className="val" style={{ color: "#33D966" }}>82%</span></div></div>
                </div>
                <div><h3>Charging</h3><p>Plug in and the notch shows the battery level for a moment.</p></div>
              </article>

              <article className="card rv">
                <div className="stage" style={{ alignItems: "center" }} aria-hidden="true">
                  <div className="cal-demo"><span className="wd">MON</span><span className="dd">5</span><span className="mm">Oct</span></div>
                </div>
                <div><h3>Date and unread count</h3><p>Next to the player: today&apos;s date and how many Telegram messages you haven&apos;t read.</p><OpenTab tab="home">Open home</OpenTab></div>
              </article>

              <article className="card rv">
                <div className="stage" style={{ alignItems: "center" }} aria-hidden="true">
                  <span className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-.04em" }}>Swift</span>
                </div>
                <div><h3>Native and light</h3><p>Built in Swift and SwiftUI. No Electron, no web view, no account to sign up for.</p></div>
              </article>
            </div>
          </div>
        </section>

        {/* ───────────── External monitors ───────────── */}
        <section className="block" id="monitors" aria-labelledby="monitors-h">
          <div className="wrap">
            <p className="eyebrow rv">External monitors</p>
            <h2 id="monitors-h" className="rv">No notch? Wisp brings its own.</h2>
            <p className="sub rv">
              On a display without a notch, Wisp draws one at the top, with the song title scrolling through the middle,
              or sits as a capsule on the left or right edge. Pick a spot below and hover the island.
            </p>
            <div className="rv"><MonitorDemo /></div>
            <ul className="screen-modes rv">
              {screenModes.map((m) => (
                <li key={m.t}><b>{m.t}</b><span>{m.d}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────── Prayer times ───────────── */}
        <section className="block" id="prayer" aria-labelledby="prayer-h">
          <div className="wrap">
            <p className="eyebrow rv">Prayer times</p>
            <h2 id="prayer-h" className="rv">Never miss a prayer in the middle of work.</h2>
            <p className="sub rv">
              Wisp keeps today&apos;s prayer times one hover away and reminds you before each one, right where you&apos;re
              already looking. The times below are live for Tashkent.
            </p>
            <div className="rv"><PrayerShowcase /></div>
            <ul className="facts rv">
              {prayerFacts.map((f) => (
                <li key={f.t}><b>{f.t}</b><span>{f.d}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────── Privacy ───────────── */}
        <section className="block" id="privacy" aria-labelledby="privacy-h">
          <div className="wrap">
            <p className="eyebrow rv">Permissions</p>
            <h2 id="privacy-h" className="rv">Asks for little. Everything stays on your Mac.</h2>
            <p className="sub rv">Every permission is optional and unlocks one feature. Skip one and that feature stays off. Nothing you play, read or copy leaves your Mac.</p>
            <div className="perm rv">
              {permissions.map((p) => (
                <div key={p.name} className="perm-row"><b>{p.name}</b><span>{p.why}</span><em>optional</em></div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Tech specs ───────────── */}
        <section className="block" id="specs" aria-labelledby="specs-h">
          <div className="wrap">
            <p className="eyebrow rv">Tech Specs</p>
            <h2 id="specs-h" className="rv">Wisp {site.version}</h2>
            <dl className="specs rv">
              {specs.map((r) => (
                <div key={r.k} className="spec"><dt>{r.k}</dt><dd>{r.v}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        {/* ───────────── Pricing ───────────── */}
        <section className="block" id="pricing" aria-labelledby="pricing-h">
          <div className="wrap">
            <p className="eyebrow rv">Pricing</p>
            <h2 id="pricing-h" className="rv">Pay once. Keep it.</h2>
            <div className="price-card rv">
              <div className="glow" />
              <div className="l" style={{ position: "relative" }}>
                <PriceBlock serverNow={now} />
                <a className="btn btn-primary" href={buy}>Get Wisp for Mac</a>
              </div>
              <div className="r" style={{ position: "relative" }}>
                <ul className="incl">
                  {included.map((i) => <li key={i}><CheckIcon />{i}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── FAQ ───────────── */}
        <section className="block" id="faq" aria-labelledby="faq-h">
          <div className="wrap">
            <p className="eyebrow rv">FAQ</p>
            <h2 id="faq-h" className="rv">Questions</h2>
            <div className="faq rv">
              {[faq.slice(0, Math.ceil(faq.length / 2)), faq.slice(Math.ceil(faq.length / 2))].map((col, i) => (
                <div key={i}>
                  {col.map((f) => (
                    <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="finale rv">
            <Image className="logo" src="/brand/wisp-logo.png" alt="Wisp logo" width={1683} height={725} />
            <h2>Give your notch something to do.</h2>
            <div className="ctas">
              <PlatformCTA mac={<a className="btn btn-primary" href={buy}>Get Wisp for Mac <Price serverNow={now} /></a>} />
            </div>
          </div>
          <div className="foot">
            <span>© 2026 Wisp · Made in Uzbekistan</span>
            <span>
              {site.xHandle && <><a href={`https://x.com/${site.xHandle}`}>Follow on X</a> · </>}
              <Link href="/refund">Refund</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> ·{" "}
              <a href={`mailto:${site.email}`}>Email</a>
            </span>
          </div>
        </div>
      </footer>
    </NotchProvider>
  );
}
