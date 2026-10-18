import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import { maxConsecutiveHours, mondayOf, slotsByDayHour, studionCopy, weekDays } from "@/lib/booking/studion";

const slot = (start: string) => ({ start, end: new Date(new Date(start).getTime() + 3_600_000).toISOString() });

describe("studion", () => {
  it.each(Object.entries(studionCopy))("%s följer copy-reglerna", (_key, text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });

  it("hittar måndagen och sju dagar", () => {
    expect(mondayOf("2026-10-18")).toBe("2026-10-12");
    expect(mondayOf("2026-10-12")).toBe("2026-10-12");
    expect(weekDays("2026-10-12")).toHaveLength(7);
    expect(weekDays("2026-10-12")[6]).toBe("2026-10-18");
  });

  it("grupperar per dag och svensk timme", () => {
    const grid = slotsByDayHour([slot("2026-10-20T08:00:00.000Z")]);
    expect(grid.get("2026-10-20")?.has(10)).toBe(true);
  });

  it("räknar timmar i följd", () => {
    const slots = [slot("2026-10-20T08:00:00.000Z"), slot("2026-10-20T09:00:00.000Z"), slot("2026-10-20T11:00:00.000Z")];
    expect(maxConsecutiveHours(slots, "2026-10-20T08:00:00.000Z")).toBe(2);
    expect(maxConsecutiveHours(slots, "2026-10-20T11:00:00.000Z")).toBe(1);
  });
});
