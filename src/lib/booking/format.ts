import type { InterestType, Slot } from "@/lib/booking/api";

const TZ = "Europe/Stockholm";

/** YYYY-MM-DD i svensk tid. */
export function stockholmDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return date.toISOString().slice(0, 10);
}

export function formatDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
    .format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function groupSlotsByDay(slots: Slot[]): Map<string, Slot[]> {
  const days = new Map<string, Slot[]>();
  for (const slot of slots) {
    const day = stockholmDate(new Date(slot.start));
    days.set(day, [...(days.get(day) ?? []), slot]);
  }
  return days;
}

/** Samma intressekategorier som LIA:s förfrågningsformulär. */
export function interestFor(slug: string | null): InterestType {
  if (!slug) return "other";
  if (slug.startsWith("hbot")) return "hbot";
  if (slug.startsWith("ihht") || slug.includes("celloxy")) return "celloxy";
  if (slug.startsWith("coaching")) return "coaching";
  if (slug === "forsta-halsosamtal") return "free_10min";
  return "other";
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export function utmFrom(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 120);
  }
  return utm;
}
