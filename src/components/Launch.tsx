"use client";

import { useSyncExternalStore } from "react";
import { money, site } from "@/lib/site";

/** Launch offer state from /api/launch. `remaining: null` = not known yet (server render, or Lemon Squeezy unreachable). */
export type Launch = { active: boolean; total: number; remaining: number | null; endsAt: string };

const ended = (endsAt: string) => Date.now() >= new Date(endsAt).getTime();
const initial: Launch = { active: true, total: site.launchSpots, remaining: null, endsAt: site.launchEndsAt };
// In the browser, a page cached from before the deadline still flips to the regular price right away.
let state: Launch = typeof window !== "undefined" && ended(initial.endsAt) ? { ...initial, active: false } : initial;
let started = false;
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!started) {
    started = true;
    fetch("/api/launch")
      .then((r) => r.json())
      .then((s: Launch) => {
        state = { ...s, active: s.active && !ended(s.endsAt) };
        listeners.forEach((l) => l());
      })
      .catch(() => {});
  }
  return () => {
    listeners.delete(fn);
  };
}

/** Shared across every price on the page; fetched once. */
export const useLaunch = () => useSyncExternalStore(subscribe, () => state, () => initial);

/** "$4.99 $9.99" during the launch, "$9.99" after. */
export function Price() {
  const { active } = useLaunch();
  if (!active) return <span className="price">{money(site.regularPrice)}</span>;
  return (
    <span className="price">
      {money(site.launchPrice)} <s aria-label={`regular price ${money(site.regularPrice)}`}>{money(site.regularPrice)}</s>
    </span>
  );
}

const left = (l: Launch) => (l.remaining === null ? `${l.total} spots` : `${l.remaining} of ${l.total} left`);
const endLabel = (l: Launch) =>
  new Date(l.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Tashkent" });

/** Pill above the headline. Hidden once the spots are gone or the launch ends. */
export function LaunchPill() {
  const l = useLaunch();
  if (!l.active) return null;
  return (
    <a className="launch-pill" href="#pricing">
      <span className="dot" aria-hidden="true" />
      Launch: half price for the first {l.total} buyers, until {endLabel(l)}
      <span className="sep" aria-hidden="true">·</span>
      <span className="mono">{left(l)}</span>
    </a>
  );
}

/** Big price block in the pricing card, with a meter of the launch spots. */
export function PriceBlock() {
  const l = useLaunch();
  if (!l.active) {
    return (
      <>
        <div className="amount">{money(site.regularPrice)}<small>one-time</small></div>
        <p className="note">No subscription and no account. Every 1.x update is included, with a {site.refundDays}-day money-back guarantee.</p>
      </>
    );
  }
  const taken = l.remaining === null ? 0 : l.total - l.remaining;
  return (
    <>
      <p className="launch-tag">Launch · 50% off</p>
      <div className="amount">
        {money(site.launchPrice)}
        <small><s>{money(site.regularPrice)}</s> one-time</small>
      </div>
      <p className="note">
        Half price for the first {l.total} buyers until {endLabel(l)}, then {money(site.regularPrice)}. No subscription and
        no account. Every 1.x update is included, with a {site.refundDays}-day money-back guarantee.
      </p>
      <div className="spots" role="img" aria-label={l.remaining === null ? `${l.total} launch spots` : `${l.remaining} of ${l.total} launch spots left`}>
        <div className="cells" aria-hidden="true">
          {Array.from({ length: l.total }, (_, i) => <i key={i} className={i < taken ? "taken" : ""} />)}
        </div>
        <span className="mono">{left(l)} · ends {endLabel(l)}</span>
      </div>
    </>
  );
}
