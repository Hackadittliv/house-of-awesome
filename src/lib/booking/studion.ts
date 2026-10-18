import type { Slot } from "@/lib/booking/api";
import { addDays } from "@/lib/booking/format";

export const STUDION_MAX_HOURS = 12;
const HOUR = 3_600_000;

/** Måndag (YYYY-MM-DD) för veckan som innehåller datumet. */
export function mondayOf(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(); // 0 = sön
  return addDays(isoDate, -((weekday + 6) % 7));
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Stockholm",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function offsetMs(utcMs: number): number {
  const parts = PARTS.formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute")) - utcMs;
}

/** UTC-tid (ms) för svensk midnatt det datumet. */
export function stockholmMidnightUtc(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d);
  // Midnatt ligger aldrig i en sommartidsövergång i Sverige.
  return wall - offsetMs(wall - 2 * HOUR);
}

export type HourRow = { key: string; label: string };
export type DayHour = { key: string; label: string; startMs: number };

/**
 * Alla timmar ett svenskt dygn, räknat i UTC: 23, 24 eller 25 st. En timme som
 * upprepas när vintertiden börjar (02:00) får egen nyckel, "02:00#2".
 */
export function dayHours(isoDate: string): DayHour[] {
  const from = stockholmMidnightUtc(isoDate);
  const to = stockholmMidnightUtc(addDays(isoDate, 1));
  const seen = new Map<string, number>();
  const out: DayHour[] = [];
  for (let t = from; t < to; t += HOUR) {
    const label = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .format(new Date(t));
    const n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    out.push({ key: n === 1 ? label : `${label}#${n}`, label, startMs: t });
  }
  return out;
}

/** Rader för veckovyn: alla timnycklar som finns någon dag, i ordning. */
export function weekRows(days: string[]): HourRow[] {
  const rows = new Map<string, HourRow>();
  for (const day of days) for (const h of dayHours(day)) if (!rows.has(h.key)) rows.set(h.key, { key: h.key, label: h.label });
  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Timrutor per dag: "YYYY-MM-DD" -> karta timnyckel -> slot. Slots matchas på UTC-tid. */
export function slotsByDayHour(slots: Slot[], days: string[]): Map<string, Map<string, Slot>> {
  const byStart = new Map(slots.map((s) => [new Date(s.start).getTime(), s] as const));
  const out = new Map<string, Map<string, Slot>>();
  for (const day of days) {
    const cells = new Map<string, Slot>();
    for (const h of dayHours(day)) {
      const slot = byStart.get(h.startMs);
      if (slot) cells.set(h.key, slot);
    }
    out.set(day, cells);
  }
  return out;
}

/** Hur många timmar i följd som är lediga från en start (inkl. starten). */
export function maxConsecutiveHours(slots: Slot[], startIso: string, limit = STUDION_MAX_HOURS): number {
  const starts = new Set(slots.map((s) => new Date(s.start).getTime()));
  const start = new Date(startIso).getTime();
  let n = 0;
  while (n < limit && starts.has(start + n * HOUR)) n += 1;
  return n;
}

export const studionCopy = {
  title: "Studion",
  lead: "Hyr Studion per timme. För godkända instruktörer.",
  loginTitle: "Logga in",
  loginLead: "Skriv din e-post så skickar vi en inloggningslänk.",
  loginButton: "Skicka länk",
  loginSent: "Kolla din mejl och klicka på länken.",
  loginError: "Det gick ej att skicka länken. Försök igen.",
  notApproved: "Din e-post är ej godkänd för Studion än. Hör av dig till oss.",
  expired: "Du har loggats ut. Logga in igen.",
  prevWeek: "Förra veckan",
  nextWeek: "Nästa vecka",
  free: "Ledig",
  pickHint: "Välj en ledig timme.",
  hours: "Antal timmar",
  note: "Notering (valfri)",
  book: "Boka",
  booking: "Bokar…",
  booked: "Klart. Bekräftelsen kommer på mejl.",
  taken: "Tiden hann bli bokad. Välj en annan.",
  error: "Något gick fel. Försök igen.",
  loading: "Hämtar tider…",
  cleaning: "Städning ingår i timmen.",
  cancelRule: "Avboka senast 24 h innan via länken i mejlet.",
  logout: "Logga ut",
} as const;
