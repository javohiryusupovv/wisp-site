"use client";

import { useNow } from "./useNow";
import { isLaunch, launchEnds, money, site } from "@/lib/site";

function left(now: number) {
  const ms = Math.max(0, launchEnds.getTime() - now);
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const endDate = launchEnds.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Tashkent" });
const pad = (n: number) => String(n).padStart(2, "0");

/** "$5 $10.90" — current price, with the regular price struck through during launch. */
export function Price({ serverNow }: { serverNow: number }) {
  const now = useNow(serverNow, 30000);
  if (!isLaunch(now)) return <span className="price">{money(site.regularPrice)}</span>;
  return (
    <span className="price">
      {money(site.launchPrice)} <s aria-label={`regular price ${money(site.regularPrice)}`}>{money(site.regularPrice)}</s>
    </span>
  );
}

/** Pill above the headline. Hidden once the launch is over. */
export function LaunchPill({ serverNow }: { serverNow: number }) {
  const now = useNow(serverNow, 30000);
  if (!isLaunch(now)) return null;
  const t = left(now);
  return (
    <a className="launch-pill" href="#pricing">
      <span className="dot" aria-hidden="true" />
      Launch price {money(site.launchPrice)} until {endDate}
      <span className="sep" aria-hidden="true">·</span>
      <span className="mono">{t.d > 0 ? `${t.d}d ${t.h}h left` : `${t.h}h ${t.m}m left`}</span>
    </a>
  );
}

/** Big price block in the pricing card, with a live countdown. */
export function PriceBlock({ serverNow }: { serverNow: number }) {
  const now = useNow(serverNow);
  if (!isLaunch(now)) {
    return (
      <>
        <div className="amount">{money(site.regularPrice)}<small>one-time</small></div>
        <p className="note">No subscription and no account. Every 1.x update is included.</p>
      </>
    );
  }
  const t = left(now);
  return (
    <>
      <p className="launch-tag">Launch price</p>
      <div className="amount">
        {money(site.launchPrice)}
        <small><s>{money(site.regularPrice)}</s> one-time</small>
      </div>
      <p className="note">
        Goes up to {money(site.regularPrice)} on {endDate}. No subscription and no account. Every 1.x update is included.
      </p>
      <div className="countdown" role="timer" aria-label={`${t.d} days ${t.h} hours ${t.m} minutes left at the launch price`}>
        <span><b>{t.d}</b>days</span>
        <span><b>{pad(t.h)}</b>hours</span>
        <span><b>{pad(t.m)}</b>min</span>
        <span><b>{pad(t.s)}</b>sec</span>
      </div>
    </>
  );
}
