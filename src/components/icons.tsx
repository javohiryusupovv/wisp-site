import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const AppleIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);

export const WindowsIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M3 5.1 10.4 4v7.2H3zM11.4 3.9 21 2.5v8.7h-9.6zM3 12.2h7.4v7.2L3 18.3zM11.4 12.2H21v8.7l-9.6-1.4z" />
  </svg>
);

export const TimerIcon = (p: P) => (
  <svg className="timer-ico" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M9.5 2.5h5" />
  </svg>
);

export const BoltIcon = (p: P) => (
  <svg className="bolt" viewBox="0 0 24 24" fill="#33D966" aria-hidden="true" {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>
);

export const SpeakerIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true" {...p}>
    <path d="M4 9h3.5L12 5v14l-4.5-4H4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true" {...p}>
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#fff" strokeWidth="1.6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowUpIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const Eq = ({ color, bars = 4 }: { color: string; bars?: number }) => (
  <span className="eq" style={{ ["--app" as string]: color }} aria-hidden="true">
    {Array.from({ length: bars }, (_, i) => <i key={i} />)}
  </span>
);
