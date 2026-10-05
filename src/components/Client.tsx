"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Price } from "./Launch";

/** Menu-bar clock. Renders nothing on the server to avoid a hydration mismatch. */
export function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="clock hide-sm" aria-hidden="true" suppressHydrationWarning>
      {now}
    </span>
  );
}

/** Fades in every `.rv` element as it scrolls into view. Content stays visible without JS. */
export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => {
      // only hide what's below the fold, so nothing flashes on load
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add("rv-armed");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}

/** Floating navbar: wide at the top of the page, springs into a compact pill once you scroll. */
export function FloatBar({ serverNow }: { serverNow: number }) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`floatbar${compact ? " compact" : ""}`} aria-label="Main">
      <a className="brand" href="#top">
        <Image src="/brand/wisp-mark.png" alt="" width={26} height={26} unoptimized />
        Wisp
      </a>
      <div className="links">
        <a href="#specs">Tech Specs</a>
        <a className="buy" href="#pricing">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" /></svg>
          Buy <Price serverNow={serverNow} />
        </a>
      </div>
    </nav>
  );
}
