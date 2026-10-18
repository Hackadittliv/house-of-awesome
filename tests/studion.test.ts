import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import { dayHours, maxConsecutiveHours, mondayOf, slotsByDayHour, stockholmMidnightUtc, studionCopy, weekDays, weekRows } from "@/lib/booking/studion";

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
    const grid = slotsByDayHour([slot("2026-10-20T08:00:00.000Z")], ["2026-10-20"]);
    expect(grid.get("2026-10-20")?.has("10:00")).toBe(true);
  });

  it("vintertid 2026-10-25: 25 timmar, båda 02:00 behålls (UTC-nycklar)", () => {
    expect(stockholmMidnightUtc("2026-10-25")).toBe(Date.parse("2026-10-24T22:00:00Z"));
    const hours = dayHours("2026-10-25");
    expect(hours).toHaveLength(25);
    expect(hours.filter((h) => h.label === "02:00").map((h) => h.key)).toEqual(["02:00", "02:00#2"]);
    const first = "2026-10-25T00:00:00.000Z"; // 02:00 sommartid
    const second = "2026-10-25T01:00:00.000Z"; // 02:00 vintertid
    const grid = slotsByDayHour([slot(first), slot(second)], ["2026-10-25"]);
    expect(grid.get("2026-10-25")?.get("02:00")?.start).toBe(first);
    expect(grid.get("2026-10-25")?.get("02:00#2")?.start).toBe(second);
    const rows = weekRows(weekDays("2026-10-19")).map((r) => r.key);
    expect(rows).toHaveLength(25);
    expect(rows.indexOf("02:00#2")).toBe(rows.indexOf("02:00") + 1);
    expect(maxConsecutiveHours([slot(first), slot(second)], first)).toBe(2);
  });

  it("sommartid 2027-03-28: 23 timmar utan 02:00", () => {
    const hours = dayHours("2027-03-28");
    expect(hours).toHaveLength(23);
    expect(hours.some((h) => h.label === "02:00")).toBe(false);
  });

  it("bokning över midnatt: timmar i följd fortsätter in i nästa dygn", () => {
    const slots = ["2026-11-02T21:00:00.000Z", "2026-11-02T22:00:00.000Z", "2026-11-02T23:00:00.000Z", "2026-11-03T00:00:00.000Z"].map(slot);
    expect(maxConsecutiveHours(slots, slots[0].start)).toBe(4);
    const grid = slotsByDayHour(slots, ["2026-11-02", "2026-11-03"]);
    expect(grid.get("2026-11-02")?.has("23:00")).toBe(true);
    expect(grid.get("2026-11-03")?.has("01:00")).toBe(true);
  });

  it("räknar timmar i följd", () => {
    const slots = [slot("2026-10-20T08:00:00.000Z"), slot("2026-10-20T09:00:00.000Z"), slot("2026-10-20T11:00:00.000Z")];
    expect(maxConsecutiveHours(slots, "2026-10-20T08:00:00.000Z")).toBe(2);
    expect(maxConsecutiveHours(slots, "2026-10-20T11:00:00.000Z")).toBe(1);
  });
});

describe("studion login", () => {
  it("skapar aldrig nya LIA-konton (create_user: false)", async () => {
    const { vi } = await import("vitest");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendStudionLoginLink } = await import("@/lib/booking/api");
    await sendStudionLoginLink("a@example.com", "https://example.com/studion");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "a@example.com", create_user: false });
    vi.unstubAllGlobals();
  });
});
