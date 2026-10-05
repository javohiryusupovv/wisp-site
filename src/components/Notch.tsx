"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { hhmm, nextPrayer, nextReminder, prayers, remaining, TASHKENT, today } from "@/lib/prayer";
import * as I from "./sf";
import { useNow } from "./useNow";

export type NotchState = "music" | "telegram" | "prayer" | "timer" | "volume" | "charging" | "open";
export type Tab = "home" | "shelf" | "clipboard" | "timer" | "prayer" | "controls";

export const notchStates: { id: NotchState; label: string }[] = [
  { id: "music", label: "Music" },
  { id: "telegram", label: "Telegram" },
  { id: "prayer", label: "Prayer" },
  { id: "timer", label: "Timer" },
  { id: "volume", label: "Volume" },
  { id: "charging", label: "Charging" },
  { id: "open", label: "Open" },
];

// Colours from the app (MediaSource.swift, PrayerService, TimerService)
export const C = {
  youtube: "#FF0033",
  telegram: "#29ABED",
  prayer: "#40D18C",
  timer: "#FF9E0A",
  charging: "#33D966",
  weekday: "#FF5959",
};

const TRACK = { title: "Night Drive — synthwave mix", artist: "Neon Hours", duration: 72 * 60 + 40, start: 23 * 60 + 12 };
const cycleOrder: NotchState[] = ["music", "telegram", "music", "prayer", "timer", "volume", "charging"];
// the volume HUD is the only state taller than the bar; keep it off the navbar
const overlays: NotchState[] = ["volume"];

/* ───────────── shared demo state ───────────── */

type Ctx = { state: NotchState; pick: (s: NotchState) => void; tab: Tab; setTab: (t: Tab) => void; now: number; start: number };
const NotchCtx = createContext<Ctx | null>(null);
export const useNotch = () => {
  const c = useContext(NotchCtx);
  if (!c) throw new Error("Wrap the page in <NotchProvider>");
  return c;
};

/** Holds the demo state so the notch (top of page) and the controls elsewhere stay in sync. */
export function NotchProvider({ serverNow, children }: { serverNow: number; children: ReactNode }) {
  const [state, setState] = useState<NotchState>("music");
  const [tab, setTab] = useState<Tab>("home");
  const now = useNow(serverNow);
  const step = useRef(0);
  const [restart, setRestart] = useState(0);

  // auto-cycle through states (paused while open, off for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setState((cur) => {
        if (cur === "open") return cur;
        // Once the page is scrolled (compact navbar) or the screen is narrow, skip the tall volume HUD.
        const roomy = window.scrollY < 40 && window.innerWidth >= 1000;
        do step.current = (step.current + 1) % cycleOrder.length;
        while (!roomy && overlays.includes(cycleOrder[step.current]));
        return cycleOrder[step.current];
      });
    }, 3400);
    return () => window.clearInterval(id);
  }, [restart]);

  // scrolling down with the volume HUD showing: tuck it away so it doesn't sit on the compact navbar
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setState((cur) => (overlays.includes(cur) ? "music" : cur));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pick = useCallback((s: NotchState) => {
    setState(s);
    setRestart((n) => n + 1);
  }, []);

  return <NotchCtx.Provider value={{ state, pick, tab, setTab, now, start: serverNow }}>{children}</NotchCtx.Provider>;
}

/* ───────────── small pieces ───────────── */

const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

