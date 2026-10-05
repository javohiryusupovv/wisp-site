"use client";

import { useState } from "react";
import { C, Eq, useNotch, VideoCover } from "./Notch";
import * as I from "./sf";

type Placement = "left" | "top" | "right";

const placements: { id: Placement; label: string }[] = [
  { id: "left", label: "Left edge" },
  { id: "top", label: "Top" },
  { id: "right", label: "Right edge" },
];

const TITLE = "Night Drive — synthwave mix — Neon Hours";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** An external display with no notch: Wisp draws its own island, at the top or on either edge. */
export function MonitorDemo() {
  const { now, start } = useNotch();
  const [placement, setPlacement] = useState<Placement>("top");
  const [open, setOpen] = useState(false);
  const pos = (23 * 60 + 12 + Math.floor((now - start) / 1000)) % (72 * 60);
  const date = new Date(now);
  const clock = `${date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}  ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div className="monitor-demo">
      <div className="monitor">
        <div className="mon-screen">
          <div className="mon-menubar" aria-hidden="true">
            <span className="l">
              <svg width="11" height="13" viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" /></svg>
              <b>Finder</b><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span>
            </span>
            <span className="r" suppressHydrationWarning>{clock}</span>
          </div>

          <div
            key={placement}
            className={`island ${placement}${open ? " open" : ""}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onClick={() => setOpen((o) => !o)}
            role="img"
            aria-label={`Wisp on an external monitor, placed ${placement === "top" ? "at the top" : `on the ${placement} edge`}`}
          >
            <span className="glass" />
            <div className="closed">
              <span className="mini-art"><VideoCover small /><span className="yt"><I.YouTubeLogo height={7} /></span></span>
              {/* no camera on this screen, so the title scrolls through the middle (as in the app) */}
              {placement === "top" && (
                <span className="marquee" aria-hidden="true">
                  <span className="run"><span>{TITLE}</span><span>{TITLE}</span></span>
                </span>
              )}
              <Eq color={C.youtube} height={14} />
            </div>
            <div className="opened">
              <div className="art"><VideoCover /><span className="badge"><I.YouTubeLogo height={12} /></span></div>
              <div className="info">
                <div className="chip">YOUTUBE</div>
                <div className="t">Night Drive — synthwave mix</div>
                <div className="a">Neon Hours</div>
                <span className="track"><b style={{ width: `${(pos / (72 * 60 + 40)) * 100}%` }} /></span>
                <span className="times"><span>{fmt(pos)}</span><span>1:12:40</span></span>
                <span className="ctl"><I.Back size={12} /><I.Pause size={16} /><I.Fwd size={12} /></span>
              </div>
            </div>
          </div>
          <p className="mon-hint">Hover the island</p>
        </div>
      </div>
      <div className="stand" aria-hidden="true" />

      <div className="keys" role="group" aria-label="Where Wisp sits on the monitor">
        {placements.map((p) => (
          <button key={p.id} type="button" className="key" aria-pressed={placement === p.id} onClick={() => setPlacement(p.id)}>
            <span className="cap">
              <span className={`glyph ${p.id}`}><i /></span>
            </span>
            <span className="lbl">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
