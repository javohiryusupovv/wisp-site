// Small stand-ins for the SF Symbols the app uses, so the demo reads like the real notch.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const S = ({ size = 14, children, ...p }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>{children}</svg>
);

export const House = (p: P) => <S {...p}><path fill="currentColor" d="M12 3 2.5 11.2l1.3 1.5L5 11.7V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1v-8.3l1.2 1 1.3-1.5z" /></S>;
export const Tray = (p: P) => <S {...p}><path fill="currentColor" d="M5.4 4h13.2l2.9 9V19a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-6zm1.4 2-2.2 7H9a3 3 0 0 0 6 0h4.4l-2.2-7z" /></S>;
export const Clip = (p: P) => <S {...p}><path fill="currentColor" d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1zm1 2v2h4V4zM8 10v2h8v-2zm0 4v2h6v-2z" /></S>;
export const Timer = (p: P) => <S {...p}><g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.6 2M9.5 2.5h5" /></g></S>;
export const MoonStars = (p: P) => <S {...p}><path fill="currentColor" d="M13.5 3.2A8.5 8.5 0 1 0 21 14.6 7 7 0 0 1 13.5 3.2zM18 2l.7 1.8 1.8.7-1.8.7L18 7l-.7-1.8-1.8-.7 1.8-.7zm3 6 .5 1.2 1.2.5-1.2.5L21 11.4l-.5-1.2-1.2-.5 1.2-.5z" /></S>;
export const Sliders = (p: P) => <S {...p}><g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 7h10M17 7h4M3 17h4M11 17h10" /><circle cx="15" cy="7" r="2.2" fill="none" /><circle cx="9" cy="17" r="2.2" fill="none" /></g></S>;
export const Gear = (p: P) => <S {...p}><path fill="currentColor" d="m13.7 2 .5 2.5a7.6 7.6 0 0 1 1.9 1.1l2.4-.8 1.7 3-1.9 1.7a7.8 7.8 0 0 1 0 2.2l1.9 1.7-1.7 3-2.4-.8a7.6 7.6 0 0 1-1.9 1.1l-.5 2.5h-3.4l-.5-2.5a7.6 7.6 0 0 1-1.9-1.1l-2.4.8-1.7-3 1.9-1.7a7.8 7.8 0 0 1 0-2.2L3.8 7.8l1.7-3 2.4.8a7.6 7.6 0 0 1 1.9-1.1L10.3 2zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" /></S>;
export const Back = (p: P) => <S {...p}><path fill="currentColor" d="M11.5 6v12L3 12zm9.5 0v12l-8.5-6z" /></S>;
export const Fwd = (p: P) => <S {...p}><path fill="currentColor" d="M12.5 6v12L21 12zM3 6v12l8.5-6z" /></S>;
export const Pause = (p: P) => <S {...p}><path fill="currentColor" d="M6.5 4.5h4v15h-4zm7 0h4v15h-4z" /></S>;
export const Play = (p: P) => <S {...p}><path fill="currentColor" d="M7 4.5v15l12.5-7.5z" /></S>;
export const Speaker = (p: P) => <S {...p}><path fill="currentColor" d="M3 9h4l5-4.5v15L7 15H3z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.3 5.8a9 9 0 0 1 0 12.4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></S>;
export const SunMax = (p: P) => <S {...p}><circle cx="12" cy="12" r="4.6" fill="currentColor" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" /></S>;
export const SunMin = (p: P) => <S {...p}><circle cx="12" cy="12" r="4.3" fill="currentColor" /><g fill="currentColor"><circle cx="12" cy="4" r="1.2" /><circle cx="12" cy="20" r="1.2" /><circle cx="4" cy="12" r="1.2" /><circle cx="20" cy="12" r="1.2" /><circle cx="6.3" cy="6.3" r="1.2" /><circle cx="17.7" cy="17.7" r="1.2" /><circle cx="6.3" cy="17.7" r="1.2" /><circle cx="17.7" cy="6.3" r="1.2" /></g></S>;
export const SunHaze = (p: P) => <S {...p}><path fill="currentColor" d="M7 13a5 5 0 0 1 10 0z" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 3v2.5M4.6 6.6l1.7 1.7M19.4 6.6l-1.7 1.7M3 16h18M6 19.5h12" /></S>;
export const Sunrise = (p: P) => <S {...p}><path fill="currentColor" d="M6.5 16a5.5 5.5 0 0 1 11 0z" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" d="M3 19.5h18M12 2.5v5M9.5 5 12 2.5 14.5 5M4 11l1.6 1.2M20 11l-1.6 1.2" /></S>;
export const Sunset = (p: P) => <S {...p}><path fill="currentColor" d="M6.5 16a5.5 5.5 0 0 1 11 0z" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" d="M3 19.5h18M12 2.5v5M9.5 5 12 7.5 14.5 5M4 11l1.6 1.2M20 11l-1.6 1.2" /></S>;
export const Location = (p: P) => <S {...p}><path fill="currentColor" d="M21 3 3 10.5l7.5 3 3 7.5z" /></S>;
export const Bolt = (p: P) => <S {...p}><path fill="currentColor" d="M13.5 2 4.5 13.5h6.5L10 22l9.5-12H13z" /></S>;
export const Moon = (p: P) => <S {...p}><path fill="currentColor" d="M20.5 14.2A8.8 8.8 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" /></S>;
export const Cup = (p: P) => <S {...p}><path fill="currentColor" d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zm13 1.5h1.2a2.8 2.8 0 0 1 0 5.6H17v-2h1.2a.8.8 0 0 0 0-1.6H17zM3 20.5h15v1.5H3z" /></S>;
export const Mic = (p: P) => <S {...p}><rect x="8.5" y="2" width="7" height="12.5" rx="3.5" fill="currentColor" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></S>;
export const Camera = (p: P) => <S {...p}><path stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" /><circle cx="12" cy="12" r="3.5" fill="currentColor" /></S>;
export const Lock = (p: P) => <S {...p}><path fill="currentColor" d="M7 10V7.5a5 5 0 0 1 10 0V10h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10zm2.2 0h5.6V7.5a2.8 2.8 0 0 0-5.6 0z" /></S>;
export const Copy = (p: P) => <S {...p}><path fill="none" stroke="currentColor" strokeWidth="2" d="M8 8h11v13H8zM5 16H4V3h11v1" /></S>;
export const Minus = (p: P) => <S {...p}><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M6 12h12" /></S>;
export const Plus = (p: P) => <S {...p}><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M6 12h12M12 6v12" /></S>;
export const Reset = (p: P) => <S {...p}><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4" /></S>;

/** Telegram's round logo. */
export const TelegramLogo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
    <circle cx="12" cy="12" r="12" fill="#29ABED" />
    <path fill="#fff" d="M5.4 11.7 16.9 7.3c.5-.2 1 .1.8 1l-2 9.3c-.1.6-.5.8-1 .5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.4-.1l-6.9 4.3-3-.9c-.6-.2-.6-.6.3-1z" />
  </svg>
);

/** YouTube's red play badge. */
export const YouTubeLogo = ({ height = 18 }: { height?: number }) => (
  <svg width={height * 1.42} height={height} viewBox="0 0 28.4 20" aria-hidden="true">
    <rect width="28.4" height="20" rx="5.2" fill="#FF0033" />
    <path fill="#fff" d="M11.4 5.7v8.6l7.4-4.3z" />
  </svg>
);

export const prayerIcon = {
  fajr: SunHaze, sunrise: Sunrise, dhuhr: SunMax, asr: SunMin, maghrib: Sunset, isha: MoonStars,
} as const;