export function Eq({ color, height = 14 }: { color: string; height?: number }) {
  return (
    <span className="eq" style={{ ["--app" as string]: color, height }} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

/** The "video as cover": a looping synthwave scene standing in for a YouTube frame. */
export function VideoCover({ small }: { small?: boolean }) {
  return (
    <span className={`video${small ? " sm" : ""}`} aria-hidden="true">
      <i className="sun" />
      <i className="grid" />
    </span>
  );
}

function Battery({ level }: { level: number }) {
  return (
    <span className="battery">
      <span className="pct">{level}%</span>
      <span className="cell"><b style={{ width: `${level}%` }} /></span>
    </span>
  );
}

/* ───────────── open tabs ───────────── */

function HomeTab({ pos }: { pos: number }) {
  const { now } = useNotch();
  const d = new Date(now);
  return (
    <div className="home">
      <div className="player">
        <div className="art">
          <VideoCover />
          <span className="badge"><I.YouTubeLogo height={18} /></span>
        </div>
        <div className="info">
          <div className="top">
            <div className="txt">
              <div className="chip" style={{ color: C.youtube }}>YOUTUBE</div>
              <div className="t">{TRACK.title}</div>
              <div className="a">{TRACK.artist}</div>
            </div>
            <Eq color={C.youtube} height={16} />
          </div>
          <div className="prog">
            <span className="track"><b style={{ width: `${(pos / TRACK.duration) * 100}%` }} /></span>
            <span className="times"><span>{fmt(pos)}</span><span>-{fmt(TRACK.duration - pos)}</span></span>
          </div>
          <div className="ctl">
            <span className="btns"><I.Back size={16} /><I.Pause size={22} /><I.Fwd size={16} /></span>
            <I.Speaker size={13} />
          </div>
        </div>
      </div>
      <span className="divider" />
      <div className="cal">
        <div className="date">
          <span className="wd" style={{ color: C.weekday }}>{d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}</span>
          <span className="dd">{d.getDate()}</span>
          <span className="mm">{d.toLocaleDateString("en-US", { month: "short" })}</span>
        </div>
        <div className="tgcard">
          <I.TelegramLogo size={22} />
          <span className="tx"><b>Telegram</b><span style={{ color: C.telegram }}>1 unread</span></span>
          <span className="count">1</span>
        </div>
      </div>
    </div>
  );
}

export function ClipboardTab() {
  const rows = [
    { kind: "text", title: "git push origin main", app: "Terminal", when: "now" },
    { kind: "link", title: "https://x.com/wisp/status/1843…", app: "Safari", when: "2 min" },
    { kind: "color", title: "#8B5CF6", app: "Figma", when: "6 min" },
    { kind: "image", title: "Screenshot 2026-10-05 at 10.42", app: "Screenshot", when: "14 min" },
  ];
  return (
    <div className="clipboard">
      <div className="head"><b>Clipboard</b><span className="n">{rows.length}</span><span className="sp" /><span className="clear">Clear</span></div>
      <div className="rows">
        {rows.map((r) => (
          <div key={r.title} className="row">
            <span className={`pv ${r.kind}`}>{r.kind === "text" ? "Aa" : r.kind === "link" ? "↗" : ""}</span>
            <span className="tx"><span className="ti">{r.title}</span><span className="me">{r.app} · {r.when}</span></span>
            <span className="cp"><I.Copy size={11} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimerTab({ left }: { left: number }) {
  const total = 25 * 60;
  const p = left / total;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="timer">
      <div className="ring">
        <svg viewBox="0 0 118 118">
          <circle cx="59" cy="59" r={r} stroke="rgba(255,255,255,.1)" strokeWidth="7" fill="none" />
          <circle cx="59" cy="59" r={r} stroke={C.timer} strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90 59 59)" />
        </svg>
        <span className="val"><b>{fmt(left)}</b><small>Running</small></span>
      </div>
      <div className="side">
        <div className="presets">
          {["1 min", "3 min", "5 min", "10 min", "15 min", "25 min", "30 min", "1 hour"].map((t) => (
            <span key={t} className={t === "25 min" ? "on" : ""}>{t}</span>
          ))}
        </div>
        <div className="round">
          <span><I.Minus size={11} /></span>
          <span className="main"><I.Pause size={15} /></span>
          <span><I.Reset size={11} /></span>
          <span><I.Plus size={11} /></span>
        </div>
      </div>
    </div>
  );
}

/** Replica of the app's Prayer tab: today's six times for the city, next one highlighted. */
export function PrayerTab({ now }: { now: number }) {
  const t = today(now);
  const next = nextPrayer(now);
  const d = new Date(now + TASHKENT.tz * 3600_000);
  const greg = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
  let hijri = "";
  try {
    hijri = new Intl.DateTimeFormat("en-u-ca-islamic-tbla", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      .format(d).replace(/\s?AH$/, "");
  } catch { /* calendar not supported: skip */ }
  const current = [...prayers].reverse().find((p) => t[p.id] <= now)?.id;
  return (
    <div className="prayer-tab">
      <div className="head">
        <I.Location size={10} />
        <b>{TASHKENT.name}</b>
        <span className="dim">· {greg}{hijri && ` · ${hijri}`}</span>
        <span className="sp" />
        <span className="dim">{next.title} in</span>
        <b style={{ color: C.prayer }}>{remaining(next.time, now)}</b>
      </div>
      <div className="cards">
        {prayers.map((p) => {
          const Icon = I.prayerIcon[p.id];
          const isNext = next.id === p.id && next.time === t[p.id];
          const isPast = t[p.id] <= now && current !== p.id;
          return (
            <div key={p.id} className={`pc${isNext ? " next" : ""}${current === p.id ? " cur" : ""}${isPast ? " past" : ""}`}>
              <Icon size={14} />
              <span className="n">{p.title}</span>
              <b>{hhmm(t[p.id])}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ControlsTab() {
  const tiles = [
    { icon: I.Moon, label: "Dark", on: "#5E5CE6" },
    { icon: I.Cup, label: "Awake", on: "" },
    { icon: I.Mic, label: "Mic", on: "" },
    { icon: I.Camera, label: "Screenshot", on: "" },
    { icon: I.Lock, label: "Lock", on: "" },
    { icon: I.Gear, label: "Settings", on: "" },
  ];
  return (
    <div className="controls">
      <div className="sliders">
        <span className="qs"><b style={{ width: "64%" }} /><I.Speaker size={14} /></span>
        <span className="qs"><b style={{ width: "78%" }} /><I.SunMax size={14} /></span>
      </div>
      <div className="tiles">
        {tiles.map(({ icon: Icon, label, on }) => (
          <span key={label} className={on ? "tile on" : "tile"} style={on ? { background: on } : undefined}>
            <Icon size={16} /><small>{label}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

function ShelfTab() {
  return (
    <div className="soon"><I.Tray size={26} /><b>File shelf</b><span>Coming soon</span></div>
  );
}

const tabs: { id: Tab; icon: (p: { size?: number }) => ReactNode; label: string }[] = [
  { id: "home", icon: I.House, label: "Home" },
  { id: "shelf", icon: I.Tray, label: "File shelf" },
  { id: "clipboard", icon: I.Clip, label: "Clipboard" },
  { id: "timer", icon: I.Timer, label: "Timer" },
  { id: "prayer", icon: I.MoonStars, label: "Prayer times" },
  { id: "controls", icon: I.Sliders, label: "Quick controls" },
];

/* ───────────── bubbles (Liquid Glass; shown in the feature cards) ───────────── */

export function TelegramBubble() {
  return (
    <div className="bub-in">
      <span className="logo-glow" style={{ ["--g" as string]: C.telegram }}><I.TelegramLogo size={40} /></span>
      <div className="bt">
        <div className="l1"><b>John</b><span className="when">now</span></div>
        <div className="l2">are we still shipping tonight? 🚀</div>
      </div>
    </div>
  );
}

export function PrayerBubble({ now }: { now: number }) {
  const n = nextReminder(now);
  const Icon = I.prayerIcon[n.id];
  return (
    <div className="bub-in">
      <span className="pray-ico"><Icon size={18} /></span>
      <div className="bt">
        <div className="l1"><b>{n.title} prayer</b><span className="mono" style={{ color: C.prayer }}>{hhmm(n.time)}</span></div>
        <div className="l2">20 minutes left</div>
      </div>
    </div>
  );
}

/* ───────────── the notch ───────────── */

function sizeOf(s: NotchState, vw: number): { w: number; h: number; tr: number; br: number } {
  const live = vw < 640 ? 230 : 292;
  switch (s) {
    case "volume": return { w: Math.min(340, vw - 24), h: 62, tr: 6, br: 18 };
    case "open": return { w: 620, h: 196, tr: 14, br: 26 };
    default: return { w: live, h: 32, tr: 6, br: 16 };
  }
}

const accentOf: Partial<Record<NotchState, string>> = {
  music: C.youtube, open: C.youtube, telegram: C.telegram, prayer: C.prayer, charging: C.charging,
};

const noop = () => () => {};

export function Notch() {
  const { state, tab, setTab, now, start } = useNotch();
  // open-panel content uses the visitor's clock and locale, so it renders only in the browser
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [hovering, setHovering] = useState(false);
  const [vw, setVw] = useState(1280);
  const [vol, setVol] = useState(62);
  const root = useRef<HTMLDivElement>(null);

  const shown: NotchState = hovering ? "open" : state;
  const { w, h, tr, br } = sizeOf(shown, vw);
  const scale = shown === "open" ? Math.min(1, (vw - 16) / 620) : 1;
  const elapsed = Math.floor((now - start) / 1000);
  const pos = (TRACK.start + elapsed) % TRACK.duration;
  const timerLeft = (24 * 60 + 59 - (elapsed % (25 * 60)) + 25 * 60) % (25 * 60);
  const accent = accentOf[shown];

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (state !== "volume") return;
    const id = window.setInterval(() => setVol(Math.round(45 + Math.random() * 45)), 700);
    return () => window.clearInterval(id);
  }, [state]);

  const layer = (id: NotchState) => `layer${shown === id ? " on" : ""}`;

  return (
    <div className="notch-anchor">
      <div className="notch-scale" style={{ transform: `scale(${scale})` }}>
        <div
          ref={root}
          className={`notch${shown === "open" ? " is-open" : ""}${h > 40 ? " is-big" : ""}`}
          style={{
            ["--w" as string]: `${w}px`, ["--h" as string]: `${h}px`,
            ["--tr" as string]: `${tr}px`, ["--br" as string]: `${br}px`,
            ["--accent" as string]: accent ?? "transparent",
          }}
          tabIndex={0}
          role="region"
          aria-label="Live demo of Wisp in the notch. Hover or focus to open it."
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setHovering(false); }}
        >
          <span className="glass" aria-hidden="true" />
          <span className="lens" aria-hidden="true" />
          <span className={`accent-fx${accent ? " on" : ""}`} aria-hidden="true" />

          {/* closed: music */}
          <div className={layer("music")}>
            <div className="ears">
              <span className="mini-art"><VideoCover small /><span className="yt"><I.YouTubeLogo height={8} /></span></span>
              <Eq color={C.youtube} height={18} />
            </div>
          </div>

          {/* closed: telegram */}
          <div className={layer("telegram")}>
            <div className="ears"><I.TelegramLogo size={20} /><span className="tg-count">1</span></div>
          </div>

          {/* closed: prayer reminder */}
          <div className={layer("prayer")}>
            <div className="ears">
              <span className="pray-dot">{(() => { const Icon = I.prayerIcon[nextReminder(now).id]; return <Icon size={11} />; })()}</span>
              <span className="val" style={{ color: C.prayer }}>20 min</span>
            </div>
          </div>

          {/* closed: timer */}
          <div className={layer("timer")}>
            <div className="ears">
              <span style={{ color: C.timer, display: "flex" }}><I.Timer size={17} /></span>
              <span className="val" style={{ color: C.timer }}>{fmt(timerLeft)}</span>
            </div>
          </div>

          {/* closed: volume HUD */}
          <div className={layer("volume")}>
            <div className="hud">
              <I.Speaker size={14} />
              <span className="bar"><b style={{ width: `${vol}%` }} /></span>
              <span className="n">{vol}</span>
            </div>
          </div>

          {/* closed: charging */}
          <div className={layer("charging")}>
            <div className="ears">
              <span className="bolt-dot"><I.Bolt size={11} /></span>
              <span className="val" style={{ color: C.charging }}>82%</span>
            </div>
          </div>

          {/* open */}
          <div className={`${layer("open")} open-ui`}>
            <div className="hdr">
              <div className="tabs" role="tablist" aria-label="Wisp tabs">
                {tabs.map(({ id, icon: Icon, label }) => (
                  <button key={id} type="button" role="tab" aria-selected={tab === id} aria-label={label}
                    className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
                    <Icon size={13} />
                  </button>
                ))}
              </div>
              <span className="cam" />
              <div className="right"><Battery level={71} /><span className="gear"><I.Gear size={13} /></span></div>
            </div>
            <div className="body">
              {!mounted ? null : <>
              {tab === "home" && <HomeTab pos={pos} />}
              {tab === "shelf" && <ShelfTab />}
              {tab === "clipboard" && <ClipboardTab />}
              {tab === "timer" && <TimerTab left={timerLeft} />}
              {tab === "prayer" && <PrayerTab now={now} />}
              {tab === "controls" && <ControlsTab />}
              </>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/** Buttons in the hero that switch what the notch shows. */
export function NotchSwitch() {
  const { state, pick } = useNotch();
  return (
    <>
      <div className="switch" role="group" aria-label="Show a Wisp state in the notch">
        {notchStates.map((s) => (
          <button key={s.id} type="button" aria-pressed={state === s.id} onClick={() => pick(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="switch-cap">Pick one to see it in the notch</p>
    </>
  );
}

/** Live prayer replica for the Prayer section, plus a button that fires the reminder in the real notch above. */
export function PrayerShowcase() {
  const { now, pick } = useNotch();
  const n = nextReminder(now);
  return (
    <div className="pray-show">
      <div className="pray-panel">
        <PrayerTab now={now} />
      </div>
      <div className="pray-bubble-demo">
        <div className="bubble static" style={{ ["--tint" as string]: C.prayer }}><PrayerBubble now={now} /></div>
        <p className="cap">Pops up 30 and 20 minutes before {n.title} ({hhmm(n.time)}), with a soft sound.</p>
        <button type="button" className="btn btn-ghost" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); requestAnimationFrame(() => pick("prayer")); }}>
          Show it in the notch
        </button>
      </div>
    </div>
  );
}

/** Card link that opens the notch above on a given tab. */
export function OpenTab({ tab, children }: { tab: Tab; children: ReactNode }) {
  const { pick, setTab } = useNotch();
  return (
    <button type="button" className="open-tab" onClick={() => { setTab(tab); pick("open"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      {children} <span aria-hidden="true">↑</span>
    </button>
  );
}

/** Timer panel for the feature card, counting down with the page clock. */
export function LiveTimer() {
  const { now, start } = useNotch();
  const elapsed = Math.floor((now - start) / 1000);
  return <TimerTab left={(24 * 60 + 59 - (elapsed % (25 * 60)) + 25 * 60) % (25 * 60)} />;
}
