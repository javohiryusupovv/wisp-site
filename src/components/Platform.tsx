"use client";

import { useState, useSyncExternalStore } from "react";
import { site } from "@/lib/site";
import { AppleIcon, ArrowUpIcon, WindowsIcon } from "./icons";
import { Price } from "./Launch";

type Platform = "mac" | "windows" | "mobile" | "other";

function detect(): Platform {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };
  const p = nav.userAgentData?.platform ?? "";
  const ua = navigator.userAgent;
  if (nav.userAgentData?.mobile || /iPhone|iPad|iPod|Android/i.test(ua)) return "mobile";
  // iPadOS reports itself as a Mac; touch points give it away
  if (/mac/i.test(p) || /Macintosh|Mac OS X/.test(ua)) return navigator.maxTouchPoints > 1 ? "mobile" : "mac";
  if (/win/i.test(p) || /Windows/.test(ua)) return "windows";
  return "other";
}

const noop = () => () => {};
/** null on the server and during hydration, then the real platform. */
export const usePlatform = () => useSyncExternalStore<Platform | null>(noop, detect, () => null);

const hoverable = () => window.matchMedia("(hover: hover)").matches;
const useHoverable = () => useSyncExternalStore(noop, hoverable, () => true);

/** "Hover the notch" on a mouse, "Tap the notch" on touch screens. */
export function NotchHint() {
  const canHover = useHoverable();
  return (
    <p className="hint">
      <ArrowUpIcon />
      {canHover ? "Hover the notch up there" : "Tap the notch up there"}
    </p>
  );
}

/**
 * Two buy buttons, Mac and Windows. The visitor's own platform comes first and gets the primary style;
 * the server render (and phones) lead with Mac.
 */
export function BuyButtons({ serverNow, onDark = false }: { serverNow: number; onDark?: boolean }) {
  const platform = usePlatform();
  const windowsFirst = platform === "windows";
  const mac = (primary: boolean) => (
    <a key="mac" className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} href={site.checkout.mac}>
      <AppleIcon />
      Get Wisp for Mac {primary && <Price serverNow={serverNow} />}
    </a>
  );
  const win = (primary: boolean) => (
    <a key="win" className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} href={site.checkout.windows}>
      <WindowsIcon />
      Get Wisp for Windows {primary && <Price serverNow={serverNow} />}
    </a>
  );
  return (
    <div className={`ctas buy-pair${onDark ? " on-dark" : ""}`}>
      {windowsFirst ? [win(true), mac(false)] : [mac(true), win(false)]}
    </div>
  );
}

/** Small line under the buy buttons for people who already bought. */
export function DownloadLinks() {
  return (
    <p className="dl-link">
      Already bought? Download for <a href={site.downloads.mac}>Mac</a> or <a href={site.downloads.windows}>Windows</a>
    </p>
  );
}

/** Context for visitors who aren't on a Mac: what Windows gets, or how to send the page to a computer. */
export function PlatformNote() {
  const platform = usePlatform();
  const [copied, setCopied] = useState(false);
  if (platform === "windows") {
    return (
      <div className="platform-note win" role="note">
        <p>
          <b>Wisp for Windows 10 and 11</b> has now playing, Telegram unread alerts, the file shelf, timer, prayer
          times, clipboard history, quick controls and a volume indicator, at the top or on either edge of any display.
          Telegram message text, the live YouTube cover and Liquid Glass are Mac-only for now.
        </p>
        <p className="small">
          It&apos;s a single Wisp.exe that installs itself. If Windows says the app is from an unknown publisher, choose
          More info → Run anyway.
        </p>
      </div>
    );
  }
  if (platform !== "mobile" && platform !== "other") return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the link is still visible in the address bar */
    }
  };

  return (
    <p className="platform-note" role="note">
      Wisp runs on Mac and Windows. Open this page on your computer to get it.
      <button type="button" onClick={copy}>{copied ? "Link copied" : "Copy link"}</button>
    </p>
  );
}
