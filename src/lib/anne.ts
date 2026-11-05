/** Bokningsadress för Annes personliga hälsointroduktion. Byt värdet när en egen bokningslänk finns. */
export const ANNE_BOOKING_URL = "/boka/forfragan?tjanst=anne-wevers";

/**
 * Underrad på /boka. Tar tid och pris ur den publicerade rubriken
 * («Personlig hälsointroduktion | 20 minuter · 95 €»). Saknas de, används fallback
 * (befintlig ingress) i stället för ett påhittat pris.
 */
export function anneRequestDetail(heading: string | undefined, fallback: string): string {
  const timed = (heading ?? "")
    .split("|")
    .map((part) => part.trim())
    .find((part) => /\d+\s*minuter\b/.test(part) && /€|\bkr\b/.test(part));
  return timed ?? fallback.trim();
}
