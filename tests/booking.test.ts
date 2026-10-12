import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import { bookingCopy } from "@/lib/booking/copy";
import { addDays, groupSlotsByDay, interestFor, stockholmDate, utmFrom } from "@/lib/booking/format";
import { getBookableServices, getInquiryServices } from "@/lib/content";
import { bookingUrl, inquiryUrl, liaBookingUrl } from "@/lib/links";

describe("bokningstexter", () => {
  it.each(Object.entries(bookingCopy))("%s följer copy-reglerna", (_key, text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });
});

describe("bokningslänkar när HOA-bokningen är på", () => {
  it.each(getBookableServices().map((service) => service.slug))("%s bokas på houseofawesome.se", (slug) => {
    expect(bookingUrl(slug, "test", true)).toBe(`/boka/${slug}`);
  });

  it.each(getInquiryServices().map((service) => service.slug))("%s går till förfrågan med tjänsten", (slug) => {
    expect(inquiryUrl(slug, "card", true)).toBe(`/boka/forfragan?tjanst=${slug}`);
  });

  it("startsidan för bokning ligger på HOA", () => {
    expect(bookingUrl(null, "header", true)).toBe("/boka");
  });

  it("reservlänken går fortfarande till LIA med utm", () => {
    const url = new URL(liaBookingUrl("hbot-60", "booking_fallback"));
    expect(url.origin).toBe("https://lifeisawesome.se");
    expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
  });
});

describe("bokningshjälpare", () => {
  it("räknar dagar över månadsskifte", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-11-02", -7)).toBe("2026-10-26");
  });

  it("grupperar tider per dag i svensk tid", () => {
    const days = groupSlotsByDay([
      { start: "2026-11-02T23:30:00Z", end: "2026-11-03T00:30:00Z" },
      { start: "2026-11-02T08:00:00Z", end: "2026-11-02T09:00:00Z" },
    ]);
    expect(days.size).toBe(2);
    expect(days.get("2026-11-03")).toHaveLength(1);
    expect(stockholmDate(new Date("2026-11-02T23:30:00Z"))).toBe("2026-11-03");
  });

  it("förfrågan får samma intressekategori som i LIA:s formulär", () => {
    expect(interestFor("hbot-60")).toBe("hbot");
    expect(interestFor("ihht-50")).toBe("celloxy");
    expect(interestFor("coaching-45")).toBe("coaching");
    expect(interestFor("forsta-halsosamtal")).toBe("free_10min");
    expect(interestFor("vitamindropp")).toBe("other");
    expect(interestFor(null)).toBe("other");
  });

  it("tar bara med kända utm-parametrar", () => {
    expect(utmFrom("?utm_source=ig&utm_campaign=host&avboka=x&email=a@b.se")).toEqual({
      utm_source: "ig",
      utm_campaign: "host",
    });
  });
});
