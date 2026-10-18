import type { Slot } from "@/lib/booking/api";
import { addDays, stockholmDate } from "@/lib/booking/format";

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

/** Timrutor per dag: "YYYY-MM-DD" -> karta timme (0-23) -> slot. */
export function slotsByDayHour(slots: Slot[]): Map<string, Map<number, Slot>> {
  const out = new Map<string, Map<number, Slot>>();
  for (const slot of slots) {
    const date = new Date(slot.start);
    const day = stockholmDate(date);
    const hour = Number(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", hourCycle: "h23" }).format(date));
    if (!out.has(day)) out.set(day, new Map());
    out.get(day)!.set(hour, slot);
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
  cleaning: "15 min städtid ingår efter varje bokning.",
  cancelRule: "Avboka senast 24 h innan via länken i mejlet.",
  logout: "Logga ut",
} as const;
