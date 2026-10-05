// Port of the app's PrayerCalculator (Sources/Wisp/Services/PrayerTimes.swift), so the demo shows
// today's real times. The app itself uses the official namozvaqti.uz table and falls back to this.
// Fajr 15.5°, Isha 15°, Hanafi Asr (shadow ×2), Dhuhr +5 min, Maghrib +2 min.

export type PrayerId = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const prayers: { id: PrayerId; title: string; isPrayer: boolean }[] = [
  { id: "fajr", title: "Fajr", isPrayer: true },
  { id: "sunrise", title: "Sunrise", isPrayer: false },
  { id: "dhuhr", title: "Dhuhr", isPrayer: true },
  { id: "asr", title: "Asr", isPrayer: true },
  { id: "maghrib", title: "Maghrib", isPrayer: true },
  { id: "isha", title: "Isha", isPrayer: true },
];

export const TASHKENT = { name: "Tashkent", lat: 41.2995, lon: 69.2401, tz: 5 };
const rad = Math.PI / 180;

function julianDay(year: number, month: number, day: number) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.trunc(y / 100), b = 2 - a + Math.trunc(a / 4);
  return Math.trunc(365.25 * (y + 4716)) + Math.trunc(30.6001 * (m + 1)) + day + b - 1524.5;
}

function sun(jd: number): [dec: number, eqt: number] {
  const d = jd - 2451545.0;
  const g = ((357.529 + 0.98560028 * d) % 360) * rad;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = ((q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) % 360) * rad;
  const e = (23.439 - 0.00000036 * d) * rad;
  let ra = (Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) / rad / 15) % 24;
  if (ra < 0) ra += 24;
  const dec = Math.asin(Math.sin(e) * Math.sin(l));
  let eqt = (q / 15 - ra + 12) % 24;
  if (eqt < 0) eqt += 24;
  return [dec, eqt - 12];
}

/** Times for the given city-local calendar day, as UTC epoch ms. */
export function prayerTimes(y: number, m: number, d: number, city = TASHKENT): Record<PrayerId, number> {
  const jd = julianDay(y, m, d) - city.lon / 360;
  const [dec, eqt] = sun(jd + 0.5);
  const noon = 12 + city.tz - city.lon / 15 - eqt;
  const lat = city.lat * rad;
  const hourAngle = (angle: number) =>
    Math.acos((-Math.sin(angle * rad) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / rad / 15;
  const asr = () => {
    const a = Math.atan(1 / (2 + Math.tan(Math.abs(lat - dec))));
    return Math.acos((Math.sin(a) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / rad / 15;
  };
  const rise = hourAngle(0.833);
  const hours: Record<PrayerId, number> = {
    fajr: noon - hourAngle(15.5),
    sunrise: noon - rise,
    dhuhr: noon + 5 / 60,
    asr: noon + asr(),
    maghrib: noon + rise + 2 / 60,
    isha: noon + hourAngle(15),
  };
  const midnightUtc = Date.UTC(y, m - 1, d) - city.tz * 3600_000;
  return Object.fromEntries(
    Object.entries(hours).map(([k, h]) => [k, midnightUtc + Math.round(h * 60) * 60_000]),
  ) as Record<PrayerId, number>;
}

/** City-local calendar date for an instant. */
export function localDate(now: number, city = TASHKENT) {
  const t = new Date(now + city.tz * 3600_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function today(now: number, city = TASHKENT) {
  const { y, m, d } = localDate(now, city);
  return prayerTimes(y, m, d, city);
}

/** Next prayer (sunrise included, as in the app's tab), rolling over to tomorrow's Bomdod. */
export function nextPrayer(now: number, city = TASHKENT): { id: PrayerId; title: string; time: number } {
  const t = today(now, city);
  for (const p of prayers) if (t[p.id] > now) return { id: p.id, title: p.title, time: t[p.id] };
  const { y, m, d } = localDate(now + 86400_000, city);
  return { id: "fajr", title: "Fajr", time: prayerTimes(y, m, d, city).fajr };
}

/** Next real prayer (not sunrise): what a reminder would be about. */
export function nextReminder(now: number, city = TASHKENT) {
  let n = nextPrayer(now, city);
  if (n.id === "sunrise") n = { id: "dhuhr", title: "Dhuhr", time: today(now, city).dhuhr };
  return n;
}

export const hhmm = (ms: number, city = TASHKENT) => {
  const t = new Date(ms + city.tz * 3600_000);
  return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
};

/** Same format as PrayerService.remainingString: "2 soat 14 daq" / "14 daq". */
export const remaining = (until: number, now: number) => {
  const min = Math.max(0, Math.ceil((until - now) / 60000));
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};
