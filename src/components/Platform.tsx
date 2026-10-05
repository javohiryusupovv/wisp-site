"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowUpIcon } from "./icons";

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
const usePlatform = () => useSyncExternalStore<Platform | null>(noop, detect, () => null);

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

/** Wisp is Mac-only. Visitors on Windows or a phone get told so, with a way to send the page to their Mac. */
export function PlatformNote() {
  const platform = usePlatform();
  const [copied, setCopied] = useState(false);
  if (platform !== "windows" && platform !== "mobile" && platform !== "other") return null;

  const where = platform === "windows" ? "on Windows" : platform === "mobile" ? "on your phone" : "not on a Mac";
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
      You&apos;re {where}. Wisp is a Mac app: you can buy it here and download it on your Mac.
      <button type="button" onClick={copy}>{copied ? "Link copied" : "Copy link"}</button>
    </p>
  );
}
