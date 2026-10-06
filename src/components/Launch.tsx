"use client";

import { useCallback, useSyncExternalStore } from "react";
import { money, site } from "@/lib/site";

const endsAt = new Date(site.launchEndsAt).getTime();
const endLabel = new Date(site.launchEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Tashkent" });
const pad = (n: number) => String(n).padStart(2, "0");

/** Current time in the browser, ticking every `every` ms; `null` on the server and during hydration. */
function useClock(every: number) {
  const subscribe = useCallback(
    (tick: () => void) => {
      const id = window.setInterval(tick, every);
      return () => window.clearInterval(id);
    },
    [every],
  );
  return useSyncExternalStore<number | null>(subscribe, () => Math.floor(Date.now() / every) * every, () => null);
}

/** Is the launch discount still on? Assumed yes until the browser knows the time. */
export function useLaunchActive() {
  const now = useClock(30_000);
  return now === null || now < endsAt;
}

function left(now: number) {
  const s = Math.max(0, Math.floor((endsAt - now) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** "$4.99 $9.99" during the launch, "$9.99" after. */
export function Price() {
  const active = useLaunchActive();
  if (!active) return <span className="price">{money(site.regularPrice)}</span>;
  return (
    <span className="price">
      {money(site.launchPrice)} <s aria-label={`regular price ${money(site.regularPrice)}`}>{money(site.regularPrice)}</s>
    </span>
  );
}

/** Pill above the headline. Hidden once the launch ends. */
export function LaunchPill() {
  const now = useClock(30_000);
  if (now !== null && now >= endsAt) return null;
  const t = now === null ? null : left(now);
  return (
    <a className="launch-pill" href="#pricing">
      <span className="dot" aria-hidden="true" />
      Launch: 50% off until {endLabel}
      {t && (
        <>
          <span className="sep" aria-hidden="true">·</span>
          <span className="mono">{t.d > 0 ? `${t.d}d ${t.h}h left` : `${t.h}h ${t.m}m left`}</span>
        </>
      )}
    </a>
  );
}

/** Big price block in the pricing card, with a live countdown to the end of the launch. */
export function PriceBlock() {
  const now = useClock(1000);
  if (now !== null && now >= endsAt) {
    return (
      <>
        <div className="amount">{money(site.regularPrice)}<small>one-time</small></div>
        <p className="note">No subscription and no account. Every 1.x update is included, with a {site.refundDays}-day money-back guarantee.</p>
      </>
    );
  }
  const t = now === null ? null : left(now);
  const cell = (v: number | undefined, label: string, padded = true) => (
    <span><b>{v === undefined ? "–" : padded ? pad(v) : v}</b>{label}</span>
  );
  return (
    <>
      <p className="launch-tag">Launch · 50% off</p>
      <div className="amount">
        {money(site.launchPrice)}
        <small><s>{money(site.regularPrice)}</s> one-time</small>
      </div>
      <p className="note">
        Half price until {endLabel}, then {money(site.regularPrice)}. No subscription and no account. Every 1.x update is
        included, with a {site.refundDays}-day money-back guarantee.
      </p>
      <div className="countdown" role="timer" aria-label={t ? `${t.d} days ${t.h} hours ${t.m} minutes left at the launch price` : `Launch price until ${endLabel}`}>
        {cell(t?.d, "days", false)}
        {cell(t?.h, "hours")}
        {cell(t?.m, "min")}
        {cell(t?.s, "sec")}
      </div>
    </>
  );
}
